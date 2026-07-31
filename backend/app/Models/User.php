<?php
namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable, HasUuids, SoftDeletes, HasRoles;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = ['name', 'email', 'phone', 'password', 'role', 'status', 'notification_preferences'];
    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'notification_preferences' => 'array',
        ];
    }

    public function wantsChannel(string $channel): bool
    {
        if (isset($this->notification_preferences) && is_array($this->notification_preferences)) {
            return (bool) ($this->notification_preferences[$channel] ?? true);
        }
        return true;
    }

    public function barberProfile(): HasOne { return $this->hasOne(Barber::class); }
    public function faceProfile(): HasOne { return $this->hasOne(CustomerFaceProfile::class); }
    public function bookings(): HasMany { return $this->hasMany(Booking::class, 'customer_id'); }
    public function reviews(): HasMany { return $this->hasMany(Review::class); }
    public function aiAuditLogs(): HasMany { return $this->hasMany(AiAuditLog::class); }
    public function recommendations(): HasMany { return $this->hasMany(AiRecommendation::class); }
    public function faceEmbeddings(): HasMany { return $this->hasMany(FaceEmbedding::class); }
}