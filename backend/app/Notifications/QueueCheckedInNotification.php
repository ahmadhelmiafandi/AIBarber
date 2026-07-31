<?php

namespace App\Notifications;

use App\Models\Queue;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class QueueCheckedInNotification extends Notification
{
    use Queueable;

    public function __construct(public Queue $queueModel) {}

    public function via(mixed $notifiable): array
    {
        return ['database'];
    }

    public function toArray(mixed $notifiable): array
    {
        return [
            'type' => 'queue_checked_in',
            'queue_id' => $this->queueModel->id,
            'queue_number' => $this->queueModel->queue_number,
            'message' => "Check-in successful for queue #{$this->queueModel->queue_number}.",
        ];
    }
}
