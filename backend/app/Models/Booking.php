<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * @property string $id
 * @property string $booking_code
 * @property string $customer_id
 * @property string $barber_id
 * @property string $branch_id
 * @property string $service_id
 * @property \Illuminate\Support\Carbon|string $booking_date
 * @property \Illuminate\Support\Carbon|string $booking_time
 * @property float $total_price
 * @property string $status
 * @property string|null $cancellation_reason
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property Service|null $service
 * @property Queue|null $queue
 */
class Booking extends Model {
    use HasUuids, HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;
    protected $fillable = ['booking_code', 'customer_id', 'barber_id', 'branch_id', 'service_id', 'booking_date', 'booking_time', 'total_price', 'status', 'cancellation_reason'];

    protected function casts(): array {
        return ['booking_date' => 'date', 'booking_time' => 'datetime:H:i', 'total_price' => 'decimal:2'];
    }

    public function customer(): BelongsTo { return $this->belongsTo(User::class, 'customer_id'); }
    public function barber(): BelongsTo { return $this->belongsTo(Barber::class); }
    public function branch(): BelongsTo { return $this->belongsTo(Branch::class); }
    public function service(): BelongsTo { return $this->belongsTo(Service::class); }
    public function queue(): HasOne { return $this->hasOne(Queue::class); }
    public function review(): HasOne { return $this->hasOne(Review::class); }
}