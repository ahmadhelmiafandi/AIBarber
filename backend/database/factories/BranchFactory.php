<?php

namespace Database\Factories;

use App\Models\Branch;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Branch>
 */
class BranchFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id' => fake()->uuid(),
            'name' => fake()->city() . ' Branch',
            'address' => fake()->address(),
            'phone' => fake()->phoneNumber(),
            'google_maps_url' => fake()->url(),
            'opening_hours' => json_encode([
                'Monday' => '09:00-21:00',
                'Tuesday' => '09:00-21:00',
                'Wednesday' => '09:00-21:00',
                'Thursday' => '09:00-21:00',
                'Friday' => '09:00-21:00',
                'Saturday' => '10:00-22:00',
                'Sunday' => '10:00-20:00',
            ]),
            'is_active' => true,
        ];
    }
}
