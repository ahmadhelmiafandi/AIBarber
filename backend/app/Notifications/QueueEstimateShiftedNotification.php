<?php

namespace App\Notifications;

use App\Models\Queue;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class QueueEstimateShiftedNotification extends Notification
{
    use Queueable;

    public int $version;

    public function __construct(public Queue $queueModel)
    {
        // Must capture queue version AFTER update
        $this->version = (int) $queueModel->version;
    }

    public function via(mixed $notifiable): array
    {
        return ['database'];
    }

    public function toArray(mixed $notifiable): array
    {
        return [
            'type' => 'queue_estimate_shifted',
            'queue_id' => $this->queueModel->id,
            'queue_number' => $this->queueModel->queue_number,
            'new_estimated_start' => $this->queueModel->estimated_start_time?->toIso8601String(),
            'version' => $this->version,
            'message' => "Estimated start time for queue #{$this->queueModel->queue_number} has been updated.",
        ];
    }

    public function getIdempotencyKey(string $channel): string
    {
        return "notif:queue:{$this->queueModel->id}:shifted:v{$this->version}:{$channel}";
    }
}
