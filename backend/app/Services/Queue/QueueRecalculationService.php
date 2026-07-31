<?php

namespace App\Services\Queue;

use App\Models\Queue;
use App\Models\QueueEvent;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class QueueRecalculationService
{
    public function __construct(
        private readonly QueueSchedulingEngine $schedulingEngine,
        private readonly QueueBroadcastOrchestrator $broadcastOrchestrator
    ) {}

    /**
     * Core calculation logic. Operates on pre-locked queues inside an active transaction.
     * Does NOT acquire DB locks independently.
     *
     * @param Collection<int, Queue> $activeQueues
     * @param Carbon $referenceTime
     * @param Carbon|null $explicitAnchor
     * @return int Number of queues whose estimates were updated
     */
    public function executeRecalculation(
        Collection $activeQueues,
        Carbon $referenceTime,
        ?Carbon $explicitAnchor = null
    ): int {
        if ($activeQueues->isEmpty()) {
            return 0;
        }

        $timezone = $this->schedulingEngine->getSystemTimezone();
        $referenceTimeUtc = $referenceTime->copy()->setTimezone('UTC');

        /** @var Carbon|null $currentFinishAnchor */
        $currentFinishAnchor = $explicitAnchor ? $explicitAnchor->copy()->setTimezone('UTC') : null;
        $updatedCount = 0;

        foreach ($activeQueues as $queue) {
            $booking = $queue->booking;
            if (!$booking) {
                continue;
            }

            // On-Service Queue handling
            if ($queue->status === 'on_service') {
                // estimated_start_time remains IMMUTABLE
                // Late extension: if referenceTime > estimated_finish_time, extend finish time
                if ($queue->estimated_finish_time && $referenceTimeUtc->greaterThan($queue->estimated_finish_time)) {
                    $newFinish = $referenceTimeUtc->copy();
                    $queue->update([
                        'estimated_finish_time' => $newFinish,
                        'version' => $queue->version + 1,
                    ]);
                    $this->broadcastOrchestrator->broadcastQueueUpdate($queue, 'queue_recalculated');
                    $currentFinishAnchor = $newFinish;
                    $updatedCount++;
                } else {
                    $currentFinishAnchor = $queue->estimated_finish_time ? $queue->estimated_finish_time->copy() : $referenceTimeUtc->copy();
                }
                continue;
            }

            // Waiting / Checked-in / Called Queues handling
            $bookingDateStr = $queue->booking_date instanceof \DateTimeInterface
                ? $queue->booking_date->format('Y-m-d')
                : (string) $queue->booking_date;

            $bookingTimeStr = $booking->booking_time instanceof \DateTimeInterface
                ? $booking->booking_time->format('H:i')
                : substr((string) $booking->booking_time, 0, 5);

            $serviceDuration = $booking->service ? $booking->service->estimated_duration_minutes : 30;

            $timing = $this->schedulingEngine->calculateSlotTiming(
                $bookingDateStr,
                $bookingTimeStr,
                $serviceDuration,
                $currentFinishAnchor
            );

            $newStart = $timing['estimated_start_time'];
            $newFinish = $timing['estimated_finish_time'];

            $oldStart = $queue->estimated_start_time;

            // Check if estimates changed
            $startChanged = !$oldStart || $oldStart->format('Y-m-d H:i:s') !== $newStart->format('Y-m-d H:i:s');
            $finishChanged = !$queue->estimated_finish_time || $queue->estimated_finish_time->format('Y-m-d H:i:s') !== $newFinish->format('Y-m-d H:i:s');

            if ($startChanged || $finishChanged) {
                // Calculate shift in minutes to determine event logging
                $shiftMinutes = $oldStart ? abs($newStart->diffInMinutes($oldStart)) : 0;

                $queue->update([
                    'estimated_start_time' => $newStart,
                    'estimated_finish_time' => $newFinish,
                    'version' => $queue->version + 1,
                ]);

                // Create QueueEvent ONLY if shift > 5 minutes
                if ($shiftMinutes > 5) {
                    QueueEvent::create([
                        'queue_id' => $queue->id,
                        'status' => 'recalculated',
                        'notes' => "Estimated start time adjusted by {$shiftMinutes} minutes.",
                    ]);
                }

                // Broadcast queue_recalculated Event
                $this->broadcastOrchestrator->broadcastQueueUpdate($queue, 'queue_recalculated');

                if ($shiftMinutes > 10) {
                    DB::afterCommit(function () use ($queue, $booking, $shiftMinutes) {
                        $customer = \App\Models\User::find($booking->customer_id);
                        if ($customer) {
                            app(\App\Services\Notification\NotificationDeliveryService::class)->sendEstimateShifted(
                                $customer,
                                $queue,
                                $shiftMinutes
                            );
                        }
                    });
                }

                $updatedCount++;
            }

            $currentFinishAnchor = $newFinish->copy();
        }

        return $updatedCount;
    }
}
