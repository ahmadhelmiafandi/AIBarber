<?php

namespace Tests\Feature\Queue;

use App\Models\Barber;
use App\Models\Booking;
use App\Models\Branch;
use App\Models\Notification;
use App\Models\Queue;
use App\Models\Service;
use App\Models\User;
use App\Services\Booking\BookingCreationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Tests\TestCase;

class BackendDependencyEndpointsTest extends TestCase
{
    use RefreshDatabase;

    private User $customer;
    private User $barberUser;
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

        $this->barberUser = User::factory()->create(['role' => 'barber', 'status' => 'active']);
        $this->barber = Barber::create([
            'user_id' => $this->barberUser->id,
            'branch_id' => $this->branch->id,
            'is_active' => true,
        ]);
    }

    public function test_get_active_queue_returns_customer_active_queue(): void
    {
        $booking = app(BookingCreationService::class)->createBooking(
            $this->customer->id,
            $this->branch->id,
            $this->service->id,
            '2026-08-01',
            '10:00',
            $this->barber->id
        );

        $response = $this->actingAs($this->customer, 'sanctum')
            ->getJson('/api/v1/queues/active');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.queue_id', $booking->queue->id)
            ->assertJsonPath('data.queue_position', 1)
            ->assertJsonPath('data.customers_ahead', 0);
    }

    public function test_get_queue_by_id_returns_details_and_position(): void
    {
        $booking = app(BookingCreationService::class)->createBooking(
            $this->customer->id,
            $this->branch->id,
            $this->service->id,
            '2026-08-01',
            '10:00',
            $this->barber->id
        );

        $response = $this->actingAs($this->customer, 'sanctum')
            ->getJson("/api/v1/queues/{$booking->queue->id}");

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.queue_id', $booking->queue->id)
            ->assertJsonPath('data.queue_position', 1)
            ->assertJsonPath('data.customers_ahead', 0);
    }

    public function test_get_branch_queues_returns_daily_feed(): void
    {
        app(BookingCreationService::class)->createBooking(
            $this->customer->id,
            $this->branch->id,
            $this->service->id,
            '2026-08-01',
            '10:00',
            $this->barber->id
        );

        $response = $this->actingAs($this->barberUser, 'sanctum')
            ->getJson("/api/v1/branches/{$this->branch->id}/queues?date=2026-08-01");

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(1, 'data');
    }

    public function test_get_notifications_returns_user_notification_list(): void
    {
        Notification::create([
            'id' => (string) Str::uuid(),
            'type' => 'TestNotification',
            'notifiable_type' => User::class,
            'notifiable_id' => $this->customer->id,
            'data' => json_encode(['message' => 'Your queue is ready']),
        ]);

        $response = $this->actingAs($this->customer, 'sanctum')
            ->getJson('/api/v1/notifications');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(1, 'data');
    }

    public function test_mark_notification_as_read(): void
    {
        $notification = Notification::create([
            'id' => (string) Str::uuid(),
            'type' => 'TestNotification',
            'notifiable_type' => User::class,
            'notifiable_id' => $this->customer->id,
            'data' => json_encode(['message' => 'Your queue is ready']),
        ]);

        $response = $this->actingAs($this->customer, 'sanctum')
            ->postJson("/api/v1/notifications/{$notification->id}/read");

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertNotNull($notification->fresh()->read_at);
    }
}
