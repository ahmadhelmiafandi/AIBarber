<?php

namespace App\Services\Notification\Contracts;

use App\Models\NotificationDelivery;

interface NotificationChannelInterface
{
    /**
     * Send notification through the channel.
     * 
     * @param NotificationDelivery $delivery
     * @param mixed $notifiable
     * @param array $data
     * @return string|null Provider message ID
     * @throws \Throwable If sending fails
     */
    public function send(NotificationDelivery $delivery, mixed $notifiable, array $data): ?string;
}
