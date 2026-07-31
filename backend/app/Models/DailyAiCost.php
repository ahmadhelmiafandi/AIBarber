<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property mixed $date
 * @property string $provider
 * @property float|string|null $total_cost_usd
 * @property float|string|null $reserved_cost_usd
 * @property int $total_requests
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 */
class DailyAiCost extends Model
{
    use HasFactory;

    protected $fillable = [
        'date',
        'provider',
        'total_cost_usd',
        'reserved_cost_usd',
        'total_requests',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'total_cost_usd' => 'decimal:5',
            'reserved_cost_usd' => 'decimal:5',
            'total_requests' => 'integer',
        ];
    }
}