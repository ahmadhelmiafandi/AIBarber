<?php

namespace App\Services\Notification\Channels;

use App\Models\NotificationDelivery;
use App\Services\Notification\Contracts\NotificationChannelInterface;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class EmailChannel implements NotificationChannelInterface
{
    /**
     * Resolver to simulate failures during testing.
     */
    public static ?\Closure $shouldFailResolver = null;

    public function send(NotificationDelivery $delivery, mixed $notifiable, array $data): ?string
    {
        if (static::$shouldFailResolver) {
            $shouldFail = (static::$shouldFailResolver)($delivery, $notifiable);
            if ($shouldFail) {
                throw new \RuntimeException("Email provider transport failed.");
            }
        }

        Log::info("Email sent to user", [
            'delivery_id' => $delivery->id,
            'notifiable' => $notifiable?->id ?? 'unknown',
            'data' => $data,
        ]);

        return 'email_' . Str::uuid();
    }
}
