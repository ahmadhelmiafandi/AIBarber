<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AiRecommendationItem extends Model {
    use HasUuids, HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;
    protected $fillable = ['recommendation_id', 'hairstyle_id', 'rank', 'score', 'reason'];

    protected function casts(): array { return ['rank' => 'integer', 'score' => 'integer']; }

    public function recommendation(): BelongsTo { return $this->belongsTo(AiRecommendation::class, 'recommendation_id'); }
    public function hairstyle(): BelongsTo { return $this->belongsTo(Hairstyle::class); }
}