<?php

use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

// Private Staff Branch Channel
Broadcast::channel('branch.{branchId}', function (User $user, string $branchId) {
    if ($user->hasAnyRole(['admin', 'owner'])) {
        return true;
    }

    if ($user->hasRole('barber')) {
        return $user->barberProfile?->branch_id === $branchId;
    }

    if ($user->hasRole('receptionist')) {
        return $user->branch_id === $branchId;
    }

    return false;
});

// Private Customer Channel
Broadcast::channel('customer.{customerId}', function (User $user, string $customerId) {
    return $user->id === $customerId;
});

// Public Branch Display Board Channel
Broadcast::channel('branch-display.{branchId}', function () {
    return true;
});
