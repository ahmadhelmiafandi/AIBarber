<?php
namespace Database\Seeders;

use App\Models\Barber;
use App\Models\Branch;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            SystemSettingsSeeder::class,
            RoleAndPermissionSeeder::class,
            UserSeeder::class,
            BranchSeeder::class,
            ServiceSeeder::class,
            HairstyleSeeder::class,
        ]);

        // Link barbers to branches
        $branch = Branch::first();
        if ($branch) {
            $barbers = User::where('role', 'barber')->get();
            foreach ($barbers as $b) {
                Barber::firstOrCreate(
                    ['user_id' => $b->id],
                    ['branch_id' => $branch->id, 'is_active' => true]
                );
            }
        }
    }
}