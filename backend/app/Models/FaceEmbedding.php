<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class FaceEmbedding extends Model {
    use HasUuids, HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;
    const UPDATED_AT = null;
    protected $fillable = ['user_id', 'embedding_vector', 'model'];

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
}