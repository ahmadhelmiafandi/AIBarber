<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class ProductionSeeder extends Seeder
{
    /**
     * Production-safe seeder: Populates system settings, roles, permissions,
     * branches, services, and hairstyles without seeding demo users or credentials.
     */
    public function run(): void
    {
        $this->call([
            SystemSettingsSeeder::class,
            RoleAndPermissionSeeder::class,
            BranchSeeder::class,
            ServiceSeeder::class,
            HairstyleSeeder::class,
        ]);
    }
}
