<?php

namespace Database\Factories;

use App\Models\Hairstyle;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Hairstyle>
 */
class HairstyleFactory extends Factory
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
            'category' => fake()->randomElement(['Short', 'Medium', 'Long', 'Fade']),
            'suitable_face_shapes' => json_encode(fake()->randomElements(['Oval', 'Square', 'Round', 'Heart', 'Diamond'], fake()->numberBetween(1, 3))),
            'unsuitable_face_shapes' => json_encode(fake()->randomElements(['Oval', 'Square', 'Round', 'Heart', 'Diamond'], fake()->numberBetween(0, 2))),
            'maintenance_level' => fake()->randomElement(['Low', 'Medium', 'High']),
            'difficulty' => fake()->randomElement(['Easy', 'Medium', 'Hard']),
            'description' => fake()->sentence(),
        ];
    }
}
