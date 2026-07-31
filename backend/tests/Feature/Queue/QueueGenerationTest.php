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

class QueueGenerationTest extends TestCase
{
    use RefreshDatabase;

    protected User $customer;
    protected Branch $branch;
    protected Service $service;
    protected Barber $barber;
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
            'name' => 'Central Branch',
            'address' => 'Jl. Merdeka No 10',
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

        $this->futureDate = '2026-08-05';
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    public function test_booking_creates_queue_successfully(): void
    {
        $payload = [
            'branch_id' => $this->branch->id,
            'service_id' => $this->service->id,
            'barber_id' => $this->barber->id,
            'booking_date' => $this->futureDate,
            'booking_time' => '10:00',
        ];

        $response = $this->actingAs($this->customer)
            ->postJson('/api/v1/bookings', $payload);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.queue_number', 1)
            ->assertJsonPath('data.queue_code', 'A-001');

        $bookingId = $response->json('data.booking_id');

        $this->assertDatabaseHas('queues', [
            'booking_id' => $bookingId,
            'branch_id' => $this->branch->id,
            'queue_number' => 1,
            'queue_code' => 'A-001',
            'status' => 'waiting',
        ]);
    }

    public function test_queue_number_generated_correctly(): void
    {
        // First booking
        $this->actingAs($this->customer)->postJson('/api/v1/bookings', [
            'branch_id' => $this->branch->id,
            'service_id' => $this->service->id,
            'barber_id' => $this->barber->id,
            'booking_date' => $this->futureDate,
            'booking_time' => '10:00',
        ])->assertCreated();

        // Second booking
        $customer2 = User::factory()->create(['status' => 'active']);
        $customer2->assignRole('customer');

        $response2 = $this->actingAs($customer2)->postJson('/api/v1/bookings', [
            'branch_id' => $this->branch->id,
            'service_id' => $this->service->id,
            'barber_id' => $this->barber->id,
            'booking_date' => $this->futureDate,
            'booking_time' => '10:30',
        ]);

        $response2->assertCreated()
            ->assertJsonPath('data.queue_number', 2)
            ->assertJsonPath('data.queue_code', 'A-002');
    }

    public function test_queue_code_generated_correctly(): void
    {
        $payload = [
            'branch_id' => $this->branch->id,
            'service_id' => $this->service->id,
            'barber_id' => $this->barber->id,
            'booking_date' => $this->futureDate,
            'booking_time' => '11:00',
        ];

        $response = $this->actingAs($this->customer)->postJson('/api/v1/bookings', $payload);
        $response->assertCreated()
            ->assertJsonPath('data.queue_code', 'A-001');
    }

    public function test_initial_queue_status_is_waiting(): void
    {
        $payload = [
            'branch_id' => $this->branch->id,
            'service_id' => $this->service->id,
            'barber_id' => $this->barber->id,
            'booking_date' => $this->futureDate,
            'booking_time' => '10:00',
        ];

        $response = $this->actingAs($this->customer)->postJson('/api/v1/bookings', $payload);
        $bookingId = $response->json('data.booking_id');

        $queue = Queue::where('booking_id', $bookingId)->first();
        $this->assertNotNull($queue);
        $this->assertEquals('waiting', $queue->status);
    }

    public function test_estimated_start_time_calculated_correctly(): void
    {
        $payload = [
            'branch_id' => $this->branch->id,
            'service_id' => $this->service->id,
            'barber_id' => $this->barber->id,
            'booking_date' => $this->futureDate,
            'booking_time' => '10:00',
        ];

        $response = $this->actingAs($this->customer)->postJson('/api/v1/bookings', $payload);
        $response->assertCreated();

        $queue = Queue::where('booking_id', $response->json('data.booking_id'))->first();
        $this->assertEquals('2026-08-05 10:00:00', $queue->estimated_start_time->setTimezone('Asia/Jakarta')->format('Y-m-d H:i:s'));
    }

    public function test_estimated_finish_time_calculated_correctly(): void
    {
        $payload = [
            'branch_id' => $this->branch->id,
            'service_id' => $this->service->id,
            'barber_id' => $this->barber->id,
            'booking_date' => $this->futureDate,
            'booking_time' => '10:00',
        ];

        $response = $this->actingAs($this->customer)->postJson('/api/v1/bookings', $payload);
        $response->assertCreated();

        $queue = Queue::where('booking_id', $response->json('data.booking_id'))->first();
        // 10:00 + 30 mins service duration = 10:30
        $this->assertEquals('2026-08-05 10:30:00', $queue->estimated_finish_time->setTimezone('Asia/Jakarta')->format('Y-m-d H:i:s'));
    }

    public function test_booking_queue_and_event_are_atomic(): void
    {
        $payload = [
            'branch_id' => $this->branch->id,
            'service_id' => $this->service->id,
            'barber_id' => $this->barber->id,
            'booking_date' => $this->futureDate,
            'booking_time' => '10:00',
        ];

        $response = $this->actingAs($this->customer)->postJson('/api/v1/bookings', $payload);
        $bookingId = $response->json('data.booking_id');

        $booking = Booking::find($bookingId);
        $queue = Queue::where('booking_id', $bookingId)->first();
        $event = QueueEvent::where('queue_id', $queue->id)->first();

        $this->assertNotNull($booking);
        $this->assertNotNull($queue);
        $this->assertNotNull($event);
        $this->assertEquals('waiting', $event->status);
    }

    public function test_queue_number_resets_per_branch_per_day(): void
    {
        // Day 1 booking
        $this->actingAs($this->customer)->postJson('/api/v1/bookings', [
            'branch_id' => $this->branch->id,
            'service_id' => $this->service->id,
            'barber_id' => $this->barber->id,
            'booking_date' => '2026-08-05',
            'booking_time' => '10:00',
        ])->assertJsonPath('data.queue_number', 1);

        // Day 2 booking for same branch -> Queue number resets to 1
        $resDay2 = $this->actingAs($this->customer)->postJson('/api/v1/bookings', [
            'branch_id' => $this->branch->id,
            'service_id' => $this->service->id,
            'barber_id' => $this->barber->id,
            'booking_date' => '2026-08-06',
            'booking_time' => '10:00',
        ]);

        $resDay2->assertCreated()
            ->assertJsonPath('data.queue_number', 1)
            ->assertJsonPath('data.queue_code', 'A-001');
    }

    public function test_queue_code_resets_per_branch_per_day(): void
    {
        // Day 1
        $this->actingAs($this->customer)->postJson('/api/v1/bookings', [
            'branch_id' => $this->branch->id,
            'service_id' => $this->service->id,
            'barber_id' => $this->barber->id,
            'booking_date' => '2026-08-05',
            'booking_time' => '10:00',
        ])->assertJsonPath('data.queue_code', 'A-001');

        // Day 2
        $this->actingAs($this->customer)->postJson('/api/v1/bookings', [
            'branch_id' => $this->branch->id,
            'service_id' => $this->service->id,
            'barber_id' => $this->barber->id,
            'booking_date' => '2026-08-06',
            'booking_time' => '10:00',
        ])->assertJsonPath('data.queue_code', 'A-001');
    }

    public function test_concurrent_queue_generation_same_branch_same_day(): void
    {
        $customer2 = User::factory()->create(['status' => 'active']);
        $customer2->assignRole('customer');

        // Booking 1 at 10:00
        $res1 = $this->actingAs($this->customer)->postJson('/api/v1/bookings', [
            'branch_id' => $this->branch->id,
            'service_id' => $this->service->id,
            'barber_id' => $this->barber->id,
            'booking_date' => $this->futureDate,
            'booking_time' => '10:00',
        ]);
        $res1->assertCreated();

        // Booking 2 at 10:30
        $res2 = $this->actingAs($customer2)->postJson('/api/v1/bookings', [
            'branch_id' => $this->branch->id,
            'service_id' => $this->service->id,
            'barber_id' => $this->barber->id,
            'booking_date' => $this->futureDate,
            'booking_time' => '10:30',
        ]);
        $res2->assertCreated();

        $this->assertEquals(1, $res1->json('data.queue_number'));
        $this->assertEquals(2, $res2->json('data.queue_number'));
        $this->assertEquals('A-001', $res1->json('data.queue_code'));
        $this->assertEquals('A-002', $res2->json('data.queue_code'));
    }

    public function test_concurrent_queue_generation_different_barbers_same_branch(): void
    {
        $barber2User = User::factory()->create(['status' => 'active']);
        $barber2User->assignRole('barber');

        $barber2 = Barber::create([
            'id' => Str::uuid(),
            'user_id' => $barber2User->id,
            'branch_id' => $this->branch->id,
            'is_active' => true,
        ]);

        $customer2 = User::factory()->create(['status' => 'active']);
        $customer2->assignRole('customer');

        // Customer 1 books Barber 1 at 10:00
        $res1 = $this->actingAs($this->customer)->postJson('/api/v1/bookings', [
            'branch_id' => $this->branch->id,
            'service_id' => $this->service->id,
            'barber_id' => $this->barber->id,
            'booking_date' => $this->futureDate,
            'booking_time' => '10:00',
        ]);
        $res1->assertCreated();

        // Customer 2 books Barber 2 at 10:00 (same time, different barber)
        $res2 = $this->actingAs($customer2)->postJson('/api/v1/bookings', [
            'branch_id' => $this->branch->id,
            'service_id' => $this->service->id,
            'barber_id' => $barber2->id,
            'booking_date' => $this->futureDate,
            'booking_time' => '10:00',
        ]);
        $res2->assertCreated();

        // Branch-wide queue counter maintains unique sequential order
        $this->assertEquals(1, $res1->json('data.queue_number'));
        $this->assertEquals(2, $res2->json('data.queue_number'));
        $this->assertEquals('A-001', $res1->json('data.queue_code'));
        $this->assertEquals('A-002', $res2->json('data.queue_code'));
    }

    public function test_later_booking_does_not_delay_earlier_booking(): void
    {
        // First create later booking at 14:00
        $resLater = $this->actingAs($this->customer)->postJson('/api/v1/bookings', [
            'branch_id' => $this->branch->id,
            'service_id' => $this->service->id,
            'barber_id' => $this->barber->id,
            'booking_date' => $this->futureDate,
            'booking_time' => '14:00',
        ]);
        $resLater->assertCreated();

        // Then create earlier booking at 10:00 for the same barber
        $customer2 = User::factory()->create(['status' => 'active']);
        $customer2->assignRole('customer');

        $resEarlier = $this->actingAs($customer2)->postJson('/api/v1/bookings', [
            'branch_id' => $this->branch->id,
            'service_id' => $this->service->id,
            'barber_id' => $this->barber->id,
            'booking_date' => $this->futureDate,
            'booking_time' => '10:00',
        ]);
        $resEarlier->assertCreated();

        // Earlier booking start time should be exactly 10:00, not delayed by the 14:00 booking
        $queueEarlier = Queue::where('booking_id', $resEarlier->json('data.booking_id'))->first();
        $this->assertEquals('2026-08-05 10:00:00', $queueEarlier->estimated_start_time->setTimezone('Asia/Jakarta')->format('Y-m-d H:i:s'));
    }

    public function test_queue_estimated_start_respects_preceding_booking(): void
    {
        // Booking 1 at 10:00 (duration 30 mins)
        $res1 = $this->actingAs($this->customer)->postJson('/api/v1/bookings', [
            'branch_id' => $this->branch->id,
            'service_id' => $this->service->id,
            'barber_id' => $this->barber->id,
            'booking_date' => $this->futureDate,
            'booking_time' => '10:00',
        ]);
        $res1->assertCreated();

        // Simulate preceding queue delay: update queue 1 estimated_finish_time to 10:45
        $queue1 = Queue::where('booking_id', $res1->json('data.booking_id'))->first();
        $queue1->update([
            'estimated_finish_time' => Carbon::createFromFormat('Y-m-d H:i', "{$this->futureDate} 10:45", 'Asia/Jakarta')->setTimezone('UTC'),
        ]);

        $customer2 = User::factory()->create(['status' => 'active']);
        $customer2->assignRole('customer');

        // Booking 2 at 10:30 for same barber (preceding queue finishes at 10:45)
        $res2 = $this->actingAs($customer2)->postJson('/api/v1/bookings', [
            'branch_id' => $this->branch->id,
            'service_id' => $this->service->id,
            'barber_id' => $this->barber->id,
            'booking_date' => $this->futureDate,
            'booking_time' => '10:30',
        ]);
        $res2->assertCreated();

        $queue2 = Queue::where('booking_id', $res2->json('data.booking_id'))->first();
        // Estimated start should be shifted to preceding queue's finish time (10:45)
        $this->assertEquals('2026-08-05 10:45:00', $queue2->estimated_start_time->setTimezone('Asia/Jakarta')->format('Y-m-d H:i:s'));
    }

    public function test_multiple_barbers_calculate_queue_correctly(): void
    {
        $barber2User = User::factory()->create(['status' => 'active']);
        $barber2User->assignRole('barber');

        $barber2 = Barber::create([
            'id' => Str::uuid(),
            'user_id' => $barber2User->id,
            'branch_id' => $this->branch->id,
            'is_active' => true,
        ]);

        // Barber 1 gets booking at 10:00
        $res1 = $this->actingAs($this->customer)->postJson('/api/v1/bookings', [
            'branch_id' => $this->branch->id,
            'service_id' => $this->service->id,
            'barber_id' => $this->barber->id,
            'booking_date' => $this->futureDate,
            'booking_time' => '10:00',
        ])->assertCreated();

        $customer2 = User::factory()->create(['status' => 'active']);
        $customer2->assignRole('customer');

        // Barber 2 gets booking at 10:00 (Barber 1 busy does not affect Barber 2 start time)
        $res2 = $this->actingAs($customer2)->postJson('/api/v1/bookings', [
            'branch_id' => $this->branch->id,
            'service_id' => $this->service->id,
            'barber_id' => $barber2->id,
            'booking_date' => $this->futureDate,
            'booking_time' => '10:00',
        ])->assertCreated();

        $queue2 = Queue::where('booking_id', $res2->json('data.booking_id'))->first();
        $this->assertEquals('2026-08-05 10:00:00', $queue2->estimated_start_time->setTimezone('Asia/Jakarta')->format('Y-m-d H:i:s'));
    }
}
