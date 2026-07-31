<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class QueueEvent extends Model {
    use HasUuids, HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;
    const UPDATED_AT = null;
    protected $fillable = ['queue_id', 'status', 'notes'];

    public function queue(): BelongsTo { return $this->belongsTo(Queue::class); }
}