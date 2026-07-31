<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleAndPermissionSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Admin Permissions
        Permission::firstOrCreate(['name' => 'manage all', 'guard_name' => 'web']);
        
        // Barber Permissions
        Permission::firstOrCreate(['name' => 'manage own schedule', 'guard_name' => 'web']);
        Permission::firstOrCreate(['name' => 'update queue', 'guard_name' => 'web']);

        // Customer Permissions
        Permission::firstOrCreate(['name' => 'book appointments', 'guard_name' => 'web']);
        Permission::firstOrCreate(['name' => 'use ai features', 'guard_name' => 'web']);

        // Create Roles and assign existing permissions
        $roleOwner = Role::firstOrCreate(['name' => 'owner', 'guard_name' => 'web']);
        $roleOwner->givePermissionTo('manage all');

        $roleAdmin = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $roleAdmin->givePermissionTo('manage all');

        $roleBarber = Role::firstOrCreate(['name' => 'barber', 'guard_name' => 'web']);
        $roleBarber->givePermissionTo(['manage own schedule', 'update queue']);

        $roleReceptionist = Role::firstOrCreate(['name' => 'receptionist', 'guard_name' => 'web']);
        $roleReceptionist->givePermissionTo('update queue');

        $roleCustomer = Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'web']);
        $roleCustomer->givePermissionTo(['book appointments', 'use ai features']);
    }
}