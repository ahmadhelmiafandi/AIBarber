<?php

namespace App\Services\Notification\Channels;

use App\Models\NotificationDelivery;
use App\Services\Notification\Contracts\NotificationChannelInterface;
use Illuminate\Support\Str;

class InAppChannel implements NotificationChannelInterface
{
    public function send(NotificationDelivery $delivery, mixed $notifiable, array $data): ?string
    {
        return 'inapp_' . Str::uuid();
    }
}
