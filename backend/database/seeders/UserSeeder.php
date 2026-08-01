<?php
namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $adminMybarber = User::where('email', 'admin@mybarber.my.id')->first();
        if (!$adminMybarber) {
            $adminMybarber = new User();
            $adminMybarber->email = 'admin@mybarber.my.id';
            $adminMybarber->name = 'Admin MyBarber';
            $adminMybarber->role = 'admin';
            $adminMybarber->status = 'active';
        }
        $adminMybarber->password = Hash::make('password');
        $adminMybarber->save();
        $adminMybarber->syncRoles(['admin']);

        $superadmin = User::where('email', 'admin@aibarber.com')->first();
        if (!$superadmin) {
            $superadmin = new User();
            $superadmin->email = 'admin@aibarber.com';
            $superadmin->name = 'Super Admin';
            $superadmin->role = 'admin';
            $superadmin->status = 'active';
        }
        $superadmin->password = Hash::make('password');
        $superadmin->save();
        $superadmin->syncRoles(['admin']);

        $customer = User::where('email', 'customer@aibarber.com')->first();
        if (!$customer) {
            $customer = new User();
            $customer->email = 'customer@aibarber.com';
            $customer->name = 'John Doe';
            $customer->role = 'customer';
            $customer->status = 'active';
            $customer->phone = '081234567890';
        }
        $customer->password = Hash::make('password');
        $customer->save();
        $customer->syncRoles(['customer']);

        $barber = User::where('email', 'barber@aibarber.com')->first();
        if (!$barber) {
            $barber = new User();
            $barber->email = 'barber@aibarber.com';
            $barber->name = 'Fadli Barber';
            $barber->role = 'barber';
            $barber->status = 'active';
            $barber->phone = '081234567891';
        }
        $barber->password = Hash::make('password');
        $barber->save();
        $barber->syncRoles(['barber']);
    }
}