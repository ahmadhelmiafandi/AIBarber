<?php

namespace App\Services\Notification;

use App\Models\Booking;
use App\Models\Notification;
use App\Models\NotificationDelivery;
use App\Notifications\BookingConfirmedNotification;
use App\Notifications\QueueCalledNotification;
use App\Notifications\QueueCheckedInNotification;
use App\Notifications\QueueEstimateShiftedNotification;
use App\Notifications\QueueReminderNotification;
use App\Notifications\QueueSkippedNotification;
use App\Services\Notification\Channels\EmailChannel;
use App\Services\Notification\Channels\InAppChannel;
use App\Services\Notification\Channels\WhatsAppChannel;
use App\Services\Notification\Contracts\NotificationChannelInterface;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class NotificationDeliveryService
{
    private array $channelDrivers;

    public function __construct()
    {
        $this->channelDrivers = [
            'in_app' => new InAppChannel(),
            'email' => new EmailChannel(),
            'whatsapp' => new WhatsAppChannel(),
        ];
    }

    /**
     * Dispatch a notification to a notifiable entity across specified channels.
     */
    public function dispatchNotification(mixed $notifiable, mixed $notificationInstance, array $channels = ['in_app', 'email', 'whatsapp']): ?Notification
    {
        if (!$notifiable) {
            return null;
        }

        $data = method_exists($notificationInstance, 'toArray')
            ? $notificationInstance->toArray($notifiable)
            : [];

        // 1. Create parent record in notifications table
        $notificationModel = Notification::create([
            'id' => (string) Str::uuid(),
            'type' => get_class($notificationInstance),
            'notifiable_type' => get_class($notifiable),
            'notifiable_id' => $notifiable->id,
            'data' => json_encode($data),
            'read_at' => null,
        ]);

        // 2. Create channel delivery records respecting user preferences
        $deliveries = $this->createDeliveries($notificationModel, $channels, $notifiable);

        // 3. Process each channel delivery independently
        foreach ($deliveries as $delivery) {
            $this->processDelivery($delivery, $notifiable, $data);
        }

        return $notificationModel;
    }

    public function sendBookingConfirmed(mixed $notifiable, Booking $booking, array $channels = ['in_app', 'email', 'whatsapp']): ?Notification
    {
        return $this->dispatchNotification($notifiable, new BookingConfirmedNotification($booking), $channels);
    }

    public function sendQueueCheckedIn(mixed $notifiable, mixed $queue, array $channels = ['in_app', 'email', 'whatsapp']): ?Notification
    {
        return $this->dispatchNotification($notifiable, new QueueCheckedInNotification($queue), $channels);
    }

    public function sendQueueCalled(mixed $notifiable, mixed $queue, array $channels = ['in_app', 'email', 'whatsapp']): ?Notification
    {
        return $this->dispatchNotification($notifiable, new QueueCalledNotification($queue), $channels);
    }

    public function sendQueueSkipped(mixed $notifiable, mixed $queue, array $channels = ['in_app', 'email', 'whatsapp']): ?Notification
    {
        return $this->dispatchNotification($notifiable, new QueueSkippedNotification($queue), $channels);
    }

    /**
     * Dispatch QueueEstimateShiftedNotification only if shift exceeds threshold (> 10 minutes).
     */
    public function sendEstimateShifted(mixed $notifiable, mixed $queue, int $shiftMinutes, array $channels = ['in_app', 'email', 'whatsapp']): ?Notification
    {
        if ($shiftMinutes <= 10) {
            return null;
        }

        $notification = new QueueEstimateShiftedNotification($queue);
        return $this->dispatchNotification($notifiable, $notification, $channels);
    }

    /**
     * Dispatch QueueReminderNotification ensuring single reminder window idempotency.
     */
    public function sendReminder(mixed $notifiable, mixed $queue, string $window = '15m', array $channels = ['in_app', 'email', 'whatsapp']): ?Notification
    {
        $reminderKey = "notif_reminder:{$queue->id}:{$window}";

        // Guarantee single reminder window execution
        if (!Cache::add($reminderKey, true, 86400)) {
            return null;
        }

        $notification = new QueueReminderNotification($queue, $window);
        return $this->dispatchNotification($notifiable, $notification, $channels);
    }

    /**
     * Register or retrieve delivery entries in notification_deliveries table.
     * Uses DB unique constraint protection UNIQUE(notification_id, channel) and respects user preferences.
     */
    public function createDeliveries(Notification $notification, array $channels, mixed $notifiable = null): array
    {
        $deliveries = [];
        foreach ($channels as $channel) {
            // Check user preferences if supported by notifiable entity
            if ($notifiable && method_exists($notifiable, 'wantsChannel') && !$notifiable->wantsChannel($channel)) {
                continue;
            }

            $delivery = NotificationDelivery::firstOrCreate(
                [
                    'notification_id' => $notification->id,
                    'channel' => $channel,
                ],
                [
                    'status' => NotificationDelivery::STATUS_PENDING,
                    'attempts' => 0,
                ]
            );
            $deliveries[] = $delivery;
        }
        return $deliveries;
    }

    /**
     * Process an individual channel delivery.
     * Atomic-claimed, scoped per channel, retry-safe, with DB as Source of Truth.
     */
    public function processDelivery(NotificationDelivery $delivery, mixed $notifiable, array $data): bool
    {
        // 1. Check DB Source of Truth (prevent re-sending completed delivery)
        $currentDelivery = NotificationDelivery::where('id', $delivery->id)->first();
        if (!$currentDelivery || $currentDelivery->status === NotificationDelivery::STATUS_SENT) {
            return false;
        }

        // 2. Scoped per-channel transient claim key in Cache
        $claimKey = "notif_claim:{$delivery->notification_id}:{$delivery->channel}";

        // Attempt in-flight claim lock (30s TTL during execution)
        $acquired = Cache::add($claimKey, true, 30);
        if (!$acquired) {
            return false;
        }

        try {
            // 3. Atomic claim transition in DB: pending/failed -> processing
            $claimed = DB::transaction(function () use ($delivery) {
                $record = NotificationDelivery::where('id', $delivery->id)
                    ->whereIn('status', [NotificationDelivery::STATUS_PENDING, NotificationDelivery::STATUS_FAILED])
                    ->lockForUpdate()
                    ->first();

                if (!$record) {
                    return false;
                }

                $record->status = NotificationDelivery::STATUS_PROCESSING;
                $record->attempts = $record->attempts + 1;
                $record->last_attempt_at = Carbon::now();
                $record->save();

                return true;
            });

            if (!$claimed) {
                Cache::forget($claimKey);
                return false;
            }

            $delivery->refresh();

            // 4. Execute external channel send outside primary DB transaction
            $driver = $this->channelDrivers[$delivery->channel] ?? null;
            if (!$driver instanceof NotificationChannelInterface) {
                throw new \InvalidArgumentException("Unsupported notification channel: {$delivery->channel}");
            }

            $providerMsgId = $driver->send($delivery, $notifiable, $data);

            // 5. Success transition: update DB status to sent
            $delivery->status = NotificationDelivery::STATUS_SENT;
            $delivery->sent_at = Carbon::now();
            $delivery->failed_at = null;
            $delivery->provider_message_id = $providerMsgId;
            $delivery->error_log = null;
            $delivery->save();

            Cache::forget($claimKey);
            return true;

        } catch (\Throwable $e) {
            // 6. Failure transition: update DB status to failed and release claim lock to allow retries
            $delivery->refresh();
            $delivery->status = NotificationDelivery::STATUS_FAILED;
            $delivery->failed_at = Carbon::now();
            $delivery->error_log = $e->getMessage();
            $delivery->save();

            Cache::forget($claimKey);

            Log::error("Notification channel delivery failed", [
                'delivery_id' => $delivery->id,
                'channel' => $delivery->channel,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }
}
