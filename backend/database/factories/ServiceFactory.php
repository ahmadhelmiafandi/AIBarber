<?php

namespace Database\Factories;

use App\Models\Service;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Service>
 */
class ServiceFactory extends Factory
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
            'name' => fake()->words(2, true),
            'price' => fake()->randomFloat(2, 50000, 300000),
            'estimated_duration_minutes' => fake()->randomElement([15, 30, 45, 60, 90, 120]),
            'description' => fake()->sentence(),
            'is_active' => true,
        ];
    }
}
