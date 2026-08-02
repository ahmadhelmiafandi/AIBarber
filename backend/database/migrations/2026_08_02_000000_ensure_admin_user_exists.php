<?php

use Illuminate\Database\Migrations\Migration;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

return new class extends Migration
{
    public function up(): void
    {
        // Ensure roles exist
        foreach (['admin', 'barber', 'customer', 'receptionist'] as $roleName) {
            Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
        }

        // Ensure admin user exists with correct password & role
        $admin = User::where('email', 'admin@mybarber.my.id')->first();
        if (!$admin) {
            $admin = new User();
            $admin->email = 'admin@mybarber.my.id';
        }
        $admin->name = 'Admin MyBarber';
        $admin->role = 'admin';
        $admin->status = 'active';
        $admin->password = Hash::make('password');
        $admin->save();

        try {
            $admin->syncRoles(['admin']);
        } catch (\Throwable $e) {
            // Ignore role sync if spatie table issue
        }
    }

    public function down(): void
    {
        // No-op
    }
};
