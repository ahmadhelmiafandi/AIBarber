<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class BookingConfirmedNotification extends Notification
{
    use Queueable;

    public function __construct(public Booking $booking) {}

    public function via(mixed $notifiable): array
    {
        return ['database'];
    }

    public function toArray(mixed $notifiable): array
    {
        return [
            'type' => 'booking_confirmed',
            'booking_id' => $this->booking->id,
            'booking_code' => $this->booking->booking_code,
            'booking_date' => $this->booking->booking_date,
            'booking_time' => $this->booking->booking_time,
            'message' => "Your booking #{$this->booking->booking_code} has been confirmed.",
        ];
    }
}
