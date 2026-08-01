<?php
namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $superadmin = User::firstOrCreate(
            ['email' => 'admin@aibarber.com'],
            [
                'name' => 'Super Admin',
                'password' => 'password',
                'role' => 'admin',
                'status' => 'active'
            ]
        );
        $superadmin->update(['password' => 'password']);
        $superadmin->assignRole('admin');

        $adminMybarber = User::firstOrCreate(
            ['email' => 'admin@mybarber.my.id'],
            [
                'name' => 'Admin MyBarber',
                'password' => 'password',
                'role' => 'admin',
                'status' => 'active'
            ]
        );
        $adminMybarber->update(['password' => 'password']);
        $adminMybarber->assignRole('admin');

        $customer = User::firstOrCreate(
            ['email' => 'customer@aibarber.com'],
            [
                'name' => 'John Doe',
                'password' => 'password',
                'role' => 'customer',
                'status' => 'active',
                'phone' => '081234567890'
            ]
        );
        $customer->update(['password' => 'password']);
        $customer->assignRole('customer');
        
        $barber = User::firstOrCreate(
            ['email' => 'barber@aibarber.com'],
            [
                'name' => 'Fadli Barber',
                'password' => 'password',
                'role' => 'barber',
                'status' => 'active',
                'phone' => '081234567891'
            ]
        );
        $barber->update(['password' => 'password']);
        $barber->assignRole('barber');
    }
}