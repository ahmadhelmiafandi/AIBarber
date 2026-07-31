<?php

namespace App\Services\Queue;

use App\Models\Barber;
use App\Models\Booking;
use App\Models\Branch;
use App\Models\Queue;
use App\Models\QueueEvent;
use App\Models\SystemSetting;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class QueueCheckInService
{
    public function __construct(
        private readonly QueueRecalculationOrchestrator $recalculationOrchestrator,
        private readonly QueueBroadcastOrchestrator $broadcastOrchestrator
    ) {}

    public function checkIn(string $queueId): Queue
    {
        $isExpired = false;

        $queue = DB::transaction(function () use ($queueId, &$isExpired) {
            // 1. Lock Branch (Global Lock Order Step 1)
            /** @var Queue|null $rawQueue */
            $rawQueue = Queue::find($queueId);
            if (!$rawQueue) {
                throw ValidationException::withMessages([
                    'queue' => ['Antrian tidak ditemukan.'],
                ]);
            }

            Branch::where('id', $rawQueue->branch_id)->lockForUpdate()->first();

            // 2. Lock Barber (Global Lock Order Step 2)
            $rawBooking = Booking::find($rawQueue->booking_id);
            if ($rawBooking && $rawBooking->barber_id) {
                Barber::where('id', $rawBooking->barber_id)->lockForUpdate()->first();
            }

            // 3. Lock Booking (Global Lock Order Step 3)
            $booking = Booking::where('id', $rawQueue->booking_id)->lockForUpdate()->first();
            if (!$booking) {
                throw ValidationException::withMessages([
                    'queue' => ['Reservasi terkait tidak ditemukan.'],
                ]);
            }

            // 4. Lock Queue (Global Lock Order Step 4)
            /** @var Queue $queue */
            $queue = Queue::where('id', $queueId)->lockForUpdate()->first();

            // 2. Validate Status Matrix
            if ($booking->status === 'cancelled') {
                throw ValidationException::withMessages([
                    'queue' => ['Reservasi ini telah dibatalkan.'],
                ]);
            }

            if ($booking->status === 'completed' || $queue->status === 'completed') {
                throw ValidationException::withMessages([
                    'queue' => ['Antrian ini sudah selesai diproses.'],
                ]);
            }

            if ($booking->status === 'no_show' || $queue->status === 'skipped') {
                throw ValidationException::withMessages([
                    'queue' => ['Antrian ini telah kadaluarsa / ditandai no-show.'],
                ]);
            }

            if ($queue->status === 'checked_in') {
                throw ValidationException::withMessages([
                    'queue' => ['Antrian ini sudah melakukan check-in.'],
                ]);
            }

            if ($queue->status !== 'waiting' || $booking->status !== 'confirmed') {
                throw ValidationException::withMessages([
                    'queue' => ['Status antrian atau reservasi tidak valid untuk check-in.'],
                ]);
            }

            // 3. Resolve Branch Timezone & Configurable Windows
            $timezone = SystemSetting::where('key', 'branch_default_timezone')->value('value') ?: 'Asia/Jakarta';
            $earlyWindow = (int) (SystemSetting::where('key', 'queue_checkin_early_window_minutes')->value('value') ?? 30);
            $lateTolerance = (int) (SystemSetting::where('key', 'queue_checkin_late_tolerance_minutes')->value('value') ?? 15);

            $now = Carbon::now($timezone);

            $bookingDateStr = $queue->booking_date instanceof \DateTimeInterface
                ? $queue->booking_date->format('Y-m-d')
                : (string) $queue->booking_date;

            $bookingTimeStr = $booking->booking_time instanceof \DateTimeInterface
                ? $booking->booking_time->format('H:i')
                : substr((string) $booking->booking_time, 0, 5);

            /** @var Carbon $estimatedStart */
            $estimatedStart = $queue->estimated_start_time
                ? $queue->estimated_start_time->copy()->setTimezone($timezone)
                : Carbon::createFromFormat('Y-m-d H:i', "{$bookingDateStr} {$bookingTimeStr}", $timezone);

            $earlyBoundary = $estimatedStart->copy()->subMinutes($earlyWindow);
            $lateBoundary = $estimatedStart->copy()->addMinutes($lateTolerance);

            // 4. Boundary Checks (Inclusive: now >= earlyBoundary && now <= lateBoundary)
            if ($now->lessThan($earlyBoundary)) {
                throw ValidationException::withMessages([
                    'queue' => ["Waktu check-in belum dibuka. Silakan check-in mulai {$earlyBoundary->format('H:i')}."],
                ]);
            }

            // Late Boundary Expired: Atomic transition to skipped / no_show
            if ($now->greaterThan($lateBoundary)) {
                $queue->update([
                    'status' => 'skipped',
                    'version' => $queue->version + 1,
                ]);
                $booking->update(['status' => 'no_show']);

                QueueEvent::create([
                    'queue_id' => $queue->id,
                    'status' => 'skipped',
                    'notes' => 'Check-in window expired past late tolerance limit.',
                ]);

                // Broadcast queue_skipped event
                $this->broadcastOrchestrator->broadcastQueueUpdate($queue, 'queue_skipped');

                DB::afterCommit(function () use ($queue, $booking) {
                    $customer = \App\Models\User::find($booking->customer_id);
                    if ($customer) {
                        app(\App\Services\Notification\NotificationDeliveryService::class)->sendQueueSkipped($customer, $queue);
                    }
                });

                // Trigger downstream recalculation
                if ($booking->barber_id) {
                    $this->recalculationOrchestrator->recalculateForBarber(
                        $queue->branch_id,
                        $booking->barber_id,
                        $bookingDateStr
                    );
                }

                $isExpired = true;
                return $queue;
            }

            // 5. Successful Check-in Transition
            $queue->update([
                'status' => 'checked_in',
                'version' => $queue->version + 1,
            ]);

            QueueEvent::create([
                'queue_id' => $queue->id,
                'status' => 'checked_in',
                'notes' => 'Customer checked in successfully.',
            ]);

            // Broadcast queue_checked_in event
            $this->broadcastOrchestrator->broadcastQueueUpdate($queue, 'queue_checked_in');

            DB::afterCommit(function () use ($queue, $booking) {
                $customer = \App\Models\User::find($booking->customer_id);
                if ($customer) {
                    app(\App\Services\Notification\NotificationDeliveryService::class)->sendQueueCheckedIn($customer, $queue);
                }
            });

            return $queue;
        });

        if ($isExpired) {
            throw ValidationException::withMessages([
                'queue' => ['Waktu check-in telah kadaluarsa (melewati batas toleransi 15 menit). Reservasi Anda ditandai no-show.'],
            ]);
        }

        return $queue;
    }
}
