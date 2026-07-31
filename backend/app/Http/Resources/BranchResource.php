<?php
namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BranchResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'address' => $this->address,
            'phone' => $this->phone,
            'google_maps_url' => $this->google_maps_url,
            'opening_hours' => $this->opening_hours,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at,
        ];
    }
}
