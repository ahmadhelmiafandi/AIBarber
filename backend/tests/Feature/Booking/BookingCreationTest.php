<?php

namespace Tests\Feature\Booking;

use App\Models\Barber;
use App\Models\Booking;
use App\Models\Branch;
use App\Models\Service;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Tests\TestCase;

class BookingCreationTest extends TestCase
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

        $this->futureDate = '2026-08-05';
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    public function test_customer_can_create_booking_successfully(): void
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
            ->assertJsonPath('data.branch_id', $this->branch->id)
            ->assertJsonPath('data.service_id', $this->service->id)
            ->assertJsonPath('data.barber_id', $this->barber->id)
            ->assertJsonPath('data.booking_date', $this->futureDate)
            ->assertJsonPath('data.booking_time', '10:00')
            ->assertJsonPath('data.total_price', 50000)
            ->assertJsonPath('data.status', 'confirmed');

        $bookingCode = $response->json('data.booking_code');

        $this->assertDatabaseHas('bookings', [
            'booking_code' => $bookingCode,
            'customer_id' => $this->customer->id,
            'branch_id' => $this->branch->id,
            'service_id' => $this->service->id,
            'barber_id' => $this->barber->id,
            'status' => 'confirmed',
        ]);
    }

    public function test_booking_creation_fails_if_slot_is_unavailable_due_to_existing_booking(): void
    {
        Booking::create([
            'id' => Str::uuid(),
            'booking_code' => 'BK-EXISTING',
            'customer_id' => $this->customer->id,
            'barber_id' => $this->barber->id,
            'branch_id' => $this->branch->id,
            'service_id' => $this->service->id,
            'booking_date' => $this->futureDate,
            'booking_time' => '10:00',
            'total_price' => 50000,
            'status' => 'confirmed',
        ]);

        $payload = [
            'branch_id' => $this->branch->id,
            'service_id' => $this->service->id,
            'barber_id' => $this->barber->id,
            'booking_date' => $this->futureDate,
            'booking_time' => '10:00',
        ];

        $response = $this->actingAs($this->customer)
            ->postJson('/api/v1/bookings', $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['booking_time']);
    }

    public function test_concurrent_booking_same_barber_and_slot_cannot_both_succeed(): void
    {
        $customer2 = User::factory()->create(['status' => 'active']);
        $customer2->assignRole('customer');

        $payload = [
            'branch_id' => $this->branch->id,
            'service_id' => $this->service->id,
            'barber_id' => $this->barber->id,
            'booking_date' => $this->futureDate,
            'booking_time' => '10:00',
        ];

        // First attempt succeeds
        $res1 = $this->actingAs($this->customer)->postJson('/api/v1/bookings', $payload);
        $res1->assertCreated();

        // Concurrent attempt for same slot & barber fails gracefully
        $res2 = $this->actingAs($customer2)->postJson('/api/v1/bookings', $payload);
        $res2->assertStatus(422)
            ->assertJsonValidationErrors(['booking_time']);

        $this->assertEquals(1, Booking::where('barber_id', $this->barber->id)->whereDate('booking_date', $this->futureDate)->where('booking_time', '10:00')->count());
    }

    public function test_concurrent_auto_assign_cannot_assign_same_barber(): void
    {
        $customer2 = User::factory()->create(['status' => 'active']);
        $customer2->assignRole('customer');

        $payload = [
            'branch_id' => $this->branch->id,
            'service_id' => $this->service->id,
            'barber_id' => null, // Auto assign
            'booking_date' => $this->futureDate,
            'booking_time' => '14:00',
        ];

        // First auto-assign request succeeds (gets the only available barber)
        $res1 = $this->actingAs($this->customer)->postJson('/api/v1/bookings', $payload);
        $res1->assertCreated();
        $this->assertEquals($this->barber->id, $res1->json('data.barber_id'));

        // Second auto-assign request for same slot fails because no other barber is available
        $res2 = $this->actingAs($customer2)->postJson('/api/v1/bookings', $payload);
        $res2->assertStatus(422)
            ->assertJsonValidationErrors(['booking_time']);

        $this->assertEquals(1, Booking::where('branch_id', $this->branch->id)->whereDate('booking_date', $this->futureDate)->where('booking_time', '14:00')->count());
    }

    public function test_booking_creation_fails_for_past_date_or_time(): void
    {
        $payload = [
            'branch_id' => $this->branch->id,
            'service_id' => $this->service->id,
            'barber_id' => $this->barber->id,
            'booking_date' => '2026-07-01',
            'booking_time' => '10:00',
        ];

        $response = $this->actingAs($this->customer)
            ->postJson('/api/v1/bookings', $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['booking_date']);
    }

    public function test_booking_creation_fails_outside_branch_operating_hours(): void
    {
        $payload = [
            'branch_id' => $this->branch->id,
            'service_id' => $this->service->id,
            'barber_id' => $this->barber->id,
            'booking_date' => $this->futureDate,
            'booking_time' => '07:00', // Branch opens at 09:00
        ];

        $response = $this->actingAs($this->customer)
            ->postJson('/api/v1/bookings', $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['booking_time']);
    }

    public function test_booking_auto_assigns_available_barber_when_barber_id_is_null(): void
    {
        $payload = [
            'branch_id' => $this->branch->id,
            'service_id' => $this->service->id,
            'barber_id' => null,
            'booking_date' => $this->futureDate,
            'booking_time' => '11:00',
        ];

        $response = $this->actingAs($this->customer)
            ->postJson('/api/v1/bookings', $payload);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.barber_id', $this->barber->id);
    }

    public function test_booking_creation_fails_if_service_is_inactive(): void
    {
        $this->service->update(['is_active' => false]);

        $payload = [
            'branch_id' => $this->branch->id,
            'service_id' => $this->service->id,
            'barber_id' => $this->barber->id,
            'booking_date' => $this->futureDate,
            'booking_time' => '10:00',
        ];

        $response = $this->actingAs($this->customer)
            ->postJson('/api/v1/bookings', $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['service_id']);
    }

    public function test_booking_creation_fails_if_branch_is_inactive(): void
    {
        $this->branch->update(['is_active' => false]);

        $payload = [
            'branch_id' => $this->branch->id,
            'service_id' => $this->service->id,
            'barber_id' => $this->barber->id,
            'booking_date' => $this->futureDate,
            'booking_time' => '10:00',
        ];

        $response = $this->actingAs($this->customer)
            ->postJson('/api/v1/bookings', $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['branch_id']);
    }

    public function test_unauthenticated_user_cannot_create_booking(): void
    {
        $payload = [
            'branch_id' => $this->branch->id,
            'service_id' => $this->service->id,
            'booking_date' => $this->futureDate,
            'booking_time' => '10:00',
        ];

        $response = $this->postJson('/api/v1/bookings', $payload);

        $response->assertUnauthorized();
    }
}
