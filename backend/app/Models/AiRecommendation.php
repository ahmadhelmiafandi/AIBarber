<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AiRecommendation extends Model
{
    use HasUuids, HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'user_id',
        'status',
        'idempotency_key',
        'face_profile_id',
        'engine_version',
        'rule_version',
        'image_url',
        'error_message',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function faceProfile(): BelongsTo
    {
        return $this->belongsTo(CustomerFaceProfile::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(AiRecommendationItem::class, 'recommendation_id');
    }

    public function previews(): HasMany
    {
        return $this->hasMany(AiPreview::class, 'recommendation_id');
    }
}