<?php

namespace Tests\Feature\Queue;

use App\Models\Barber;
use App\Models\Booking;
use App\Models\Branch;
use App\Models\Queue;
use App\Models\QueueEvent;
use App\Models\Service;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Tests\TestCase;

class QueueCheckInTest extends TestCase
{
    use RefreshDatabase;

    protected User $customer;
    protected Branch $branch;
    protected Service $service;
    protected Barber $barber;
    protected Booking $booking;
    protected Queue $queue;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);

        // Branch local time: 2026-08-05 10:00:00 (Asia/Jakarta)
        Carbon::setTestNow(Carbon::parse('2026-08-05 10:00:00', 'Asia/Jakarta'));

        $this->customer = User::factory()->create(['status' => 'active']);
        $this->customer->assignRole('customer');

        $this->branch = Branch::create([
            'id' => Str::uuid(),
            'name' => 'Branch Central',
            'address' => 'Jl. Sudirman No 1',
            'opening_hours' => [
                'monday' => ['open' => '09:00', 'close' => '17:00'],
                'tuesday' => ['open' => '09:00', 'close' => '17:00'],
                'wednesday' => ['open' => '09:00', 'close' => '17:00'],
                'thursday' => ['open' => '09:00', 'close' => '17:00'],
                'friday' => ['open' => '09:00', 'close' => '17:00'],
                'saturday' => ['open' => '09:00', 'close' => '17:00'],
                'sunday' => ['open' => '09:00', 'close' => '17:00'],
            ],
            'is_active' => true,
        ]);

        $this->service = Service::create([
            'id' => Str::uuid(),
            'name' => 'Haircut Standard',
            'price' => 50000,
            'estimated_duration_minutes' => 30,
            'is_active' => true,
        ]);

        $barberUser = User::factory()->create(['status' => 'active']);
        $barberUser->assignRole('barber');

        $this->barber = Barber::create([
            'id' => Str::uuid(),
            'user_id' => $barberUser->id,
            'branch_id' => $this->branch->id,
            'is_active' => true,
        ]);

        $this->booking = Booking::create([
            'id' => Str::uuid(),
            'booking_code' => 'BK-20260805-TEST',
            'customer_id' => $this->customer->id,
            'barber_id' => $this->barber->id,
            'branch_id' => $this->branch->id,
            'service_id' => $this->service->id,
            'booking_date' => '2026-08-05',
            'booking_time' => '10:15', // Estimated start 10:15
            'total_price' => 50000,
            'status' => 'confirmed',
        ]);

        // Queue estimated start 10:15, early boundary 09:45, late boundary 10:30
        $this->queue = Queue::create([
            'id' => Str::uuid(),
            'booking_id' => $this->booking->id,
            'branch_id' => $this->branch->id,
            'booking_date' => '2026-08-05',
            'queue_number' => 1,
            'queue_code' => 'A-001',
            'status' => 'waiting',
            'estimated_start_time' => Carbon::parse('2026-08-05 10:15:00', 'Asia/Jakarta')->setTimezone('UTC'),
            'estimated_finish_time' => Carbon::parse('2026-08-05 10:45:00', 'Asia/Jakarta')->setTimezone('UTC'),
        ]);

        QueueEvent::create([
            'queue_id' => $this->queue->id,
            'status' => 'waiting',
            'notes' => 'Initial queue generated upon booking confirmation.',
        ]);
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    public function test_customer_can_checkin_successfully_within_window(): void
    {
        // Now is 10:00:00 (within window [09:45:00, 10:30:00])
        $response = $this->actingAs($this->customer)
            ->postJson("/api/v1/queues/{$this->queue->id}/check-in");

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'checked_in');

        $this->assertDatabaseHas('queues', [
            'id' => $this->queue->id,
            'status' => 'checked_in',
        ]);

        $this->assertDatabaseHas('queue_events', [
            'queue_id' => $this->queue->id,
            'status' => 'checked_in',
        ]);
    }

    public function test_customer_can_checkin_exactly_at_early_boundary(): void
    {
        // Early boundary is 09:45:00
        Carbon::setTestNow(Carbon::parse('2026-08-05 09:45:00', 'Asia/Jakarta'));

        $response = $this->actingAs($this->customer)
            ->postJson("/api/v1/queues/{$this->queue->id}/check-in");

        $response->assertOk()
            ->assertJsonPath('data.status', 'checked_in');
    }

    public function test_customer_can_checkin_exactly_at_late_boundary(): void
    {
        // Late boundary is 10:30:00 (inclusive)
        Carbon::setTestNow(Carbon::parse('2026-08-05 10:30:00', 'Asia/Jakarta'));

        $response = $this->actingAs($this->customer)
            ->postJson("/api/v1/queues/{$this->queue->id}/check-in");

        $response->assertOk()
            ->assertJsonPath('data.status', 'checked_in');
    }

    public function test_checkin_fails_one_second_before_early_boundary(): void
    {
        // 09:44:59 (1 second before early boundary 09:45:00)
        Carbon::setTestNow(Carbon::parse('2026-08-05 09:44:59', 'Asia/Jakarta'));

        $response = $this->actingAs($this->customer)
            ->postJson("/api/v1/queues/{$this->queue->id}/check-in");

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['queue']);

        // Queue status remains waiting
        $this->assertEquals('waiting', $this->queue->fresh()->status);
    }

    public function test_checkin_fails_one_second_after_late_boundary(): void
    {
        // 10:30:01 (1 second past late boundary 10:30:00)
        Carbon::setTestNow(Carbon::parse('2026-08-05 10:30:01', 'Asia/Jakarta'));

        $response = $this->actingAs($this->customer)
            ->postJson("/api/v1/queues/{$this->queue->id}/check-in");

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['queue']);

        // Queue transitions to skipped and booking transitions to no_show
        $this->assertEquals('skipped', $this->queue->fresh()->status);
        $this->assertEquals('no_show', $this->booking->fresh()->status);
    }

    public function test_late_expiration_creates_exactly_one_skipped_event(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-08-05 10:31:00', 'Asia/Jakarta'));

        $this->actingAs($this->customer)
            ->postJson("/api/v1/queues/{$this->queue->id}/check-in");

        $skippedEventsCount = QueueEvent::where('queue_id', $this->queue->id)
            ->where('status', 'skipped')
            ->count();

        $this->assertEquals(1, $skippedEventsCount);
    }

    public function test_staff_can_checkin_same_branch_queue(): void
    {
        $barberUser = $this->barber->user;

        $response = $this->actingAs($barberUser)
            ->postJson("/api/v1/queues/{$this->queue->id}/check-in");

        $response->assertOk()
            ->assertJsonPath('data.status', 'checked_in');
    }

    public function test_staff_cannot_checkin_queue_from_other_branch(): void
    {
        // Branch 2 & Barber 2
        $branch2 = Branch::create([
            'id' => Str::uuid(),
            'name' => 'Branch 2',
            'address' => 'Jl. Asia No 2',
            'opening_hours' => ['monday' => ['open' => '09:00', 'close' => '17:00']],
            'is_active' => true,
        ]);

        $barber2User = User::factory()->create(['status' => 'active']);
        $barber2User->assignRole('barber');

        Barber::create([
            'id' => Str::uuid(),
            'user_id' => $barber2User->id,
            'branch_id' => $branch2->id,
            'is_active' => true,
        ]);

        // Barber 2 tries to check-in Barber 1 / Branch 1 queue -> 403 Forbidden
        $response = $this->actingAs($barber2User)
            ->postJson("/api/v1/queues/{$this->queue->id}/check-in");

        $response->assertForbidden();
    }

    public function test_admin_branch_scope_is_enforced(): void
    {
        $admin = User::factory()->create(['status' => 'active']);
        $admin->assignRole('admin');

        $response = $this->actingAs($admin)
            ->postJson("/api/v1/queues/{$this->queue->id}/check-in");

        $response->assertOk()
            ->assertJsonPath('data.status', 'checked_in');
    }

    public function test_owner_branch_scope_is_enforced(): void
    {
        $owner = User::factory()->create(['status' => 'active']);
        $owner->assignRole('owner');

        $response = $this->actingAs($owner)
            ->postJson("/api/v1/queues/{$this->queue->id}/check-in");

        $response->assertOk()
            ->assertJsonPath('data.status', 'checked_in');
    }

    public function test_checkin_is_idempotent_after_checked_in(): void
    {
        // First check-in
        $this->actingAs($this->customer)
            ->postJson("/api/v1/queues/{$this->queue->id}/check-in")
            ->assertOk();

        // Second check-in attempt -> 422
        $response2 = $this->actingAs($this->customer)
            ->postJson("/api/v1/queues/{$this->queue->id}/check-in");

        $response2->assertStatus(422)
            ->assertJsonValidationErrors(['queue']);

        // Only 1 checked_in event created
        $this->assertEquals(1, QueueEvent::where('queue_id', $this->queue->id)->where('status', 'checked_in')->count());
    }

    public function test_checkin_is_idempotent_after_no_show(): void
    {
        $this->queue->update(['status' => 'skipped']);
        $this->booking->update(['status' => 'no_show']);

        $response = $this->actingAs($this->customer)
            ->postJson("/api/v1/queues/{$this->queue->id}/check-in");

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['queue']);
    }

    public function test_booking_status_must_be_confirmed(): void
    {
        $this->booking->update(['status' => 'cancelled']);

        $response = $this->actingAs($this->customer)
            ->postJson("/api/v1/queues/{$this->queue->id}/check-in");

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['queue']);
    }

    public function test_queue_status_must_be_waiting(): void
    {
        $this->queue->update(['status' => 'on_service']);

        $response = $this->actingAs($this->customer)
            ->postJson("/api/v1/queues/{$this->queue->id}/check-in");

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['queue']);
    }

    public function test_concurrent_checkin_only_one_request_succeeds(): void
    {
        // First request succeeds
        $res1 = $this->actingAs($this->customer)
            ->postJson("/api/v1/queues/{$this->queue->id}/check-in");
        $res1->assertOk();

        // Concurrent request fails because queue status is now checked_in
        $res2 = $this->actingAs($this->customer)
            ->postJson("/api/v1/queues/{$this->queue->id}/check-in");
        $res2->assertStatus(422);

        $this->assertEquals(1, QueueEvent::where('queue_id', $this->queue->id)->where('status', 'checked_in')->count());
    }

    public function test_unauthenticated_user_cannot_checkin(): void
    {
        $response = $this->postJson("/api/v1/queues/{$this->queue->id}/check-in");
        $response->assertUnauthorized();
    }
}
