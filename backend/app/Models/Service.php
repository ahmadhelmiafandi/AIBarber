<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Service extends Model {
    use HasUuids, SoftDeletes, HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;
    protected $fillable = ['name', 'price', 'estimated_duration_minutes', 'description', 'is_active'];

    protected function casts(): array {
        return ['price' => 'decimal:2', 'estimated_duration_minutes' => 'integer', 'is_active' => 'boolean'];
    }

    public function bookings(): HasMany { return $this->hasMany(Booking::class); }
}