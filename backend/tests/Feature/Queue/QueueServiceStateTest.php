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

class QueueServiceStateTest extends TestCase
{
    use RefreshDatabase;

    protected User $customer;
    protected User $barberUser;
    protected Barber $barber;
    protected Branch $branch;
    protected Service $service;
    protected Booking $booking;
    protected Queue $queue;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);

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

        $this->barberUser = User::factory()->create(['status' => 'active']);
        $this->barberUser->assignRole('barber');

        $this->barber = Barber::create([
            'id' => Str::uuid(),
            'user_id' => $this->barberUser->id,
            'branch_id' => $this->branch->id,
            'is_active' => true,
        ]);

        $this->booking = Booking::create([
            'id' => Str::uuid(),
            'booking_code' => 'BK-20260805-STATE',
            'customer_id' => $this->customer->id,
            'barber_id' => $this->barber->id,
            'branch_id' => $this->branch->id,
            'service_id' => $this->service->id,
            'booking_date' => '2026-08-05',
            'booking_time' => '10:00',
            'total_price' => 50000,
            'status' => 'confirmed',
        ]);

        $this->queue = Queue::create([
            'id' => Str::uuid(),
            'booking_id' => $this->booking->id,
            'branch_id' => $this->branch->id,
            'booking_date' => '2026-08-05',
            'queue_number' => 1,
            'queue_code' => 'A-001',
            'status' => 'checked_in', // Already checked in for state transition tests
            'estimated_start_time' => Carbon::parse('2026-08-05 10:00:00', 'Asia/Jakarta')->setTimezone('UTC'),
            'estimated_finish_time' => Carbon::parse('2026-08-05 10:30:00', 'Asia/Jakarta')->setTimezone('UTC'),
        ]);

        QueueEvent::create([
            'queue_id' => $this->queue->id,
            'status' => 'checked_in',
            'notes' => 'Customer checked in.',
        ]);
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    public function test_barber_can_call_checkedin_customer(): void
    {
        $response = $this->actingAs($this->barberUser)
            ->postJson("/api/v1/queues/{$this->queue->id}/call");

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'called');

        $this->assertDatabaseHas('queues', [
            'id' => $this->queue->id,
            'status' => 'called',
        ]);

        $this->assertDatabaseHas('queue_events', [
            'queue_id' => $this->queue->id,
            'status' => 'called',
        ]);
    }

    public function test_barber_can_start_service_for_called_customer(): void
    {
        $this->queue->update(['status' => 'called']);

        $response = $this->actingAs($this->barberUser)
            ->postJson("/api/v1/queues/{$this->queue->id}/start-service");

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'on_service');

        $freshQueue = $this->queue->fresh();
        $this->assertEquals('on_service', $freshQueue->status);
        $this->assertNotNull($freshQueue->actual_start_time);
    }

    public function test_barber_can_complete_service_for_on_service_customer(): void
    {
        $this->queue->update([
            'status' => 'on_service',
            'actual_start_time' => Carbon::now('Asia/Jakarta')->setTimezone('UTC'),
        ]);

        $response = $this->actingAs($this->barberUser)
            ->postJson("/api/v1/queues/{$this->queue->id}/complete-service");

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'completed');

        $freshQueue = $this->queue->fresh();
        $freshBooking = $this->booking->fresh();

        $this->assertEquals('completed', $freshQueue->status);
        $this->assertEquals('completed', $freshBooking->status);
        $this->assertNotNull($freshQueue->actual_finish_time);
    }

    public function test_barber_can_transition_queue_of_other_barber_same_branch(): void
    {
        // Barber 2 at same branch
        $barber2User = User::factory()->create(['status' => 'active']);
        $barber2User->assignRole('barber');

        Barber::create([
            'id' => Str::uuid(),
            'user_id' => $barber2User->id,
            'branch_id' => $this->branch->id,
            'is_active' => true,
        ]);

        // Barber 2 calls Barber 1's queue -> Model B allows takeover within same branch
        $response = $this->actingAs($barber2User)
            ->postJson("/api/v1/queues/{$this->queue->id}/call");

        $response->assertOk()
            ->assertJsonPath('data.status', 'called');
    }

    public function test_barber_cannot_transition_queue_from_other_branch(): void
    {
        $branch2 = Branch::create([
            'id' => Str::uuid(),
            'name' => 'Branch West',
            'address' => 'Jl. Barat No 2',
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

        // Barber from Branch 2 tries to call Branch 1 queue -> 403 Forbidden
        $response = $this->actingAs($barber2User)
            ->postJson("/api/v1/queues/{$this->queue->id}/call");

        $response->assertForbidden();
    }

    public function test_receptionist_can_transition_same_branch_queue(): void
    {
        $receptionistUser = User::factory()->create(['status' => 'active']);
        $receptionistUser->assignRole('receptionist');

        Barber::create([
            'id' => Str::uuid(),
            'user_id' => $receptionistUser->id,
            'branch_id' => $this->branch->id,
            'is_active' => true,
        ]);

        $response = $this->actingAs($receptionistUser)
            ->postJson("/api/v1/queues/{$this->queue->id}/call");

        $response->assertOk()
            ->assertJsonPath('data.status', 'called');
    }

    public function test_receptionist_cannot_transition_queue_from_other_branch(): void
    {
        $branch2 = Branch::create([
            'id' => Str::uuid(),
            'name' => 'Branch South',
            'address' => 'Jl. Selatan No 3',
            'opening_hours' => ['monday' => ['open' => '09:00', 'close' => '17:00']],
            'is_active' => true,
        ]);

        $receptionistUser = User::factory()->create(['status' => 'active']);
        $receptionistUser->assignRole('receptionist');

        Barber::create([
            'id' => Str::uuid(),
            'user_id' => $receptionistUser->id,
            'branch_id' => $branch2->id,
            'is_active' => true,
        ]);

        $response = $this->actingAs($receptionistUser)
            ->postJson("/api/v1/queues/{$this->queue->id}/call");

        $response->assertForbidden();
    }

    public function test_call_fails_if_queue_is_waiting(): void
    {
        $this->queue->update(['status' => 'waiting']);

        $response = $this->actingAs($this->barberUser)
            ->postJson("/api/v1/queues/{$this->queue->id}/call");

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['queue']);
    }

    public function test_start_service_fails_if_queue_is_checkedin_without_call(): void
    {
        // Status is checked_in (not called yet)
        $response = $this->actingAs($this->barberUser)
            ->postJson("/api/v1/queues/{$this->queue->id}/start-service");

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['queue']);
    }

    public function test_complete_service_fails_if_queue_is_not_on_service(): void
    {
        // Status is checked_in (not on_service)
        $response = $this->actingAs($this->barberUser)
            ->postJson("/api/v1/queues/{$this->queue->id}/complete-service");

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['queue']);
    }

    public function test_start_service_sets_actual_start_time(): void
    {
        $this->queue->update(['status' => 'called']);

        $this->actingAs($this->barberUser)
            ->postJson("/api/v1/queues/{$this->queue->id}/start-service")
            ->assertOk();

        $queue = $this->queue->fresh();
        $this->assertNotNull($queue->actual_start_time);
    }

    public function test_actual_start_time_cannot_be_overwritten(): void
    {
        $initialStartTime = Carbon::parse('2026-08-05 10:05:00', 'Asia/Jakarta')->setTimezone('UTC');

        $this->queue->update([
            'status' => 'called',
            'actual_start_time' => $initialStartTime,
        ]);

        // Advance test time
        Carbon::setTestNow(Carbon::parse('2026-08-05 10:15:00', 'Asia/Jakarta'));

        $this->actingAs($this->barberUser)
            ->postJson("/api/v1/queues/{$this->queue->id}/start-service")
            ->assertOk();

        $freshQueue = $this->queue->fresh();
        // actual_start_time should remain original initialStartTime
        $this->assertEquals($initialStartTime->format('Y-m-d H:i:s'), $freshQueue->actual_start_time->format('Y-m-d H:i:s'));
    }

    public function test_complete_service_sets_actual_finish_time_and_completes_booking(): void
    {
        $this->queue->update([
            'status' => 'on_service',
            'actual_start_time' => Carbon::now('Asia/Jakarta')->setTimezone('UTC'),
        ]);

        $this->actingAs($this->barberUser)
            ->postJson("/api/v1/queues/{$this->queue->id}/complete-service")
            ->assertOk();

        $queue = $this->queue->fresh();
        $booking = $this->booking->fresh();

        $this->assertEquals('completed', $queue->status);
        $this->assertEquals('completed', $booking->status);
        $this->assertNotNull($queue->actual_finish_time);
    }

    public function test_booking_remains_confirmed_during_called(): void
    {
        $this->actingAs($this->barberUser)
            ->postJson("/api/v1/queues/{$this->queue->id}/call")
            ->assertOk();

        $this->assertEquals('confirmed', $this->booking->fresh()->status);
    }

    public function test_booking_remains_confirmed_during_on_service(): void
    {
        $this->queue->update(['status' => 'called']);

        $this->actingAs($this->barberUser)
            ->postJson("/api/v1/queues/{$this->queue->id}/start-service")
            ->assertOk();

        $this->assertEquals('confirmed', $this->booking->fresh()->status);
    }

    public function test_customer_cannot_trigger_service_state_transitions(): void
    {
        $this->actingAs($this->customer)
            ->postJson("/api/v1/queues/{$this->queue->id}/call")
            ->assertForbidden();

        $this->actingAs($this->customer)
            ->postJson("/api/v1/queues/{$this->queue->id}/start-service")
            ->assertForbidden();

        $this->actingAs($this->customer)
            ->postJson("/api/v1/queues/{$this->queue->id}/complete-service")
            ->assertForbidden();
    }

    public function test_concurrent_call_only_one_succeeds(): void
    {
        $res1 = $this->actingAs($this->barberUser)
            ->postJson("/api/v1/queues/{$this->queue->id}/call");
        $res1->assertOk();

        $res2 = $this->actingAs($this->barberUser)
            ->postJson("/api/v1/queues/{$this->queue->id}/call");
        $res2->assertStatus(422);

        $this->assertEquals(1, QueueEvent::where('queue_id', $this->queue->id)->where('status', 'called')->count());
    }

    public function test_concurrent_start_service_only_one_succeeds(): void
    {
        $this->queue->update(['status' => 'called']);

        $res1 = $this->actingAs($this->barberUser)
            ->postJson("/api/v1/queues/{$this->queue->id}/start-service");
        $res1->assertOk();

        $res2 = $this->actingAs($this->barberUser)
            ->postJson("/api/v1/queues/{$this->queue->id}/start-service");
        $res2->assertStatus(422);

        $this->assertEquals(1, QueueEvent::where('queue_id', $this->queue->id)->where('status', 'on_service')->count());
    }

    public function test_concurrent_complete_service_only_one_succeeds(): void
    {
        $this->queue->update([
            'status' => 'on_service',
            'actual_start_time' => Carbon::now('Asia/Jakarta')->setTimezone('UTC'),
        ]);

        $res1 = $this->actingAs($this->barberUser)
            ->postJson("/api/v1/queues/{$this->queue->id}/complete-service");
        $res1->assertOk();

        $res2 = $this->actingAs($this->barberUser)
            ->postJson("/api/v1/queues/{$this->queue->id}/complete-service");
        $res2->assertStatus(422);

        $this->assertEquals(1, QueueEvent::where('queue_id', $this->queue->id)->where('status', 'completed')->count());
    }

    public function test_queue_event_count_matches_successful_transitions(): void
    {
        // 1. Initial event from setUp = 1 (checked_in)

        // 2. Call
        $this->actingAs($this->barberUser)
            ->postJson("/api/v1/queues/{$this->queue->id}/call")
            ->assertOk();

        // 3. Start service
        $this->actingAs($this->barberUser)
            ->postJson("/api/v1/queues/{$this->queue->id}/start-service")
            ->assertOk();

        // 4. Complete service
        $this->actingAs($this->barberUser)
            ->postJson("/api/v1/queues/{$this->queue->id}/complete-service")
            ->assertOk();

        // Total events: checked_in (1), called (1), on_service (1), completed (1) = 4 events total
        $this->assertEquals(4, QueueEvent::where('queue_id', $this->queue->id)->count());
    }

    public function test_unauthenticated_user_cannot_access_transition_endpoints(): void
    {
        $this->postJson("/api/v1/queues/{$this->queue->id}/call")->assertUnauthorized();
        $this->postJson("/api/v1/queues/{$this->queue->id}/start-service")->assertUnauthorized();
        $this->postJson("/api/v1/queues/{$this->queue->id}/complete-service")->assertUnauthorized();
    }
}
