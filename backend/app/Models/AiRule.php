<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AiRule extends Model {
    use HasUuids, HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;
    protected $fillable = ['face_shape', 'hairstyle_id', 'score_boost', 'is_active', 'prompt_template', 'negative_prompt'];

    protected function casts(): array { return ['score_boost' => 'integer', 'is_active' => 'boolean']; }

    public function hairstyle(): BelongsTo { return $this->belongsTo(Hairstyle::class); }
}