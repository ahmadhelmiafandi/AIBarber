<?php
namespace App\Policies;

use App\Models\Hairstyle;
use App\Models\User;

class HairstylePolicy
{
    use AdminBypass;

    public function viewAny(?User $user): bool { return true; } 
    public function view(?User $user, Hairstyle $hairstyle): bool { return true; } 
    public function create(User $user): bool { return false; } 
    public function update(User $user, Hairstyle $hairstyle): bool { return false; }
    public function delete(User $user, Hairstyle $hairstyle): bool { return false; }
}
