<?php

namespace App\Services\Notification\Channels;

use App\Models\NotificationDelivery;
use App\Policies\WhatsAppRateLimitPolicy;
use App\Services\Notification\Contracts\NotificationChannelInterface;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class WhatsAppChannel implements NotificationChannelInterface
{
    /**
     * Resolver to simulate failures during testing.
     */
    public static ?\Closure $shouldFailResolver = null;

    public function __construct(
        private readonly WhatsAppRateLimitPolicy $rateLimitPolicy = new WhatsAppRateLimitPolicy()
    ) {}

    public function send(NotificationDelivery $delivery, mixed $notifiable, array $data): ?string
    {
        $customerId = (string) ($notifiable?->id ?? $data['customer_id'] ?? 'unknown');

        if (!$this->rateLimitPolicy->allow($customerId)) {
            throw new \RuntimeException("Daily WhatsApp rate limit reached (5/5)");
        }

        if (static::$shouldFailResolver) {
            $shouldFail = (static::$shouldFailResolver)($delivery, $notifiable);
            if ($shouldFail) {
                throw new \RuntimeException("WhatsApp API gateway connection timed out.");
            }
        }

        $this->rateLimitPolicy->increment($customerId);

        Log::info("WhatsApp sent to customer", [
            'delivery_id' => $delivery->id,
            'customer_id' => $customerId,
            'data' => $data,
        ]);

        return 'wa_' . Str::uuid();
    }
}
