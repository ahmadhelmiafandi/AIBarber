<?php
namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $superadmin = User::firstOrCreate(
            ['email' => 'admin@aibarber.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'status' => 'active'
            ]
        );
        $superadmin->assignRole('admin');

        $customer = User::firstOrCreate(
            ['email' => 'customer@aibarber.com'],
            [
                'name' => 'John Doe',
                'password' => Hash::make('password'),
                'role' => 'customer',
                'status' => 'active',
                'phone' => '081234567890'
            ]
        );
        $customer->assignRole('customer');
        
        $barber = User::firstOrCreate(
            ['email' => 'barber@aibarber.com'],
            [
                'name' => 'Fadli Barber',
                'password' => Hash::make('password'),
                'role' => 'barber',
                'status' => 'active',
                'phone' => '081234567891'
            ]
        );
        $barber->assignRole('barber');
    }
}