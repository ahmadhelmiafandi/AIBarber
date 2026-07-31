<?php

namespace App\Notifications;

use App\Models\Queue;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class QueueReminderNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Queue $queueModel,
        public string $window = '15m'
    ) {}

    public function via(mixed $notifiable): array
    {
        return ['database'];
    }

    public function toArray(mixed $notifiable): array
    {
        return [
            'type' => 'queue_reminder',
            'queue_id' => $this->queueModel->id,
            'queue_number' => $this->queueModel->queue_number,
            'window' => $this->window,
            'estimated_start_time' => $this->queueModel->estimated_start_time?->toIso8601String(),
            'message' => "Your queue #{$this->queueModel->queue_number} is scheduled in approximately {$this->window}.",
        ];
    }

    public function getReminderKey(): string
    {
        return "notif_reminder:{$this->queueModel->id}:{$this->window}";
    }
}
