<?php
namespace App\Policies;

use App\Models\Barber;
use App\Models\User;

class BarberPolicy
{
    use AdminBypass;

    public function viewAny(?User $user): bool { return true; } 
    public function view(?User $user, Barber $barber): bool { return true; }
    public function create(User $user): bool { return false; }
    
    public function update(User $user, Barber $barber): bool 
    { 
        // Barber bisa update profilnya sendiri
        return $user->hasRole('barber') && $user->id === $barber->user_id;
    }
    
    public function delete(User $user, Barber $barber): bool { return false; }
}
