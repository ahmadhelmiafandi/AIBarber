<?php

namespace App\Services\Queue;

use App\Models\Barber;
use App\Models\Branch;
use App\Models\Queue;
use App\Models\SystemSetting;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class QueueRecalculationOrchestrator
{
    public function __construct(
        private readonly QueueRecalculationService $recalculationService
    ) {}

    /**
     * Entry point for orchestrating queue recalculation.
     * Manages DB::transaction() and acquires locks in Global Lock Order:
     * Branch -> Barber -> Booking -> Queue
     */
    public function recalculateForBarber(
        string $branchId,
        string $barberId,
        string $bookingDate,
        ?Carbon $referenceTime = null,
        ?Carbon $explicitAnchor = null
    ): int {
        return DB::transaction(function () use ($branchId, $barberId, $bookingDate, $referenceTime, $explicitAnchor) {
            // 1. Lock Branch (Global Lock Order Step 1)
            $branch = Branch::where('id', $branchId)->lockForUpdate()->first();
            if (!$branch) {
                return 0;
            }

            // 2. Lock Barber (Global Lock Order Step 2)
            $barber = Barber::where('id', $barberId)->lockForUpdate()->first();
            if (!$barber) {
                return 0;
            }

            // 3. Resolve Reference Time in System Timezone
            $timezone = SystemSetting::where('key', 'branch_default_timezone')->value('value') ?: 'Asia/Jakarta';
            $refTime = $referenceTime ? $referenceTime->copy()->setTimezone($timezone) : Carbon::now($timezone);

            // 4. Query and Lock Active Queues in Deterministic Order (Global Lock Order Step 3 & 4)
            // Order: queue_number ASC, id ASC
            $activeQueues = Queue::with(['booking', 'booking.service'])
                ->where('branch_id', $branchId)
                ->whereDate('booking_date', $bookingDate)
                ->whereHas('booking', function ($q) use ($barberId) {
                    $q->where('barber_id', $barberId);
                })
                ->whereIn('status', ['waiting', 'checked_in', 'called', 'on_service'])
                ->orderBy('queue_number', 'asc')
                ->orderBy('id', 'asc')
                ->lockForUpdate()
                ->get();

            // 5. Delegate Core Recalculation Execution
            return $this->recalculationService->executeRecalculation($activeQueues, $refTime, $explicitAnchor);
        });
    }
}
