<?php

namespace App\Notifications;

use App\Models\Queue;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class QueueSkippedNotification extends Notification
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
            'type' => 'queue_skipped',
            'queue_id' => $this->queueModel->id,
            'queue_number' => $this->queueModel->queue_number,
            'message' => "Queue #{$this->queueModel->queue_number} has been skipped.",
        ];
    }
}
