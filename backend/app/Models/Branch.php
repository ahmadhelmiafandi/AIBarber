<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Branch extends Model {
    use HasUuids, SoftDeletes, HasFactory;
    
    protected $keyType = 'string';
    public $incrementing = false;
    protected $fillable = ['name', 'address', 'phone', 'google_maps_url', 'opening_hours', 'is_active'];

    protected function casts(): array {
        return ['opening_hours' => 'array', 'is_active' => 'boolean'];
    }

    public function barbers(): HasMany { return $this->hasMany(Barber::class); }
    public function bookings(): HasMany { return $this->hasMany(Booking::class); }
    public function queues(): HasMany { return $this->hasMany(Queue::class); }
}