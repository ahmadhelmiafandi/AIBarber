<?php
namespace Tests\Feature\Master;

use App\Models\User;
use App\Models\Branch;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MasterDataAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);
    }

    public function test_customer_can_view_branches_but_cannot_create(): void
    {
        $customer = User::factory()->create();
        $customer->assignRole('customer');

        $this->actingAs($customer)
            ->getJson('/api/v1/branches')
            ->assertOk();

        $this->actingAs($customer)
            ->postJson('/api/v1/branches', [
                'name' => 'New Branch',
                'address' => 'Test Address',
            ])
            ->assertForbidden();
    }

    public function test_barber_can_view_services_but_cannot_update(): void
    {
        $barber = User::factory()->create();
        $barber->assignRole('barber');

        $service = \App\Models\Service::factory()->create();

        $this->actingAs($barber)
            ->getJson('/api/v1/services')
            ->assertOk();

        $this->actingAs($barber)
            ->putJson("/api/v1/services/{$service->id}", [
                'name' => 'Updated Service',
                'price' => 50000,
                'estimated_duration_minutes' => 30,
            ])
            ->assertForbidden();
    }

    public function test_admin_can_crud_master_data(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        // Create
        $response = $this->actingAs($admin)
            ->postJson('/api/v1/hairstyles', [
                'name' => 'Test Hairstyle',
                'category' => 'Short',
            ]);
        
        $response->assertCreated();
        $hairstyleId = $response->json('data.id');

        // Update
        $this->actingAs($admin)
            ->putJson("/api/v1/hairstyles/{$hairstyleId}", [
                'name' => 'Test Hairstyle Updated',
            ])
            ->assertOk();

        // Delete
        $this->actingAs($admin)
            ->deleteJson("/api/v1/hairstyles/{$hairstyleId}")
            ->assertOk();
    }
}
