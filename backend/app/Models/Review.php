<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Review extends Model {
    use HasUuids, HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;
    protected $fillable = ['booking_id', 'user_id', 'barber_id', 'rating', 'content', 'is_published'];

    protected function casts(): array { return ['rating' => 'integer', 'is_published' => 'boolean']; }

    public function booking(): BelongsTo { return $this->belongsTo(Booking::class); }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function barber(): BelongsTo { return $this->belongsTo(Barber::class); }
}