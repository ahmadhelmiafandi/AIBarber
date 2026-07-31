<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QueueResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $queuePosition = null;
        $customersAhead = null;

        if (in_array($this->status, ['waiting', 'checked_in', 'called', 'on_service'])) {
            $dateStr = is_string($this->booking_date)
                ? $this->booking_date
                : ($this->booking_date?->format('Y-m-d') ?? ($this->created_at ? $this->created_at->format('Y-m-d') : null));

            $aheadCount = \App\Models\Queue::where('branch_id', $this->branch_id)
                ->whereIn('status', ['waiting', 'checked_in', 'called', 'on_service'])
                ->where(function ($q) {
                    $q->where('estimated_start_time', '<', $this->estimated_start_time)
                      ->orWhere(function ($q2) {
                          $q2->where('estimated_start_time', '=', $this->estimated_start_time)
                             ->where('queue_number', '<', $this->queue_number);
                      });
                })
                ->when($dateStr, function ($q, $date) {
                    $q->whereDate('booking_date', $date);
                })
                ->count();

            $queuePosition = $aheadCount + 1;
            $customersAhead = $aheadCount;
        }

        return [
            'queue_id' => $this->id,
            'booking_id' => $this->booking_id,
            'branch_id' => $this->branch_id,
            'booking_date' => is_string($this->booking_date) ? $this->booking_date : $this->booking_date?->format('Y-m-d'),
            'queue_number' => (int) $this->queue_number,
            'queue_code' => $this->queue_code,
            'status' => $this->status,
            'version' => (int) ($this->version ?? 1),
            'queue_position' => $queuePosition,
            'customers_ahead' => $customersAhead,
            'estimated_start_time' => $this->estimated_start_time?->toISOString(),
            'estimated_finish_time' => $this->estimated_finish_time?->toISOString(),
            'actual_start_time' => $this->actual_start_time?->toISOString(),
            'actual_finish_time' => $this->actual_finish_time?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'booking' => new BookingResource($this->whenLoaded('booking')),
        ];
    }
}
