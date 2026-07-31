<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CustomerFaceProfile extends Model {
    use HasUuids, HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;
    protected $fillable = ['user_id', 'favorite_hairstyle_id', 'face_shape', 'hairline', 'hair_density', 'hair_texture', 'preference_notes'];

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function favoriteHairstyle(): BelongsTo { return $this->belongsTo(Hairstyle::class, 'favorite_hairstyle_id'); }
}