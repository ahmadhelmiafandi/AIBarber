<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class HairstyleImage extends Model {
    use HasUuids, HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;
    protected $fillable = ['hairstyle_id', 'type', 'image_url', 'is_primary'];

    protected function casts(): array { return ['is_primary' => 'boolean']; }

    public function hairstyle(): BelongsTo { return $this->belongsTo(Hairstyle::class); }
}