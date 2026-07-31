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

class QueueServiceStateService
{
    public function __construct(
        private readonly QueueRecalculationOrchestrator $recalculationOrchestrator,
        private readonly QueueBroadcastOrchestrator $broadcastOrchestrator
    ) {}

    public function callCustomer(string $queueId): Queue
    {
        return DB::transaction(function () use ($queueId) {
            $rawQueue = Queue::find($queueId);
            if (!$rawQueue) {
                throw ValidationException::withMessages(['queue' => ['Antrian tidak ditemukan.']]);
            }

            // Global Lock Order: Branch -> Barber -> Booking -> Queue
            Branch::where('id', $rawQueue->branch_id)->lockForUpdate()->first();

            $rawBooking = Booking::find($rawQueue->booking_id);
            if ($rawBooking && $rawBooking->barber_id) {
                Barber::where('id', $rawBooking->barber_id)->lockForUpdate()->first();
            }

            $booking = Booking::where('id', $rawQueue->booking_id)->lockForUpdate()->first();
            if (!$booking) {
                throw ValidationException::withMessages(['queue' => ['Reservasi terkait tidak ditemukan.']]);
            }

            $queue = Queue::where('id', $queueId)->lockForUpdate()->first();

            if ($queue->status === 'called') {
                throw ValidationException::withMessages(['queue' => ['Antrian ini sudah dipanggil.']]);
            }

            if ($queue->status !== 'checked_in') {
                throw ValidationException::withMessages(['queue' => ['Antrian harus berada dalam status checked_in untuk dapat dipanggil.']]);
            }

            if ($booking->status !== 'confirmed') {
                throw ValidationException::withMessages(['queue' => ['Status reservasi tidak valid untuk pemanggilan antrian.']]);
            }

            $queue->update([
                'status' => 'called',
                'version' => $queue->version + 1,
            ]);

            QueueEvent::create([
                'queue_id' => $queue->id,
                'status' => 'called',
                'notes' => 'Customer called for service.',
            ]);

            $this->broadcastOrchestrator->broadcastQueueUpdate($queue, 'queue_called');

            DB::afterCommit(function () use ($queue, $booking) {
                $customer = \App\Models\User::find($booking->customer_id);
                if ($customer) {
                    app(\App\Services\Notification\NotificationDeliveryService::class)->sendQueueCalled($customer, $queue);
                }
            });

            return $queue;
        });
    }

    public function startService(string $queueId): Queue
    {
        return DB::transaction(function () use ($queueId) {
            $rawQueue = Queue::find($queueId);
            if (!$rawQueue) {
                throw ValidationException::withMessages(['queue' => ['Antrian tidak ditemukan.']]);
            }

            // Global Lock Order: Branch -> Barber -> Booking -> Queue
            Branch::where('id', $rawQueue->branch_id)->lockForUpdate()->first();

            $rawBooking = Booking::find($rawQueue->booking_id);
            if ($rawBooking && $rawBooking->barber_id) {
                Barber::where('id', $rawBooking->barber_id)->lockForUpdate()->first();
            }

            $booking = Booking::where('id', $rawQueue->booking_id)->lockForUpdate()->first();
            if (!$booking) {
                throw ValidationException::withMessages(['queue' => ['Reservasi terkait tidak ditemukan.']]);
            }

            $queue = Queue::where('id', $queueId)->lockForUpdate()->first();

            if ($queue->status === 'on_service') {
                throw ValidationException::withMessages(['queue' => ['Layanan antrian ini sudah berjalan.']]);
            }

            if ($queue->status !== 'called') {
                throw ValidationException::withMessages(['queue' => ['Antrian harus dipanggil terlebih dahulu sebelum memulai layanan.']]);
            }

            if ($booking->status !== 'confirmed') {
                throw ValidationException::withMessages(['queue' => ['Status reservasi tidak valid untuk memulai layanan.']]);
            }

            $timezone = SystemSetting::where('key', 'branch_default_timezone')->value('value') ?: 'Asia/Jakarta';
            $nowUtc = Carbon::now($timezone)->setTimezone('UTC');

            $actualStart = $queue->actual_start_time ?? $nowUtc;

            $queue->update([
                'status' => 'on_service',
                'actual_start_time' => $actualStart,
                'version' => $queue->version + 1,
            ]);

            QueueEvent::create([
                'queue_id' => $queue->id,
                'status' => 'on_service',
                'notes' => 'Service started by barber.',
            ]);

            $this->broadcastOrchestrator->broadcastQueueUpdate($queue, 'queue_started');

            return $queue;
        });
    }

    public function completeService(string $queueId): Queue
    {
        return DB::transaction(function () use ($queueId) {
            $rawQueue = Queue::find($queueId);
            if (!$rawQueue) {
                throw ValidationException::withMessages(['queue' => ['Antrian tidak ditemukan.']]);
            }

            // Global Lock Order: Branch -> Barber -> Booking -> Queue
            Branch::where('id', $rawQueue->branch_id)->lockForUpdate()->first();

            $rawBooking = Booking::find($rawQueue->booking_id);
            if ($rawBooking && $rawBooking->barber_id) {
                Barber::where('id', $rawBooking->barber_id)->lockForUpdate()->first();
            }

            $booking = Booking::where('id', $rawQueue->booking_id)->lockForUpdate()->first();
            if (!$booking) {
                throw ValidationException::withMessages(['queue' => ['Reservasi terkait tidak ditemukan.']]);
            }

            $queue = Queue::where('id', $queueId)->lockForUpdate()->first();

            if ($queue->status === 'completed' || $booking->status === 'completed') {
                throw ValidationException::withMessages(['queue' => ['Antrian ini sudah selesai diproses.']]);
            }

            if ($queue->status !== 'on_service') {
                throw ValidationException::withMessages(['queue' => ['Layanan antrian harus sudah berjalan (on_service) untuk dapat diselesaikan.']]);
            }

            $timezone = SystemSetting::where('key', 'branch_default_timezone')->value('value') ?: 'Asia/Jakarta';
            $nowUtc = Carbon::now($timezone)->setTimezone('UTC');

            if ($queue->actual_start_time && $nowUtc->lessThan($queue->actual_start_time)) {
                throw ValidationException::withMessages(['queue' => ['Waktu selesai tidak boleh lebih awal dari waktu mulai layanan.']]);
            }

            $queue->update([
                'status' => 'completed',
                'actual_finish_time' => $nowUtc,
                'version' => $queue->version + 1,
            ]);

            $booking->update([
                'status' => 'completed',
            ]);

            QueueEvent::create([
                'queue_id' => $queue->id,
                'status' => 'completed',
                'notes' => 'Service completed by barber.',
            ]);

            $this->broadcastOrchestrator->broadcastQueueUpdate($queue, 'queue_completed');

            // Trigger downstream recalculation with explicit completion anchor
            $bookingDateStr = $queue->booking_date instanceof \DateTimeInterface
                ? $queue->booking_date->format('Y-m-d')
                : (string) $queue->booking_date;

            if ($booking->barber_id) {
                $this->recalculationOrchestrator->recalculateForBarber(
                    $queue->branch_id,
                    $booking->barber_id,
                    $bookingDateStr,
                    Carbon::now($timezone),
                    $nowUtc
                );
            }

            return $queue;
        });
    }
}
