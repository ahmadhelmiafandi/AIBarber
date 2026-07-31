<?php

namespace App\Console\Commands;

use App\Models\Queue;
use App\Services\Notification\NotificationDeliveryService;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class SendQueueRemindersCommand extends Command
{
    protected $signature = 'queue:send-reminders {--window=15m : Reminder time window}';
    protected $description = 'Send queue reminder notifications for upcoming appointments';

    public function handle(NotificationDeliveryService $deliveryService): int
    {
        $window = (string) ($this->option('window') ?: '15m');

        // Target queues starting within the 15m window
        $now = Carbon::now();
        $targetStart = $now->copy()->addMinutes(15);

        $queues = Queue::with('booking.customer')
            ->whereIn('status', ['waiting', 'checked_in'])
            ->whereBetween('estimated_start_time', [$now, $targetStart->copy()->addMinutes(5)])
            ->get();

        $sentCount = 0;
        foreach ($queues as $queue) {
            $customer = $queue->booking?->customer;
            if ($customer) {
                $notification = $deliveryService->sendReminder($customer, $queue, $window);
                if ($notification) {
                    $sentCount++;
                }
            }
        }

        $this->info("Dispatched {$sentCount} reminder notifications for window {$window}.");
        return self::SUCCESS;
    }
}
