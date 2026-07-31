<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AiAuditLog extends Model {
    use HasUuids, HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;
    const UPDATED_AT = null; // Migration only has created_at
    protected $fillable = ['user_id', 'operation_type', 'model_used', 'engine_version', 'duration_ms', 'similarity_score', 'cost_usd', 'status', 'request_payload', 'response_payload'];

    protected function casts(): array { 
        return [
            'duration_ms' => 'integer', 
            'similarity_score' => 'decimal:3', 
            'cost_usd' => 'decimal:5',
            'request_payload' => 'array',
            'response_payload' => 'array'
        ]; 
    }

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
}