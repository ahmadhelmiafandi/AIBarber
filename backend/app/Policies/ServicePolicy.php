<?php
namespace App\Policies;

use App\Models\Service;
use App\Models\User;

class ServicePolicy
{
    use AdminBypass;

    public function viewAny(?User $user): bool { return true; } 
    public function view(?User $user, Service $service): bool { return true; } 
    public function create(User $user): bool { return false; } 
    public function update(User $user, Service $service): bool { return false; }
    public function delete(User $user, Service $service): bool { return false; }
}
