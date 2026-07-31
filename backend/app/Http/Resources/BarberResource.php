<?php
namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BarberResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user' => [
                'id' => $this->user->id ?? null,
                'name' => $this->user->name ?? null,
            ],
            'branch' => [
                'id' => $this->branch->id ?? null,
                'name' => $this->branch->name ?? null,
            ],
            'specialization' => $this->specialization,
            'rating_avg' => (float) $this->rating_avg,
            'total_reviews' => $this->total_reviews,
            'is_active' => $this->is_active,
        ];
    }
}
