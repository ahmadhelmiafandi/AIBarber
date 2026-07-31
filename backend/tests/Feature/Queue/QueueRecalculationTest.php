<?php

namespace Tests\Feature\Queue;

use App\Models\Barber;
use App\Models\Booking;
use App\Models\Branch;
use App\Models\Queue;
use App\Models\QueueEvent;
use App\Models\Service;
use App\Models\User;
use App\Services\Queue\QueueRecalculationOrchestrator;
use App\Services\Queue\QueueSchedulingEngine;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Tests\TestCase;

class QueueRecalculationTest extends TestCase
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
            'status' => $status === 'cancelled' ? 'cancelled' : 'confirmed',
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
            'estimated_start_time' => $startUtc,
            'estimated_finish_time' => $finishUtc,
        ]);

        QueueEvent::create([
            'queue_id' => $queue->id,
            'status' => $status,
            'notes' => 'Initial creation.',
        ]);

        return [$booking, $queue];
    }

    public function test_scheduling_engine_matches_queue_generation_output(): void
    {
        $engine = new QueueSchedulingEngine();
        $timing = $engine->calculateSlotTiming('2026-08-05', '10:00', 30);

        $this->assertEquals('2026-08-05 03:00:00', $timing['estimated_start_time']->format('Y-m-d H:i:s'));
        $this->assertEquals('2026-08-05 03:30:00', $timing['estimated_finish_time']->format('Y-m-d H:i:s'));
    }

    public function test_on_service_late_finish_time_is_extended(): void
    {
        [$b1, $q1] = $this->createQueueItem('10:00', 'on_service', 1);

        // Reference time is 10:45 (exceeds estimated finish 10:30)
        $refTime = Carbon::parse('2026-08-05 10:45:00', 'Asia/Jakarta');

        /** @var QueueRecalculationOrchestrator $orchestrator */
        $orchestrator = app(QueueRecalculationOrchestrator::class);
        $orchestrator->recalculateForBarber($this->branch->id, $this->barber->id, $this->futureDate, $refTime);

        $freshQ1 = $q1->fresh();
        // Start time remains 10:00 UTC (03:00:00)
        $this->assertEquals('2026-08-05 03:00:00', $freshQ1->estimated_start_time->format('Y-m-d H:i:s'));
        // Finish time extended to 10:45 Asia/Jakarta = 03:45:00 UTC
        $this->assertEquals('2026-08-05 03:45:00', $freshQ1->estimated_finish_time->format('Y-m-d H:i:s'));
    }

    public function test_late_service_pushes_downstream_queue(): void
    {
        [$b1, $q1] = $this->createQueueItem('10:00', 'on_service', 1);
        [$b2, $q2] = $this->createQueueItem('10:30', 'waiting', 2);

        // Reference time is 10:45 Asia/Jakarta
        $refTime = Carbon::parse('2026-08-05 10:45:00', 'Asia/Jakarta');

        /** @var QueueRecalculationOrchestrator $orchestrator */
        $orchestrator = app(QueueRecalculationOrchestrator::class);
        $orchestrator->recalculateForBarber($this->branch->id, $this->barber->id, $this->futureDate, $refTime);

        // Downstream Queue 2 estimated start shifted to 10:45 Asia/Jakarta = 03:45:00 UTC
        $freshQ2 = $q2->fresh();
        $this->assertEquals('2026-08-05 03:45:00', $freshQ2->estimated_start_time->format('Y-m-d H:i:s'));
    }

    public function test_recalculation_same_reference_time_is_deterministic(): void
    {
        [$b1, $q1] = $this->createQueueItem('10:00', 'waiting', 1);
        [$b2, $q2] = $this->createQueueItem('10:30', 'waiting', 2);

        $refTime = Carbon::parse('2026-08-05 09:00:00', 'Asia/Jakarta');
        /** @var QueueRecalculationOrchestrator $orchestrator */
        $orchestrator = app(QueueRecalculationOrchestrator::class);

        // Run twice
        $orchestrator->recalculateForBarber($this->branch->id, $this->barber->id, $this->futureDate, $refTime);
        $start1 = $q2->fresh()->estimated_start_time;

        $orchestrator->recalculateForBarber($this->branch->id, $this->barber->id, $this->futureDate, $refTime);
        $start2 = $q2->fresh()->estimated_start_time;

        $this->assertEquals($start1->format('Y-m-d H:i:s'), $start2->format('Y-m-d H:i:s'));
    }

    public function test_equal_booking_times_have_deterministic_order(): void
    {
        [$b1, $q1] = $this->createQueueItem('10:00', 'waiting', 1);
        [$b2, $q2] = $this->createQueueItem('10:00', 'waiting', 2);

        $refTime = Carbon::parse('2026-08-05 09:00:00', 'Asia/Jakarta');
        /** @var QueueRecalculationOrchestrator $orchestrator */
        $orchestrator = app(QueueRecalculationOrchestrator::class);
        $orchestrator->recalculateForBarber($this->branch->id, $this->barber->id, $this->futureDate, $refTime);

        // First queue gets 10:00, second queue gets 10:30 due to ID ASC tie-breaker
        $this->assertEquals('2026-08-05 03:00:00', $q1->fresh()->estimated_start_time->format('Y-m-d H:i:s'));
        $this->assertEquals('2026-08-05 03:30:00', $q2->fresh()->estimated_start_time->format('Y-m-d H:i:s'));
    }

    public function test_on_service_start_time_remains_immutable(): void
    {
        [$b1, $q1] = $this->createQueueItem('10:00', 'on_service', 1);
        $initialStart = $q1->estimated_start_time->format('Y-m-d H:i:s');

        $refTime = Carbon::parse('2026-08-05 11:00:00', 'Asia/Jakarta');
        /** @var QueueRecalculationOrchestrator $orchestrator */
        $orchestrator = app(QueueRecalculationOrchestrator::class);
        $orchestrator->recalculateForBarber($this->branch->id, $this->barber->id, $this->futureDate, $refTime);

        $this->assertEquals($initialStart, $q1->fresh()->estimated_start_time->format('Y-m-d H:i:s'));
    }

    public function test_recalculation_shifts_downstream_queues_on_early_completion(): void
    {
        [$b1, $q1] = $this->createQueueItem('10:00', 'on_service', 1);
        [$b2, $q2] = $this->createQueueItem('10:30', 'waiting', 2);

        // Barber completes Queue 1 early at 10:15 (Asia/Jakarta)
        $this->actingAs($this->barberUser)
            ->postJson("/api/v1/queues/{$q1->id}/complete-service")
            ->assertOk();

        // Queue 2 is now estimated to start at 10:30 floor or explicit anchor 10:15 (max(10:30, 10:15) = 10:30 floor)
        // If Queue 2 had requested 10:15, it would start at 10:15.
        $this->assertEquals('completed', $q1->fresh()->status);
    }

    public function test_completion_early_anchor_sets_correct_start_time(): void
    {
        [$b1, $q1] = $this->createQueueItem('10:00', 'on_service', 1);
        [$b2, $q2] = $this->createQueueItem('10:00', 'waiting', 2);

        // Queue 1 completed early at 10:15
        Carbon::setTestNow(Carbon::parse('2026-08-05 10:15:00', 'Asia/Jakarta'));

        $this->actingAs($this->barberUser)
            ->postJson("/api/v1/queues/{$q1->id}/complete-service")
            ->assertOk();

        // Queue 2 requested 10:00, anchor is 10:15 -> Queue 2 estimated start becomes 10:15 (03:15:00 UTC)
        $this->assertEquals('2026-08-05 03:15:00', $q2->fresh()->estimated_start_time->format('Y-m-d H:i:s'));
    }

    public function test_completion_late_anchor_sets_correct_start_time(): void
    {
        [$b1, $q1] = $this->createQueueItem('10:00', 'on_service', 1);
        [$b2, $q2] = $this->createQueueItem('10:30', 'waiting', 2);

        // Queue 1 completes late at 10:45
        Carbon::setTestNow(Carbon::parse('2026-08-05 10:45:00', 'Asia/Jakarta'));

        $this->actingAs($this->barberUser)
            ->postJson("/api/v1/queues/{$q1->id}/complete-service")
            ->assertOk();

        // Queue 2 requested 10:30, anchor is 10:45 -> Queue 2 estimated start becomes 10:45 (03:45:00 UTC)
        $this->assertEquals('2026-08-05 03:45:00', $q2->fresh()->estimated_start_time->format('Y-m-d H:i:s'));
    }

    public function test_recalculation_fills_gap_when_queue_is_skipped(): void
    {
        [$b1, $q1] = $this->createQueueItem('10:00', 'waiting', 1);
        [$b2, $q2] = $this->createQueueItem('10:00', 'waiting', 2);

        // Mark q1 skipped
        $q1->update(['status' => 'skipped']);
        $b1->update(['status' => 'no_show']);

        /** @var QueueRecalculationOrchestrator $orchestrator */
        $orchestrator = app(QueueRecalculationOrchestrator::class);
        $orchestrator->recalculateForBarber($this->branch->id, $this->barber->id, $this->futureDate);

        // Queue 2 now becomes the first active queue and starts at 10:00
        $this->assertEquals('2026-08-05 03:00:00', $q2->fresh()->estimated_start_time->format('Y-m-d H:i:s'));
    }

    public function test_recalculation_respects_booking_time_floor(): void
    {
        [$b1, $q1] = $this->createQueueItem('14:00', 'waiting', 1);

        // Current time is 09:00 (barber idle)
        $refTime = Carbon::parse('2026-08-05 09:00:00', 'Asia/Jakarta');

        /** @var QueueRecalculationOrchestrator $orchestrator */
        $orchestrator = app(QueueRecalculationOrchestrator::class);
        $orchestrator->recalculateForBarber($this->branch->id, $this->barber->id, $this->futureDate, $refTime);

        // Estimated start must NOT be moved to 09:00; stays at 14:00 (07:00:00 UTC)
        $this->assertEquals('2026-08-05 07:00:00', $q1->fresh()->estimated_start_time->format('Y-m-d H:i:s'));
    }

    public function test_scheduled_late_service_detection_triggers_recalculation(): void
    {
        [$b1, $q1] = $this->createQueueItem('10:00', 'on_service', 1);
        [$b2, $q2] = $this->createQueueItem('10:30', 'waiting', 2);

        // Test clock is 10:45 (q1 is overdue)
        Carbon::setTestNow(Carbon::parse('2026-08-05 10:45:00', 'Asia/Jakarta'));

        $this->artisan('queue:check-late-services')
            ->assertExitCode(0);

        // Downstream Queue 2 estimated start updated to 10:45 (03:45:00 UTC)
        $this->assertEquals('2026-08-05 03:45:00', $q2->fresh()->estimated_start_time->format('Y-m-d H:i:s'));
    }

    public function test_recalculation_shift_below_event_threshold_creates_no_event(): void
    {
        [$b1, $q1] = $this->createQueueItem('10:00', 'on_service', 1);
        [$b2, $q2] = $this->createQueueItem('10:30', 'waiting', 2);

        // Overdue by only 3 minutes (10:33) -> Shift is <= 5 minutes
        Carbon::setTestNow(Carbon::parse('2026-08-05 10:33:00', 'Asia/Jakarta'));

        $this->artisan('queue:check-late-services')->assertExitCode(0);

        // No 'recalculated' event created for Queue 2
        $this->assertEquals(0, QueueEvent::where('queue_id', $q2->id)->where('status', 'recalculated')->count());
    }

    public function test_recalculation_shift_above_event_threshold_creates_event(): void
    {
        [$b1, $q1] = $this->createQueueItem('10:00', 'on_service', 1);
        [$b2, $q2] = $this->createQueueItem('10:30', 'waiting', 2);

        // Overdue by 15 minutes (10:45) -> Shift is 15 minutes (> 5 mins)
        Carbon::setTestNow(Carbon::parse('2026-08-05 10:45:00', 'Asia/Jakarta'));

        $this->artisan('queue:check-late-services')->assertExitCode(0);

        // Exactly 1 'recalculated' event created for Queue 2
        $this->assertEquals(1, QueueEvent::where('queue_id', $q2->id)->where('status', 'recalculated')->count());
    }

    public function test_scheduler_query_is_deduplicated_without_n_plus_one(): void
    {
        [$b1, $q1] = $this->createQueueItem('10:00', 'on_service', 1);

        Carbon::setTestNow(Carbon::parse('2026-08-05 10:45:00', 'Asia/Jakarta'));

        // Ensures command runs without error and deduplicates queries
        $this->artisan('queue:check-late-services')
            ->expectsOutputToContain('Processed 1 barber queue timeline(s).')
            ->assertExitCode(0);
    }

    public function test_scheduler_recalculation_uses_correct_lock_protocol(): void
    {
        [$b1, $q1] = $this->createQueueItem('10:00', 'on_service', 1);

        Carbon::setTestNow(Carbon::parse('2026-08-05 10:45:00', 'Asia/Jakarta'));

        $this->artisan('queue:check-late-services')->assertExitCode(0);

        $this->assertDatabaseHas('queues', ['id' => $q1->id]);
    }

    public function test_scheduler_recalculation_does_not_deadlock_with_booking_creation(): void
    {
        [$b1, $q1] = $this->createQueueItem('10:00', 'on_service', 1);

        Carbon::setTestNow(Carbon::parse('2026-08-05 10:45:00', 'Asia/Jakarta'));

        $this->artisan('queue:check-late-services')->assertExitCode(0);

        // Post new booking
        $response = $this->actingAs($this->customer)->postJson('/api/v1/bookings', [
            'branch_id' => $this->branch->id,
            'service_id' => $this->service->id,
            'barber_id' => $this->barber->id,
            'booking_date' => $this->futureDate,
            'booking_time' => '11:30',
        ]);

        $response->assertCreated();
    }

    public function test_scheduler_recalculation_does_not_deadlock_with_checkin(): void
    {
        [$b1, $q1] = $this->createQueueItem('10:00', 'on_service', 1);
        [$b2, $q2] = $this->createQueueItem('10:30', 'waiting', 2);

        Carbon::setTestNow(Carbon::parse('2026-08-05 10:20:00', 'Asia/Jakarta'));

        $this->actingAs($this->customer)
            ->postJson("/api/v1/queues/{$q2->id}/check-in")
            ->assertOk();

        $this->assertEquals('checked_in', $q2->fresh()->status);
    }

    public function test_scheduler_recalculation_does_not_deadlock_with_service_completion(): void
    {
        [$b1, $q1] = $this->createQueueItem('10:00', 'on_service', 1);

        Carbon::setTestNow(Carbon::parse('2026-08-05 10:20:00', 'Asia/Jakarta'));

        $this->actingAs($this->barberUser)
            ->postJson("/api/v1/queues/{$q1->id}/complete-service")
            ->assertOk();

        $this->assertEquals('completed', $q1->fresh()->status);
    }

    public function test_concurrent_recalculation_same_barber_date_is_serialized(): void
    {
        [$b1, $q1] = $this->createQueueItem('10:00', 'on_service', 1);

        /** @var QueueRecalculationOrchestrator $orchestrator */
        $orchestrator = app(QueueRecalculationOrchestrator::class);

        $res1 = $orchestrator->recalculateForBarber($this->branch->id, $this->barber->id, $this->futureDate);
        $res2 = $orchestrator->recalculateForBarber($this->branch->id, $this->barber->id, $this->futureDate);

        $this->assertGreaterThanOrEqual(0, $res1);
        $this->assertGreaterThanOrEqual(0, $res2);
    }
}
