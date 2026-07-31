<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiPreview extends Model
{
    use HasUuids, HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'user_id',
        'recommendation_id',
        'hairstyle_id',
        'original_image_url',
        'generated_image_url',
        'idempotency_key',
        'similarity_score',
        'threshold_used',
        'identity_verified',
        'metric',
        'verifier_version',
        'cost_usd',
        'status',
        'error_message',
    ];

    protected function casts(): array
    {
        return [
            'similarity_score' => 'decimal:3',
            'threshold_used' => 'decimal:3',
            'cost_usd' => 'decimal:5',
            'identity_verified' => 'boolean',
        ];
    }

    public function recommendation(): BelongsTo
    {
        return $this->belongsTo(AiRecommendation::class, 'recommendation_id');
    }

    public function hairstyle(): BelongsTo
    {
        return $this->belongsTo(Hairstyle::class);
    }
}