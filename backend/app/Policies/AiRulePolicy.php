<?php
namespace App\Policies;

use App\Models\AiRule;
use App\Models\User;

class AiRulePolicy
{
    use AdminBypass;

    public function viewAny(User $user): bool { return false; } // Hanya Admin/Owner (via bypass)
    public function view(User $user, AiRule $aiRule): bool { return false; }
    public function create(User $user): bool { return false; }
    public function update(User $user, AiRule $aiRule): bool { return false; }
    public function delete(User $user, AiRule $aiRule): bool { return false; }
}
