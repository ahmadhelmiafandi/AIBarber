<?php

namespace App\Policies;

use App\Models\Booking;
use App\Models\User;

class BookingPolicy
{
    use AdminBypass;

    public function viewAny(?User $user): bool
    {
        return true; // Publik / Ketersediaan slot dapat diakses pengguna terautentikasi
    }

    public function view(User $user, Booking $booking): bool
    {
        return $user->id === $booking->customer_id || $user->hasAnyRole(['admin', 'owner', 'receptionist', 'barber']);
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Booking $booking): bool
    {
        return $user->id === $booking->customer_id || $user->hasAnyRole(['admin', 'owner', 'receptionist']);
    }

    public function delete(User $user, Booking $booking): bool
    {
        return $user->hasAnyRole(['admin', 'owner']);
    }
}
