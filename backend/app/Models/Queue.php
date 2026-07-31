<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Queue extends Model
{
    use HasUuids, HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;
    protected $fillable = ['booking_id', 'branch_id', 'booking_date', 'queue_number', 'queue_code', 'status', 'estimated_start_time', 'estimated_finish_time', 'actual_start_time', 'actual_finish_time', 'version'];

    protected function casts(): array
    {
        return [
            'booking_date' => 'date',
            'queue_number' => 'integer',
            'version' => 'integer',
            'estimated_start_time' => 'datetime',
            'estimated_finish_time' => 'datetime',
            'actual_start_time' => 'datetime',
            'actual_finish_time' => 'datetime'
        ];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }
    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }
    public function events(): HasMany
    {
        return $this->hasMany(QueueEvent::class);
    }
}