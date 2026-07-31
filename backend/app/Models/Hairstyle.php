<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Hairstyle extends Model
{
    use HasUuids, SoftDeletes, HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'name',
        'category',
        'suitable_face_shapes',
        'suitable_hair_textures',
        'unsuitable_face_shapes',
        'maintenance_level',
        'difficulty',
        'description',
        'estimated_duration_minutes',
        'price',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'suitable_face_shapes' => 'array',
            'suitable_hair_textures' => 'array',
            'unsuitable_face_shapes' => 'array',
            'is_active' => 'boolean',
            'price' => 'decimal:2',
            'estimated_duration_minutes' => 'integer',
        ];
    }

    public function rules(): HasMany
    {
        return $this->hasMany(AiRule::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(HairstyleImage::class);
    }

    public function previews(): HasMany
    {
        return $this->hasMany(AiPreview::class);
    }
}