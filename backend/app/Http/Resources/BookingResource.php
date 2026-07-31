<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $queue = $this->relationLoaded('queue') ? $this->queue : $this->queue;

        return [
            'booking_id' => $this->id,
            'booking_code' => $this->booking_code,
            'customer_id' => $this->customer_id,
            'branch_id' => $this->branch_id,
            'barber_id' => $this->barber_id,
            'service_id' => $this->service_id,
            'booking_date' => is_string($this->booking_date) ? $this->booking_date : $this->booking_date->format('Y-m-d'),
            'booking_time' => is_string($this->booking_time)
                ? substr($this->booking_time, 0, 5)
                : $this->booking_time->format('H:i'),
            'total_price' => (float) $this->total_price,
            'status' => $this->status,
            'queue_number' => $queue ? (int) $queue->queue_number : null,
            'queue_code' => $queue ? $queue->queue_code : null,
            'estimated_start_time' => $queue?->estimated_start_time?->toISOString(),
            'estimated_finish_time' => $queue?->estimated_finish_time?->toISOString(),
            'queue' => $queue ? new QueueResource($queue) : null,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
