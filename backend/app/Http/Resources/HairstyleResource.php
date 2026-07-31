<?php
namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HairstyleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'category' => $this->category,
            'suitable_face_shapes' => $this->suitable_face_shapes,
            'unsuitable_face_shapes' => $this->unsuitable_face_shapes,
            'maintenance_level' => $this->maintenance_level,
            'difficulty' => $this->difficulty,
            'description' => $this->description,
        ];
    }
}
