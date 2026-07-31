<?php
namespace App\Policies;

use App\Models\User;

trait AdminBypass
{
    public function before(User $user, string $ability): ?bool
    {
        if ($user->hasRole(['admin', 'owner'])) {
            return true;
        }

        return null; // fall through
    }
}
