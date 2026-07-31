<?php

namespace App\Console\Commands;

use App\Models\SystemSetting;
use App\Services\Queue\QueueRecalculationOrchestrator;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class CheckLateServicesCommand extends Command
{
    protected $signature = 'queue:check-late-services';
    protected $description = 'Detect overdue on_service queues and recalculate downstream queue schedules.';

    public function handle(QueueRecalculationOrchestrator $orchestrator): int
    {
        $timezone = SystemSetting::where('key', 'branch_default_timezone')->value('value') ?: 'Asia/Jakarta';
        $nowInTimezone = Carbon::now($timezone);
        $nowUtc = $nowInTimezone->copy()->setTimezone('UTC');

        // Query overdue on_service queues joined with bookings to prevent N+1 queries
        $overdueTuples = DB::table('queues')
            ->join('bookings', 'queues.booking_id', '=', 'bookings.id')
            ->where('queues.status', 'on_service')
            ->where('queues.estimated_finish_time', '<', $nowUtc->format('Y-m-d H:i:s'))
            ->select('queues.branch_id', 'bookings.barber_id', 'queues.booking_date')
            ->distinct()
            ->get();

        $processedCount = 0;

        foreach ($overdueTuples as $tuple) {
            $bookingDateStr = Carbon::parse($tuple->booking_date)->format('Y-m-d');

            $orchestrator->recalculateForBarber(
                $tuple->branch_id,
                $tuple->barber_id,
                $bookingDateStr,
                $nowInTimezone
            );

            $processedCount++;
        }

        $this->info("Late service check completed. Processed {$processedCount} barber queue timeline(s).");
        return self::SUCCESS;
    }
}
