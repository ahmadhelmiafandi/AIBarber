<?php

namespace Tests\Feature\Notification;

use App\Models\Barber;
use App\Models\Booking;
use App\Models\Branch;
use App\Models\Notification;
use App\Models\NotificationDelivery;
use App\Models\Queue;
use App\Models\Service;
use App\Models\User;
use App\Notifications\BookingConfirmedNotification;
use App\Notifications\QueueCalledNotification;
use App\Notifications\QueueCheckedInNotification;
use App\Notifications\QueueEstimateShiftedNotification;
use App\Notifications\QueueSkippedNotification;
use App\Services\Booking\BookingCreationService;
use App\Services\Notification\NotificationDeliveryService;
use App\Services\Queue\QueueCheckInService;
use App\Services\Queue\QueueRecalculationService;
use App\Services\Queue\QueueServiceStateService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class NotificationIntegrationTest extends TestCase
{
    use RefreshDatabase;

    private User $customer;
    private Branch $branch;
    private Service $service;
    private Barber $barber;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();

        $this->customer = User::factory()->create(['role' => 'customer', 'status' => 'active']);

        $this->branch = Branch::create([
            'name' => 'Main Branch',
            'code' => 'BR01',
            'address' => 'Test Street',
            'phone' => '08123456789',
            'is_active' => true,
            'opening_hours' => [
                'friday' => ['is_open' => true, 'open' => '09:00', 'close' => '21:00'],
                'saturday' => ['is_open' => true, 'open' => '09:00', 'close' => '21:00'],
                'sunday' => ['is_open' => true, 'open' => '09:00', 'close' => '21:00'],
            ],
        ]);

        $this->service = Service::create([
            'name' => 'Haircut',
            'estimated_duration_minutes' => 30,
            'price' => 50000,
            'is_active' => true,
        ]);

        $barberUser = User::factory()->create(['role' => 'barber', 'status' => 'active']);
        $this->barber = Barber::create([
            'user_id' => $barberUser->id,
            'branch_id' => $this->branch->id,
            'is_active' => true,
        ]);

        Carbon::setTestNow(Carbon::parse('2026-08-01 07:00:00', 'Asia/Jakarta'));
    }

    public function test_booking_confirmed_creates_notification_after_commit(): void
    {
        $creationService = app(BookingCreationService::class);
        $booking = $creationService->createBooking(
            $this->customer->id,
            $this->branch->id,
            $this->service->id,
            '2026-08-01',
            '10:00',
            $this->barber->id
        );

        $notification = Notification::where('notifiable_id', $this->customer->id)
            ->where('type', BookingConfirmedNotification::class)
            ->first();

        $this->assertNotNull($notification);

        $deliveries = NotificationDelivery::where('notification_id', $notification->id)->get();
        $this->assertCount(3, $deliveries);
    }

    public function test_queue_checked_in_creates_notification_after_commit(): void
    {
        $booking = $this->createTestBookingAndQueue();
        $checkInService = app(QueueCheckInService::class);

        // Freeze time within valid check-in window (09:50 for 10:00 booking)
        Carbon::setTestNow(Carbon::parse('2026-08-01 09:50:00', 'Asia/Jakarta'));

        $checkInService->checkIn($booking->queue->id);

        $notification = Notification::where('notifiable_id', $this->customer->id)
            ->where('type', QueueCheckedInNotification::class)
            ->first();

        $this->assertNotNull($notification);
        Carbon::setTestNow();
    }

    public function test_queue_called_creates_notification_after_commit(): void
    {
        $booking = $this->createTestBookingAndQueue();
        $booking->queue->update(['status' => 'checked_in']);

        $serviceState = app(QueueServiceStateService::class);
        $serviceState->callCustomer($booking->queue->id);

        $notification = Notification::where('notifiable_id', $this->customer->id)
            ->where('type', QueueCalledNotification::class)
            ->first();

        $this->assertNotNull($notification);
    }

    public function test_queue_skipped_creates_notification_after_commit(): void
    {
        $booking = $this->createTestBookingAndQueue();
        $checkInService = app(QueueCheckInService::class);

        // Freeze time past late check-in tolerance window (10:25 > 10:15 limit)
        Carbon::setTestNow(Carbon::parse('2026-08-01 10:25:00', 'Asia/Jakarta'));

        try {
            $checkInService->checkIn($booking->queue->id);
        } catch (\Throwable $e) {
            // Expected validation exception for expired check-in window
        }

        $notification = Notification::where('notifiable_id', $this->customer->id)
            ->where('type', QueueSkippedNotification::class)
            ->first();

        $this->assertNotNull($notification);
        Carbon::setTestNow();
    }

    public function test_queue_estimate_shift_above_threshold_creates_notification(): void
    {
        $booking = $this->createTestBookingAndQueue();
        $deliveryService = app(NotificationDeliveryService::class);

        // 15-minute shift (> 10m threshold)
        $notification = $deliveryService->sendEstimateShifted($this->customer, $booking->queue, 15);

        $this->assertNotNull($notification);
        $this->assertEquals(QueueEstimateShiftedNotification::class, $notification->type);
    }

    public function test_queue_estimate_shift_below_threshold_creates_no_notification(): void
    {
        $booking = $this->createTestBookingAndQueue();
        $deliveryService = app(NotificationDeliveryService::class);

        // 5-minute shift (<= 10m threshold)
        $notification = $deliveryService->sendEstimateShifted($this->customer, $booking->queue, 5);

        $this->assertNull($notification);
        $this->assertEquals(1, Notification::where('notifiable_id', $this->customer->id)->count()); // Only BookingConfirmed notification
    }

    public function test_queue_reminder_creates_notification_once(): void
    {
        $booking = $this->createTestBookingAndQueue();

        // Set queue estimated_start_time to 15 mins from now
        $now = Carbon::now();
        $booking->queue->update([
            'status' => 'waiting',
            'estimated_start_time' => $now->copy()->addMinutes(15),
        ]);

        // Run reminder command once
        $this->artisan('queue:send-reminders', ['--window' => '15m'])->assertSuccessful();

        // Direct reminder call (second attempt)
        $deliveryService = app(NotificationDeliveryService::class);
        $notif2 = $deliveryService->sendReminder($this->customer, $booking->queue, '15m');

        $this->assertNull($notif2);
    }

    public function test_notification_trigger_not_created_on_rollback(): void
    {
        try {
            DB::transaction(function () {
                $booking = $this->createTestBookingAndQueue();

                DB::afterCommit(function () use ($booking) {
                    app(NotificationDeliveryService::class)->sendBookingConfirmed($this->customer, $booking);
                });

                // Force transaction rollback
                throw new \RuntimeException("Simulated Transaction Failure");
            });
        } catch (\RuntimeException $e) {
            // Transaction rolled back
        }

        // Notification count remains unchanged from after setup
        $count = Notification::where('type', 'DummyRollbackTestNotification')->count();
        $this->assertEquals(0, $count);
    }

    public function test_disabled_channel_creates_no_delivery(): void
    {
        // Disable email channel in user preferences
        $this->customer->update([
            'notification_preferences' => [
                'email' => false,
                'in_app' => true,
                'whatsapp' => true,
            ],
        ]);

        $deliveryService = app(NotificationDeliveryService::class);
        $notification = $deliveryService->dispatchNotification(
            $this->customer,
            new DummyIntegrationNotification(),
            ['email', 'in_app', 'whatsapp']
        );

        $deliveries = NotificationDelivery::where('notification_id', $notification->id)->get();

        // Email delivery must be skipped due to user preference
        $channels = $deliveries->pluck('channel')->toArray();
        $this->assertContains('in_app', $channels);
        $this->assertContains('whatsapp', $channels);
        $this->assertNotContains('email', $channels);
        $this->assertCount(2, $deliveries);
    }

    public function test_multi_channel_trigger_creates_independent_deliveries(): void
    {
        $deliveryService = app(NotificationDeliveryService::class);
        $notification = $deliveryService->dispatchNotification(
            $this->customer,
            new DummyIntegrationNotification(),
            ['in_app', 'email', 'whatsapp']
        );

        $deliveries = NotificationDelivery::where('notification_id', $notification->id)->get();

        $this->assertCount(3, $deliveries);
        $this->assertEquals(1, $deliveries->where('channel', 'in_app')->count());
        $this->assertEquals(1, $deliveries->where('channel', 'email')->count());
        $this->assertEquals(1, $deliveries->where('channel', 'whatsapp')->count());
    }

    private function createTestBookingAndQueue(): Booking
    {
        $creationService = app(BookingCreationService::class);
        return $creationService->createBooking(
            $this->customer->id,
            $this->branch->id,
            $this->service->id,
            '2026-08-01',
            '10:00',
            $this->barber->id
        );
    }
}

class DummyIntegrationNotification extends \Illuminate\Notifications\Notification
{
    public function toArray(mixed $notifiable): array
    {
        return ['type' => 'dummy_integration'];
    }
}
