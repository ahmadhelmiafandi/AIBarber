<?php

namespace App\Policies;

use Illuminate\Support\Facades\Cache;

class WhatsAppRateLimitPolicy
{
    public const MAX_PER_DAY = 5;

    /**
     * Check if a WhatsApp message can be sent to the customer today.
     */
    public function allow(string $customerId): bool
    {
        $count = $this->getCount($customerId);
        return $count < self::MAX_PER_DAY;
    }

    /**
     * Record a successful WhatsApp message dispatch for the customer.
     */
    public function increment(string $customerId): int
    {
        $key = $this->getCacheKey($customerId);
        $ttl = now()->diffInSeconds(now()->endOfDay()) + 1;

        if (!Cache::has($key)) {
            Cache::put($key, 0, $ttl);
        }

        return (int) Cache::increment($key);
    }

    /**
     * Get the current count of WhatsApp messages sent to the customer today.
     */
    public function getCount(string $customerId): int
    {
        return (int) Cache::get($this->getCacheKey($customerId), 0);
    }

    private function getCacheKey(string $customerId): string
    {
        $date = now()->format('Y-m-d');
        return "wa_limit:{$customerId}:{$date}";
    }
}
