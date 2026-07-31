<?php

namespace App\Services\Queue;

use App\Events\Realtime\CustomerQueueUpdatedEvent;
use App\Events\Realtime\PublicDisplayQueueUpdatedEvent;
use App\Events\Realtime\StaffQueueUpdatedEvent;
use App\Models\Queue;
use Illuminate\Support\Str;

class QueueBroadcastOrchestrator
{
    /**
     * Dispatches realtime events for a committed queue state update.
     */
    public function broadcastQueueUpdate(Queue $queue, string $eventType): void
    {
        $queue->loadMissing(['booking', 'booking.customer', 'booking.barber']);
        $booking = $queue->booking;

        $eventId = (string) Str::uuid();

        // 1. Staff Payload (Full operational details)
        $staffPayload = [
            'event_id' => $eventId,
            'event_type' => $eventType,
            'queue_id' => $queue->id,
            'booking_id' => $queue->booking_id,
            'queue_version' => (int) $queue->version,
            'branch_id' => $queue->branch_id,
            'barber_id' => $booking?->barber_id,
            'customer_id' => $booking?->customer_id,
            'customer_name' => $booking?->customer?->name,
            'customer_phone' => $booking?->customer?->phone,
            'queue_number' => (int) $queue->queue_number,
            'queue_code' => $queue->queue_code,
            'status' => $queue->status,
            'estimated_start_time' => $queue->estimated_start_time?->toIso8601String(),
            'estimated_finish_time' => $queue->estimated_finish_time?->toIso8601String(),
            'actual_start_time' => $queue->actual_start_time?->toIso8601String(),
            'actual_finish_time' => $queue->actual_finish_time?->toIso8601String(),
            'timestamp' => now()->toIso8601String(),
        ];

        // 2. Customer Payload (Customer's ticket details)
        $customerPayload = [
            'event_id' => $eventId,
            'event_type' => $eventType,
            'queue_id' => $queue->id,
            'booking_id' => $queue->booking_id,
            'queue_version' => (int) $queue->version,
            'queue_number' => (int) $queue->queue_number,
            'queue_code' => $queue->queue_code,
            'status' => $queue->status,
            'estimated_start_time' => $queue->estimated_start_time?->toIso8601String(),
            'estimated_finish_time' => $queue->estimated_finish_time?->toIso8601String(),
            'actual_start_time' => $queue->actual_start_time?->toIso8601String(),
            'actual_finish_time' => $queue->actual_finish_time?->toIso8601String(),
            'timestamp' => now()->toIso8601String(),
        ];

        // 3. Public Display Payload (Strictly Anonymized - NO PII)
        $publicDisplayPayload = [
            'event_id' => $eventId,
            'event_type' => $eventType,
            'queue_id' => $queue->id,
            'queue_version' => (int) $queue->version,
            'queue_number' => (int) $queue->queue_number,
            'queue_code' => $queue->queue_code,
            'status' => $queue->status,
            'estimated_start_time' => $queue->estimated_start_time?->toIso8601String(),
            'estimated_finish_time' => $queue->estimated_finish_time?->toIso8601String(),
            'timestamp' => now()->toIso8601String(),
        ];

        // Dispatch events
        event(new StaffQueueUpdatedEvent($queue->branch_id, $staffPayload));

        if ($booking?->customer_id) {
            event(new CustomerQueueUpdatedEvent($booking->customer_id, $customerPayload));
        }

        event(new PublicDisplayQueueUpdatedEvent($queue->branch_id, $publicDisplayPayload));
    }
}
