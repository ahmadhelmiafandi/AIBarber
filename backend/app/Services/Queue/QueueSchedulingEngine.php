<?php

namespace App\Services\Queue;

use App\Models\Queue;
use App\Models\Service;
use App\Models\SystemSetting;
use Illuminate\Support\Carbon;

class QueueSchedulingEngine
{
    /**
     * Resolves global system timezone.
     */
    public function getSystemTimezone(): string
    {
        return SystemSetting::where('key', 'branch_default_timezone')->value('value') ?: 'Asia/Jakarta';
    }

    /**
     * Calculates estimated start and finish times for a target slot.
     *
     * @param string $bookingDate Format: Y-m-d
     * @param string $bookingTime Format: H:i
     * @param int $durationMinutes
     * @param Carbon|null $precedingFinishAnchor UTC or local Carbon instance of preceding queue finish time
     * @return array{estimated_start_time: Carbon, estimated_finish_time: Carbon}
     */
    public function calculateSlotTiming(
        string $bookingDate,
        string $bookingTime,
        int $durationMinutes,
        ?Carbon $precedingFinishAnchor = null
    ): array {
        $timezone = $this->getSystemTimezone();
        $requestedStart = Carbon::createFromFormat('Y-m-d H:i', "{$bookingDate} {$bookingTime}", $timezone)->setTimezone('UTC');

        if ($precedingFinishAnchor && $precedingFinishAnchor->greaterThan($requestedStart)) {
            $estimatedStart = $precedingFinishAnchor->copy();
        } else {
            $estimatedStart = $requestedStart;
        }

        $estimatedFinish = $estimatedStart->copy()->addMinutes($durationMinutes);

        return [
            'estimated_start_time' => $estimatedStart,
            'estimated_finish_time' => $estimatedFinish,
        ];
    }
}
