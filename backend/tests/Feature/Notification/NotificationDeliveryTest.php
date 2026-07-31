<?php

namespace Tests\Feature\Notification;

use App\Models\Notification;
use App\Models\NotificationDelivery;
use App\Models\Queue;
use App\Models\User;
use App\Policies\WhatsAppRateLimitPolicy;
use App\Services\Notification\Channels\EmailChannel;
use App\Services\Notification\Channels\WhatsAppChannel;
use App\Services\Notification\NotificationDeliveryService;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Tests\TestCase;

class NotificationDeliveryTest extends TestCase
{
    use RefreshDatabase;

    private NotificationDeliveryService $service;
    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new NotificationDeliveryService();
        $this->user = User::factory()->create();

        // Reset channel failure resolvers and cache
        EmailChannel::$shouldFailResolver = null;
        WhatsAppChannel::$shouldFailResolver = null;
        Cache::flush();
    }

    public function test_idempotency_is_scoped_per_channel(): void
    {
        $notification = Notification::create([
            'id' => (string) Str::uuid(),
            'type' => 'TestNotification',
            'notifiable_type' => User::class,
            'notifiable_id' => $this->user->id,
            'data' => json_encode(['msg' => 'hello']),
        ]);

        $deliveries = $this->service->createDeliveries($notification, ['in_app', 'email', 'whatsapp']);

        $this->assertCount(3, $deliveries);

        // Process in_app channel
        $successInApp = $this->service->processDelivery($deliveries[0], $this->user, []);
        $this->assertTrue($successInApp);

        // Verify email & whatsapp remain pending and ready for independent processing
        $deliveries[1]->refresh();
        $deliveries[2]->refresh();
        $this->assertEquals(NotificationDelivery::STATUS_PENDING, $deliveries[1]->status);
        $this->assertEquals(NotificationDelivery::STATUS_PENDING, $deliveries[2]->status);

        // Process email channel independently
        $successEmail = $this->service->processDelivery($deliveries[1], $this->user, []);
        $this->assertTrue($successEmail);
    }

    public function test_failed_delivery_can_retry_after_idempotency_reservation(): void
    {
        $notification = Notification::create([
            'id' => (string) Str::uuid(),
            'type' => 'TestNotification',
            'notifiable_type' => User::class,
            'notifiable_id' => $this->user->id,
            'data' => json_encode(['msg' => 'retry_test']),
        ]);

        $delivery = NotificationDelivery::create([
            'notification_id' => $notification->id,
            'channel' => 'email',
            'status' => NotificationDelivery::STATUS_PENDING,
            'attempts' => 0,
        ]);

        // 1st Attempt fails
        EmailChannel::$shouldFailResolver = fn() => true;
        $result1 = $this->service->processDelivery($delivery, $this->user, []);
        $this->assertFalse($result1);

        $delivery->refresh();
        $this->assertEquals(NotificationDelivery::STATUS_FAILED, $delivery->status);
        $this->assertEquals(1, $delivery->attempts);
        $this->assertNotNull($delivery->failed_at);

        // 2nd Attempt (Retry) succeeds after clearing failure
        EmailChannel::$shouldFailResolver = fn() => false;
        $result2 = $this->service->processDelivery($delivery, $this->user, []);
        $this->assertTrue($result2);

        $delivery->refresh();
        $this->assertEquals(NotificationDelivery::STATUS_SENT, $delivery->status);
        $this->assertEquals(2, $delivery->attempts);
        $this->assertNotNull($delivery->sent_at);
    }

    public function test_successful_delivery_cannot_be_sent_twice(): void
    {
        $notification = Notification::create([
            'id' => (string) Str::uuid(),
            'type' => 'TestNotification',
            'notifiable_type' => User::class,
            'notifiable_id' => $this->user->id,
            'data' => json_encode(['msg' => 'single_send_test']),
        ]);

        $delivery = NotificationDelivery::create([
            'notification_id' => $notification->id,
            'channel' => 'in_app',
            'status' => NotificationDelivery::STATUS_PENDING,
            'attempts' => 0,
        ]);

        $res1 = $this->service->processDelivery($delivery, $this->user, []);
        $this->assertTrue($res1);

        $delivery->refresh();
        $this->assertEquals(NotificationDelivery::STATUS_SENT, $delivery->status);
        $this->assertEquals(1, $delivery->attempts);

        // Attempting to send again must be prevented by DB status check
        $res2 = $this->service->processDelivery($delivery, $this->user, []);
        $this->assertFalse($res2);

        $delivery->refresh();
        $this->assertEquals(1, $delivery->attempts);
    }

    public function test_notification_delivery_has_unique_channel_constraint(): void
    {
        $notification = Notification::create([
            'id' => (string) Str::uuid(),
            'type' => 'TestNotification',
            'notifiable_type' => User::class,
            'notifiable_id' => $this->user->id,
            'data' => json_encode([]),
        ]);

        NotificationDelivery::create([
            'notification_id' => $notification->id,
            'channel' => 'email',
            'status' => NotificationDelivery::STATUS_PENDING,
            'attempts' => 0,
        ]);

        $this->expectException(QueryException::class);

        NotificationDelivery::create([
            'notification_id' => $notification->id,
            'channel' => 'email',
            'status' => NotificationDelivery::STATUS_PENDING,
            'attempts' => 0,
        ]);
    }

    public function test_delivery_status_transitions_correctly(): void
    {
        $notification = Notification::create([
            'id' => (string) Str::uuid(),
            'type' => 'TestNotification',
            'notifiable_type' => User::class,
            'notifiable_id' => $this->user->id,
            'data' => json_encode([]),
        ]);

        $delivery = NotificationDelivery::create([
            'notification_id' => $notification->id,
            'channel' => 'email',
            'status' => NotificationDelivery::STATUS_PENDING,
            'attempts' => 0,
        ]);

        $this->assertEquals(NotificationDelivery::STATUS_PENDING, $delivery->status);
        $this->assertEquals(0, $delivery->attempts);
        $this->assertNull($delivery->sent_at);
        $this->assertNull($delivery->failed_at);

        $this->service->processDelivery($delivery, $this->user, []);

        $delivery->refresh();
        $this->assertEquals(NotificationDelivery::STATUS_SENT, $delivery->status);
        $this->assertEquals(1, $delivery->attempts);
        $this->assertNotNull($delivery->sent_at);
        $this->assertNotNull($delivery->provider_message_id);
    }

    public function test_reminder_window_is_idempotent(): void
    {
        $queue = new Queue();
        $queue->id = (string) Str::uuid();
        $queue->queue_number = 42;

        // First run of scheduler for 15m window
        $notif1 = $this->service->sendReminder($this->user, $queue, '15m');
        $this->assertNotNull($notif1);

        // Second run of scheduler for 15m window (multiple scheduler runs)
        $notif2 = $this->service->sendReminder($this->user, $queue, '15m');
        $this->assertNull($notif2);

        // Verify only 1 parent notification record exists
        $this->assertEquals(1, Notification::where('notifiable_id', $this->user->id)->count());
    }

    public function test_whatsapp_daily_limit_is_enforced(): void
    {
        $policy = new WhatsAppRateLimitPolicy();

        // Send 5 messages (up to daily limit)
        for ($i = 1; $i <= 5; $i++) {
            $notification = Notification::create([
                'id' => (string) Str::uuid(),
                'type' => 'TestNotification',
                'notifiable_type' => User::class,
                'notifiable_id' => $this->user->id,
                'data' => json_encode(['count' => $i]),
            ]);

            $delivery = NotificationDelivery::create([
                'notification_id' => $notification->id,
                'channel' => 'whatsapp',
                'status' => NotificationDelivery::STATUS_PENDING,
                'attempts' => 0,
            ]);

            $success = $this->service->processDelivery($delivery, $this->user, []);
            $this->assertTrue($success);
        }

        $this->assertEquals(5, $policy->getCount($this->user->id));

        // 6th message should be blocked by rate limit policy
        $notification6 = Notification::create([
            'id' => (string) Str::uuid(),
            'type' => 'TestNotification',
            'notifiable_type' => User::class,
            'notifiable_id' => $this->user->id,
            'data' => json_encode(['count' => 6]),
        ]);

        $delivery6 = NotificationDelivery::create([
            'notification_id' => $notification6->id,
            'channel' => 'whatsapp',
            'status' => NotificationDelivery::STATUS_PENDING,
            'attempts' => 0,
        ]);

        $success6 = $this->service->processDelivery($delivery6, $this->user, []);
        $this->assertFalse($success6);

        $delivery6->refresh();
        $this->assertEquals(NotificationDelivery::STATUS_FAILED, $delivery6->status);
        $this->assertStringContainsString('Daily WhatsApp rate limit reached', $delivery6->error_log);
    }

    public function test_same_notification_can_be_delivered_to_multiple_channels(): void
    {
        $notification = Notification::create([
            'id' => (string) Str::uuid(),
            'type' => 'TestNotification',
            'notifiable_type' => User::class,
            'notifiable_id' => $this->user->id,
            'data' => json_encode([]),
        ]);

        $deliveries = $this->service->createDeliveries($notification, ['in_app', 'email', 'whatsapp']);
        $this->assertCount(3, $deliveries);

        foreach ($deliveries as $delivery) {
            $this->service->processDelivery($delivery, $this->user, []);
        }

        $sentCount = NotificationDelivery::where('notification_id', $notification->id)
            ->where('status', NotificationDelivery::STATUS_SENT)
            ->count();

        $this->assertEquals(3, $sentCount);
    }

    public function test_email_failure_does_not_block_whatsapp(): void
    {
        EmailChannel::$shouldFailResolver = fn() => true;

        $notificationModel = $this->service->dispatchNotification(
            $this->user,
            new DummyNotification(),
            ['email', 'whatsapp', 'in_app']
        );

        $deliveries = NotificationDelivery::where('notification_id', $notificationModel->id)->get()->keyBy('channel');

        $this->assertEquals(NotificationDelivery::STATUS_FAILED, $deliveries['email']->status);
        $this->assertEquals(NotificationDelivery::STATUS_SENT, $deliveries['whatsapp']->status);
        $this->assertEquals(NotificationDelivery::STATUS_SENT, $deliveries['in_app']->status);
    }

    public function test_whatsapp_failure_does_not_block_in_app(): void
    {
        WhatsAppChannel::$shouldFailResolver = fn() => true;

        $notificationModel = $this->service->dispatchNotification(
            $this->user,
            new DummyNotification(),
            ['whatsapp', 'in_app', 'email']
        );

        $deliveries = NotificationDelivery::where('notification_id', $notificationModel->id)->get()->keyBy('channel');

        $this->assertEquals(NotificationDelivery::STATUS_FAILED, $deliveries['whatsapp']->status);
        $this->assertEquals(NotificationDelivery::STATUS_SENT, $deliveries['in_app']->status);
        $this->assertEquals(NotificationDelivery::STATUS_SENT, $deliveries['email']->status);
    }
}

class DummyNotification extends \Illuminate\Notifications\Notification
{
    public function toArray(mixed $notifiable): array
    {
        return ['type' => 'dummy'];
    }
}
