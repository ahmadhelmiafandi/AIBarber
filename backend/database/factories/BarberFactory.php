<?php

namespace Database\Factories;

use App\Models\Barber;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Barber>
 */
class BarberFactory extends Factory
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
            'user_id' => \App\Models\User::factory()->state(['role' => 'barber']),
            'branch_id' => \App\Models\Branch::factory(),
            'specialization' => fake()->words(2, true),
            'rating_avg' => fake()->randomFloat(2, 3.5, 5.0),
            'total_reviews' => fake()->numberBetween(0, 500),
            'is_active' => true,
        ];
    }
}
