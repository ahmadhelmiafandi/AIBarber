<?php
namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AiRuleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'face_shape' => $this->face_shape,
            'hairstyle' => [
                'id' => $this->hairstyle->id ?? null,
                'name' => $this->hairstyle->name ?? null,
            ],
            'score_boost' => $this->score_boost,
            'prompt_template' => $this->prompt_template,
            'negative_prompt' => $this->negative_prompt,
            'is_active' => $this->is_active,
        ];
    }
}
