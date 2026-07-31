<?php
namespace App\Policies;

use App\Models\Branch;
use App\Models\User;

class BranchPolicy
{
    use AdminBypass;

    public function viewAny(?User $user): bool { return true; } // Publik
    public function view(?User $user, Branch $branch): bool { return true; } // Publik
    public function create(User $user): bool { return false; } // Hanya Admin/Owner via AdminBypass
    public function update(User $user, Branch $branch): bool { return false; }
    public function delete(User $user, Branch $branch): bool { return false; }
}
