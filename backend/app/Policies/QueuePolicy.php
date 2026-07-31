<?php

namespace App\Policies;

use App\Models\Queue;
use App\Models\User;

class QueuePolicy
{
    use AdminBypass;

    public function viewAny(?User $user): bool
    {
        return true;
    }

    public function view(User $user, Queue $queue): bool
    {
        if ($queue->booking && $user->id === $queue->booking->customer_id) {
            return true;
        }

        if ($user->hasAnyRole(['admin', 'owner'])) {
            return true;
        }

        if ($user->hasRole('barber')) {
            return $user->barberProfile?->branch_id === $queue->branch_id;
        }

        if ($user->hasRole('receptionist')) {
            $staffBranchId = $user->barberProfile?->branch_id ?? ($user->branch_id ?? null);
            return $staffBranchId === null || $staffBranchId === $queue->branch_id;
        }

        return false;
    }

    public function checkIn(User $user, Queue $queue): bool
    {
        if ($queue->booking && $user->id === $queue->booking->customer_id) {
            return true;
        }

        if ($user->hasAnyRole(['admin', 'owner'])) {
            return true;
        }

        if ($user->hasRole('barber')) {
            return $user->barberProfile && $user->barberProfile->branch_id === $queue->branch_id;
        }

        if ($user->hasRole('receptionist')) {
            $staffBranchId = $user->barberProfile?->branch_id ?? ($user->branch_id ?? null);
            return $staffBranchId === null || $staffBranchId === $queue->branch_id;
        }

        return false;
    }

    public function call(User $user, Queue $queue): bool
    {
        return $this->authorizeStaffTransition($user, $queue);
    }

    public function startService(User $user, Queue $queue): bool
    {
        return $this->authorizeStaffTransition($user, $queue);
    }

    public function completeService(User $user, Queue $queue): bool
    {
        return $this->authorizeStaffTransition($user, $queue);
    }

    private function authorizeStaffTransition(User $user, Queue $queue): bool
    {
        // 1. Admin & Owner have global access
        if ($user->hasAnyRole(['admin', 'owner'])) {
            return true;
        }

        // 2. Barber: Branch-wide access (Model B)
        if ($user->hasRole('barber')) {
            return $user->barberProfile && $user->barberProfile->branch_id === $queue->branch_id;
        }

        // 3. Receptionist: Branch-scoped access
        if ($user->hasRole('receptionist')) {
            $staffBranchId = $user->barberProfile?->branch_id ?? ($user->branch_id ?? null);
            return $staffBranchId === null || $staffBranchId === $queue->branch_id;
        }

        // 4. Customer / Other roles are forbidden
        return false;
    }
}
