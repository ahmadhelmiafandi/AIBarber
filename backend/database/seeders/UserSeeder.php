<?php
namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Delete legacy demo account if present
        User::where('email', 'admin@aibarber.com')->forceDelete();

        // 1. Single Primary Admin User
        $adminMybarber = User::where('email', 'admin@mybarber.my.id')->first();
        if (!$adminMybarber) {
            $adminMybarber = new User();
            $adminMybarber->email = 'admin@mybarber.my.id';
        }
        $adminMybarber->name = 'Admin MyBarber';
        $adminMybarber->role = 'admin';
        $adminMybarber->status = 'active';
        $adminMybarber->password = 'password';
        $adminMybarber->save();
        $adminMybarber->syncRoles(['admin']);

        // 2. Demo Customer User
        $customer = User::where('email', 'customer@mybarber.my.id')->orWhere('phone', '081234567890')->first();
        if (!$customer) {
            $customer = new User();
        }
        $customer->email = 'customer@mybarber.my.id';
        $customer->name = 'Pelanggan Demo';
        $customer->role = 'customer';
        $customer->status = 'active';
        $customer->phone = '081234567890';
        $customer->password = 'password';
        $customer->save();
        $customer->syncRoles(['customer']);

        // 3. Demo Barber User
        $barber = User::where('email', 'barber@mybarber.my.id')->orWhere('phone', '081234567891')->first();
        if (!$barber) {
            $barber = new User();
        }
        $barber->email = 'barber@mybarber.my.id';
        $barber->name = 'Budi (Barber)';
        $barber->role = 'barber';
        $barber->status = 'active';
        $barber->phone = '081234567891';
        $barber->password = 'password';
        $barber->save();
        $barber->syncRoles(['barber']);
    }
}