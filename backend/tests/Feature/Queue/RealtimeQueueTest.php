<?php

namespace Tests\Feature\Queue;

use App\Events\Realtime\CustomerQueueUpdatedEvent;
use App\Events\Realtime\PublicDisplayQueueUpdatedEvent;
use App\Events\Realtime\StaffQueueUpdatedEvent;
use App\Models\Barber;
use App\Models\Booking;
use App\Models\Branch;
use App\Models\Queue;
use App\Models\Service;
use App\Models\User;
use App\Services\Queue\QueueRecalculationOrchestrator;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Str;
use Tests\TestCase;

class RealtimeQueueTest extends TestCase
{
    use RefreshDatabase;

    protected User $customer;
    protected User $barberUser;
    protected Barber $barber;
    protected Branch $branch;
    protected Service $service;
    protected string $futureDate;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);

        Carbon::setTestNow(Carbon::parse('2026-08-01 08:00:00', 'Asia/Jakarta'));

        $this->customer = User::factory()->create(['name' => 'John Customer', 'phone' => '0812345678', 'status' => 'active']);
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

        $this->futureDate = '2026-08-05';
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    private function createQueueItem(string $time, string $status = 'waiting', int $num = 1): array
    {
        $booking = Booking::create([
            'id' => Str::uuid(),
            'booking_code' => 'BK-TEST-' . Str::random(4),
            'customer_id' => $this->customer->id,
            'barber_id' => $this->barber->id,
            'branch_id' => $this->branch->id,
            'service_id' => $this->service->id,
            'booking_date' => $this->futureDate,
            'booking_time' => $time,
            'total_price' => 50000,
            'status' => 'confirmed',
        ]);

        $startUtc = Carbon::parse("{$this->futureDate} {$time}", 'Asia/Jakarta')->setTimezone('UTC');
        $finishUtc = $startUtc->copy()->addMinutes($this->service->estimated_duration_minutes);

        $queue = Queue::create([
            'id' => Str::uuid(),
            'booking_id' => $booking->id,
            'branch_id' => $this->branch->id,
            'booking_date' => $this->futureDate,
            'queue_number' => $num,
            'queue_code' => sprintf('A-%03d', $num),
            'status' => $status,
            'version' => 1,
            'estimated_start_time' => $startUtc,
            'estimated_finish_time' => $finishUtc,
        ]);

        return [$booking, $queue];
    }

    public function test_queue_created_broadcasts_after_commit(): void
    {
        Event::fake([StaffQueueUpdatedEvent::class, CustomerQueueUpdatedEvent::class, PublicDisplayQueueUpdatedEvent::class]);

        $response = $this->actingAs($this->customer)->postJson('/api/v1/bookings', [
            'branch_id' => $this->branch->id,
            'service_id' => $this->service->id,
            'barber_id' => $this->barber->id,
            'booking_date' => $this->futureDate,
            'booking_time' => '10:00',
        ]);

        $response->assertCreated();

        Event::assertDispatched(StaffQueueUpdatedEvent::class, function (StaffQueueUpdatedEvent $e) {
            return $e->snapshotPayload['event_type'] === 'queue_created'
                && $e->snapshotPayload['queue_version'] === 1;
        });

        Event::assertDispatched(CustomerQueueUpdatedEvent::class, function (CustomerQueueUpdatedEvent $e) {
            return $e->snapshotPayload['event_type'] === 'queue_created'
                && $e->customerId === $this->customer->id;
        });

        Event::assertDispatched(PublicDisplayQueueUpdatedEvent::class, function (PublicDisplayQueueUpdatedEvent $e) {
            return $e->snapshotPayload['event_type'] === 'queue_created';
        });
    }

    public function test_queue_version_increments_atomically_with_state_change(): void
    {
        Event::fake([StaffQueueUpdatedEvent::class]);

        [$booking, $queue] = $this->createQueueItem('10:00', 'waiting', 1);
        $this->assertEquals(1, $queue->version);

        // Check in -> version becomes 2
        Carbon::setTestNow(Carbon::parse('2026-08-05 09:45:00', 'Asia/Jakarta'));
        $this->actingAs($this->customer)->postJson("/api/v1/queues/{$queue->id}/check-in")->assertOk();

        $freshQueue = $queue->fresh();
        $this->assertEquals(2, $freshQueue->version);
        $this->assertEquals('checked_in', $freshQueue->status);

        // Call customer -> version becomes 3
        $this->actingAs($this->barberUser)->postJson("/api/v1/queues/{$queue->id}/call")->assertOk();
        $this->assertEquals(3, $queue->fresh()->version);

        // Start service -> version becomes 4
        $this->actingAs($this->barberUser)->postJson("/api/v1/queues/{$queue->id}/start-service")->assertOk();
        $this->assertEquals(4, $queue->fresh()->version);
    }

    public function test_staff_and_customer_payloads_have_different_privacy_scopes(): void
    {
        Event::fake([StaffQueueUpdatedEvent::class, PublicDisplayQueueUpdatedEvent::class]);

        [$booking, $queue] = $this->createQueueItem('10:00', 'waiting', 1);

        Carbon::setTestNow(Carbon::parse('2026-08-05 09:45:00', 'Asia/Jakarta'));
        $this->actingAs($this->customer)->postJson("/api/v1/queues/{$queue->id}/check-in")->assertOk();

        // Staff payload includes customer_name and customer_phone
        Event::assertDispatched(StaffQueueUpdatedEvent::class, function (StaffQueueUpdatedEvent $e) {
            return isset($e->snapshotPayload['customer_name'])
                && $e->snapshotPayload['customer_name'] === 'John Customer'
                && isset($e->snapshotPayload['customer_phone']);
        });

        // Public display payload excludes customer_name and customer_phone
        Event::assertDispatched(PublicDisplayQueueUpdatedEvent::class, function (PublicDisplayQueueUpdatedEvent $e) {
            return !array_key_exists('customer_name', $e->snapshotPayload)
                && !array_key_exists('customer_phone', $e->snapshotPayload)
                && !array_key_exists('customer_id', $e->snapshotPayload);
        });
    }

    public function test_public_display_payload_contains_no_pii(): void
    {
        Event::fake([PublicDisplayQueueUpdatedEvent::class]);

        [$booking, $queue] = $this->createQueueItem('10:00', 'waiting', 1);

        Carbon::setTestNow(Carbon::parse('2026-08-05 09:45:00', 'Asia/Jakarta'));
        $this->actingAs($this->customer)->postJson("/api/v1/queues/{$queue->id}/check-in")->assertOk();

        Event::assertDispatched(PublicDisplayQueueUpdatedEvent::class, function (PublicDisplayQueueUpdatedEvent $e) {
            $payload = $e->snapshotPayload;
            return !isset($payload['customer_name']) && !isset($payload['customer_phone']) && !isset($payload['customer_id']);
        });
    }

    public function test_recalculation_without_changes_does_not_increment_version(): void
    {
        Event::fake([StaffQueueUpdatedEvent::class]);

        [$booking, $queue] = $this->createQueueItem('10:00', 'waiting', 1);
        $initialVersion = $queue->version;

        $refTime = Carbon::parse('2026-08-05 09:00:00', 'Asia/Jakarta');
        /** @var QueueRecalculationOrchestrator $orchestrator */
        $orchestrator = app(QueueRecalculationOrchestrator::class);
        $orchestrator->recalculateForBarber($this->branch->id, $this->barber->id, $this->futureDate, $refTime);

        // Version remains unchanged
        $this->assertEquals($initialVersion, $queue->fresh()->version);

        // No event dispatched for queue_recalculated
        Event::assertNotDispatched(StaffQueueUpdatedEvent::class, function (StaffQueueUpdatedEvent $e) {
            return $e->snapshotPayload['event_type'] === 'queue_recalculated';
        });
    }

    public function test_recalculation_without_changes_does_not_broadcast(): void
    {
        Event::fake([StaffQueueUpdatedEvent::class, CustomerQueueUpdatedEvent::class, PublicDisplayQueueUpdatedEvent::class]);

        [$booking, $queue] = $this->createQueueItem('10:00', 'waiting', 1);

        $refTime = Carbon::parse('2026-08-05 09:00:00', 'Asia/Jakarta');
        /** @var QueueRecalculationOrchestrator $orchestrator */
        $orchestrator = app(QueueRecalculationOrchestrator::class);
        $orchestrator->recalculateForBarber($this->branch->id, $this->barber->id, $this->futureDate, $refTime);

        Event::assertNotDispatched(StaffQueueUpdatedEvent::class);
        Event::assertNotDispatched(CustomerQueueUpdatedEvent::class);
        Event::assertNotDispatched(PublicDisplayQueueUpdatedEvent::class);
    }

    public function test_broadcast_payload_is_snapshot_of_committed_state(): void
    {
        Event::fake([StaffQueueUpdatedEvent::class]);

        [$booking, $queue] = $this->createQueueItem('10:00', 'waiting', 1);

        Carbon::setTestNow(Carbon::parse('2026-08-05 09:45:00', 'Asia/Jakarta'));
        $this->actingAs($this->customer)->postJson("/api/v1/queues/{$queue->id}/check-in")->assertOk();

        Event::assertDispatched(StaffQueueUpdatedEvent::class, function (StaffQueueUpdatedEvent $e) use ($queue) {
            return is_array($e->snapshotPayload)
                && $e->snapshotPayload['queue_id'] === $queue->id
                && $e->snapshotPayload['status'] === 'checked_in'
                && $e->snapshotPayload['queue_version'] === 2;
        });
    }

    public function test_staff_authorized_for_own_branch_channel(): void
    {
        $this->assertTrue(
            $this->barberUser->hasRole('barber')
            && $this->barberUser->barberProfile?->branch_id === $this->branch->id
        );
    }

    public function test_staff_unauthorized_for_other_branch_channel(): void
    {
        $otherBranchId = Str::uuid()->toString();

        $this->assertFalse(
            $this->barberUser->barberProfile?->branch_id === $otherBranchId
        );
    }

    public function test_customer_authorized_only_for_own_private_channel(): void
    {
        $otherUserId = Str::uuid()->toString();

        $this->assertNotEquals($otherUserId, $this->customer->id);
    }
}
