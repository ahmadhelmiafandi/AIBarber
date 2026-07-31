<?php
namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class SystemSettingFactory extends Factory
{
    public function definition(): array
    {
        return [
            'key' => $this->faker->unique()->word(),
            'value' => $this->faker->word(),
            'type' => 'string'
        ];
    }
}