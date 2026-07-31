<?php

namespace App\Services\Queue;

use App\Models\Booking;
use App\Models\Queue;
use App\Models\QueueEvent;
use App\Models\Service;

class QueueGenerationService
{
    public function __construct(
        private readonly QueueSchedulingEngine $schedulingEngine,
        private readonly QueueBroadcastOrchestrator $broadcastOrchestrator
    ) {}

    public function generateQueue(Booking $booking, Service $service): Queue
    {
        $branchId = $booking->branch_id;
        $bookingDateStr = $booking->booking_date instanceof \DateTimeInterface
            ? $booking->booking_date->format('Y-m-d')
            : (string) $booking->booking_date;

        $bookingTimeStr = $booking->booking_time instanceof \DateTimeInterface
            ? $booking->booking_time->format('H:i')
            : substr((string) $booking->booking_time, 0, 5);

        // 1. Queue Number & Code Calculation (branch_id + booking_date)
        $maxQueueNumber = Queue::where('branch_id', $branchId)
            ->whereDate('booking_date', $bookingDateStr)
            ->lockForUpdate()
            ->max('queue_number') ?? 0;

        $nextQueueNumber = $maxQueueNumber + 1;
        $queueCode = sprintf('A-%03d', $nextQueueNumber);

        // 2. Find preceding active queue finish anchor for the SAME barber on the SAME date with booking_time < requestedTime
        $precedingQueue = Queue::where('branch_id', $branchId)
            ->whereDate('booking_date', $bookingDateStr)
            ->whereHas('booking', function ($q) use ($booking, $bookingDateStr, $bookingTimeStr) {
                $q->where('barber_id', $booking->barber_id)
                  ->whereDate('booking_date', $bookingDateStr)
                  ->whereTime('booking_time', '<', $bookingTimeStr);
            })
            ->whereIn('status', ['waiting', 'checked_in', 'called', 'on_service'])
            ->orderBy('estimated_finish_time', 'desc')
            ->first();

        $precedingFinishAnchor = $precedingQueue ? $precedingQueue->estimated_finish_time : null;

        // 3. Delegate to Single Source of Truth: QueueSchedulingEngine
        $timing = $this->schedulingEngine->calculateSlotTiming(
            $bookingDateStr,
            $bookingTimeStr,
            $service->estimated_duration_minutes,
            $precedingFinishAnchor
        );

        // 4. Create Queue Record (initial version = 1)
        $queue = Queue::create([
            'booking_id' => $booking->id,
            'branch_id' => $branchId,
            'booking_date' => $bookingDateStr,
            'queue_number' => $nextQueueNumber,
            'queue_code' => $queueCode,
            'status' => 'waiting',
            'estimated_start_time' => $timing['estimated_start_time'],
            'estimated_finish_time' => $timing['estimated_finish_time'],
            'version' => 1,
        ]);

        // 5. Record Initial Queue Event
        QueueEvent::create([
            'queue_id' => $queue->id,
            'status' => 'waiting',
            'notes' => 'Initial queue generated upon booking confirmation.',
        ]);

        // 6. Broadcast queue_created Event
        $this->broadcastOrchestrator->broadcastQueueUpdate($queue, 'queue_created');

        return $queue;
    }
}
