<?php

namespace App\Jobs;

use App\Models\NotificationDelivery;
use App\Services\Notification\NotificationDeliveryService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendNotificationDeliveryJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public function __construct(
        public NotificationDelivery $delivery,
        public mixed $notifiable,
        public array $data = []
    ) {}

    public function handle(NotificationDeliveryService $service): void
    {
        $service->processDelivery($this->delivery, $this->notifiable, $this->data);
    }
}
