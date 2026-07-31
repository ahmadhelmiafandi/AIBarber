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

class BookingAvailabilityTest extends TestCase
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

        // Set fixed test time for deterministic test execution
        Carbon::setTestNow(Carbon::parse('2026-08-01 08:00:00', 'Asia/Jakarta'));

        $this->customer = User::factory()->create();
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

    public function test_can_get_available_slots_successfully(): void
    {
        $response = $this->actingAs($this->customer)
            ->getJson("/api/v1/booking-slots?branch_id={$this->branch->id}&service_id={$this->service->id}&date={$this->futureDate}");

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'branch_id',
                    'service_id',
                    'date',
                    'service_duration_minutes',
                    'available_slots',
                ],
            ]);

        $slots = $response->json('data.available_slots');
        $this->assertContains('09:00', $slots);
        $this->assertContains('09:30', $slots);
        $this->assertContains('16:30', $slots);
        $this->assertNotContains('17:00', $slots); // 17:00 + 30m extends past closing
    }

    public function test_slots_excluding_booked_times(): void
    {
        Booking::create([
            'id' => Str::uuid(),
            'booking_code' => 'BOOK-001',
            'customer_id' => $this->customer->id,
            'barber_id' => $this->barber->id,
            'branch_id' => $this->branch->id,
            'service_id' => $this->service->id,
            'booking_date' => $this->futureDate,
            'booking_time' => '10:00',
            'total_price' => 50000,
            'status' => 'confirmed',
        ]);

        $response = $this->actingAs($this->customer)
            ->getJson("/api/v1/booking-slots?branch_id={$this->branch->id}&service_id={$this->service->id}&date={$this->futureDate}");

        $slots = $response->json('data.available_slots');
        $this->assertNotContains('10:00', $slots);
        $this->assertContains('09:30', $slots);
        $this->assertContains('10:30', $slots);
    }

    public function test_validation_fails_for_past_date_or_invalid_ids(): void
    {
        $pastDate = '2026-07-20';

        $response = $this->actingAs($this->customer)
            ->getJson("/api/v1/booking-slots?branch_id={$this->branch->id}&service_id={$this->service->id}&date={$pastDate}");

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['date']);
    }

    public function test_inactive_branch_or_service_returns_error(): void
    {
        $this->branch->update(['is_active' => false]);

        $response = $this->actingAs($this->customer)
            ->getJson("/api/v1/booking-slots?branch_id={$this->branch->id}&service_id={$this->service->id}&date={$this->futureDate}");

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['branch_id']);
    }

    public function test_specific_barber_availability(): void
    {
        $response = $this->actingAs($this->customer)
            ->getJson("/api/v1/booking-slots?branch_id={$this->branch->id}&service_id={$this->service->id}&date={$this->futureDate}&barber_id={$this->barber->id}");

        $response->assertOk();
        $this->assertNotEmpty($response->json('data.available_slots'));
    }

    public function test_adjacent_bookings_are_allowed(): void
    {
        // Booking A: 10:00 - 10:30
        Booking::create([
            'id' => Str::uuid(),
            'booking_code' => 'BOOK-ADJ1',
            'customer_id' => $this->customer->id,
            'barber_id' => $this->barber->id,
            'branch_id' => $this->branch->id,
            'service_id' => $this->service->id,
            'booking_date' => $this->futureDate,
            'booking_time' => '10:00',
            'total_price' => 50000,
            'status' => 'confirmed',
        ]);

        // Booking B requested for 10:30 - 11:00
        $response = $this->actingAs($this->customer)
            ->getJson("/api/v1/booking-slots?branch_id={$this->branch->id}&service_id={$this->service->id}&date={$this->futureDate}");

        $slots = $response->json('data.available_slots');
        $this->assertNotContains('10:00', $slots);
        $this->assertContains('10:30', $slots); // Adjacent slot 10:30 must be allowed!
    }

    public function test_overlapping_booking_is_excluded(): void
    {
        // Long service 45 mins: 10:00 - 10:45
        $longService = Service::create([
            'id' => Str::uuid(),
            'name' => 'Hair Spa Long',
            'price' => 100000,
            'estimated_duration_minutes' => 45,
            'is_active' => true,
        ]);

        Booking::create([
            'id' => Str::uuid(),
            'booking_code' => 'BOOK-OVER1',
            'customer_id' => $this->customer->id,
            'barber_id' => $this->barber->id,
            'branch_id' => $this->branch->id,
            'service_id' => $longService->id,
            'booking_date' => $this->futureDate,
            'booking_time' => '10:00',
            'total_price' => 100000,
            'status' => 'confirmed',
        ]);

        // Check availability for 30m service
        $response = $this->actingAs($this->customer)
            ->getJson("/api/v1/booking-slots?branch_id={$this->branch->id}&service_id={$this->service->id}&date={$this->futureDate}");

        $slots = $response->json('data.available_slots');
        $this->assertNotContains('10:00', $slots); // 10:00 - 10:30 overlaps with 10:00-10:45
        $this->assertNotContains('10:30', $slots); // 10:30 - 11:00 overlaps with 10:00-10:45
        $this->assertContains('11:00', $slots); // 11:00 is the next 30m grid slot after 10:45 finish
    }

    public function test_no_active_barber_returns_no_slots(): void
    {
        $this->barber->update(['is_active' => false]);

        $response = $this->actingAs($this->customer)
            ->getJson("/api/v1/booking-slots?branch_id={$this->branch->id}&service_id={$this->service->id}&date={$this->futureDate}");

        $response->assertOk();
        $this->assertEmpty($response->json('data.available_slots'));
    }

    public function test_slot_cannot_extend_past_branch_closing_time(): void
    {
        $longService = Service::create([
            'id' => Str::uuid(),
            'name' => 'Mega Treatment',
            'price' => 200000,
            'estimated_duration_minutes' => 60,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->customer)
            ->getJson("/api/v1/booking-slots?branch_id={$this->branch->id}&service_id={$longService->id}&date={$this->futureDate}");

        $slots = $response->json('data.available_slots');
        $this->assertContains('16:00', $slots); // 16:00 - 17:00 fits
        $this->assertNotContains('16:30', $slots); // 16:30 - 17:30 exceeds 17:00 close time
    }

    public function test_slot_cannot_exceed_branch_operating_hours(): void
    {
        // Branch closes at 12:00
        $shortBranch = Branch::create([
            'id' => Str::uuid(),
            'name' => 'Short Branch',
            'address' => 'Jl. Short No 2',
            'opening_hours' => [
                'monday' => ['open' => '09:00', 'close' => '12:00'],
                'tuesday' => ['open' => '09:00', 'close' => '12:00'],
                'wednesday' => ['open' => '09:00', 'close' => '12:00'],
                'thursday' => ['open' => '09:00', 'close' => '12:00'],
                'friday' => ['open' => '09:00', 'close' => '12:00'],
                'saturday' => ['open' => '09:00', 'close' => '12:00'],
                'sunday' => ['open' => '09:00', 'close' => '12:00'],
            ],
            'is_active' => true,
        ]);

        $barberUser = User::factory()->create(['status' => 'active']);
        $barberUser->assignRole('barber');
        Barber::create([
            'id' => Str::uuid(),
            'user_id' => $barberUser->id,
            'branch_id' => $shortBranch->id,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->customer)
            ->getJson("/api/v1/booking-slots?branch_id={$shortBranch->id}&service_id={$this->service->id}&date={$this->futureDate}");

        $slots = $response->json('data.available_slots');
        $this->assertContains('11:30', $slots); // 11:30 - 12:00 fits
        $this->assertNotContains('12:00', $slots); // 12:00 is closing time
    }

    public function test_service_duration_longer_than_operating_window(): void
    {
        $hugeService = Service::create([
            'id' => Str::uuid(),
            'name' => 'Full Day Hair Renovation',
            'price' => 500000,
            'estimated_duration_minutes' => 600, // 10 hours (branch is open 8 hours: 09:00 - 17:00)
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->customer)
            ->getJson("/api/v1/booking-slots?branch_id={$this->branch->id}&service_id={$hugeService->id}&date={$this->futureDate}");

        $response->assertOk();
        $this->assertEmpty($response->json('data.available_slots'));
    }

    public function test_expired_pending_booking_does_not_block_slot(): void
    {
        // Pending booking created 30 minutes ago (expired because default timeout is 15 mins)
        $expiredPending = Booking::create([
            'id' => Str::uuid(),
            'booking_code' => 'BOOK-EXP1',
            'customer_id' => $this->customer->id,
            'barber_id' => $this->barber->id,
            'branch_id' => $this->branch->id,
            'service_id' => $this->service->id,
            'booking_date' => $this->futureDate,
            'booking_time' => '11:00',
            'total_price' => 50000,
            'status' => 'pending',
        ]);
        // Force created_at to 30 mins ago relative to frozen Carbon::now()
        $expiredPending->created_at = Carbon::now()->subMinutes(30);
        $expiredPending->save();

        $response = $this->actingAs($this->customer)
            ->getJson("/api/v1/booking-slots?branch_id={$this->branch->id}&service_id={$this->service->id}&date={$this->futureDate}");

        $slots = $response->json('data.available_slots');
        $this->assertContains('11:00', $slots); // Expired pending booking should NOT block 11:00
    }

    public function test_active_pending_booking_blocks_slot(): void
    {
        // Fresh pending booking created 2 minutes ago relative to frozen Carbon::now()
        Booking::create([
            'id' => Str::uuid(),
            'booking_code' => 'BOOK-ACTP1',
            'customer_id' => $this->customer->id,
            'barber_id' => $this->barber->id,
            'branch_id' => $this->branch->id,
            'service_id' => $this->service->id,
            'booking_date' => $this->futureDate,
            'booking_time' => '11:00',
            'total_price' => 50000,
            'status' => 'pending',
            'created_at' => Carbon::now()->subMinutes(2),
        ]);

        $response = $this->actingAs($this->customer)
            ->getJson("/api/v1/booking-slots?branch_id={$this->branch->id}&service_id={$this->service->id}&date={$this->futureDate}");

        $slots = $response->json('data.available_slots');
        $this->assertNotContains('11:00', $slots); // Active pending booking MUST block 11:00
    }

    public function test_inactive_barber_is_excluded(): void
    {
        $inactiveUser = User::factory()->create(['status' => 'active']);
        $inactiveUser->assignRole('barber');

        $inactiveBarber = Barber::create([
            'id' => Str::uuid(),
            'user_id' => $inactiveUser->id,
            'branch_id' => $this->branch->id,
            'is_active' => false,
        ]);

        $response = $this->actingAs($this->customer)
            ->getJson("/api/v1/booking-slots?branch_id={$this->branch->id}&service_id={$this->service->id}&date={$this->futureDate}&barber_id={$inactiveBarber->id}");

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['barber_id']);
    }

    public function test_deleted_barber_is_excluded(): void
    {
        $this->barber->delete(); // Soft delete

        $response = $this->actingAs($this->customer)
            ->getJson("/api/v1/booking-slots?branch_id={$this->branch->id}&service_id={$this->service->id}&date={$this->futureDate}");

        $response->assertOk();
        $this->assertEmpty($response->json('data.available_slots'));
    }

    public function test_today_past_slots_are_excluded_using_branch_timezone(): void
    {
        // Freeze time to 11:15 AM today
        Carbon::setTestNow(Carbon::parse('2026-08-01 11:15:00', 'Asia/Jakarta'));
        $today = '2026-08-01';

        $response = $this->actingAs($this->customer)
            ->getJson("/api/v1/booking-slots?branch_id={$this->branch->id}&service_id={$this->service->id}&date={$today}");

        $response->assertOk();
        $slots = $response->json('data.available_slots');

        // Past slots <= 11:15 AM (09:00, 09:30, 10:00, 10:30, 11:00) MUST NOT be present
        $this->assertNotContains('09:00', $slots);
        $this->assertNotContains('09:30', $slots);
        $this->assertNotContains('10:00', $slots);
        $this->assertNotContains('10:30', $slots);
        $this->assertNotContains('11:00', $slots);

        // Future slots > 11:15 AM MUST be present
        $this->assertContains('11:30', $slots);
        $this->assertContains('12:00', $slots);
    }
}
