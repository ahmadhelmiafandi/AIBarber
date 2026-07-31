<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Service;
use Illuminate\Support\Str;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        $services = [
            [
                'id' => Str::uuid(),
                'name' => 'Haircut',
                'price' => 75000,
                'estimated_duration_minutes' => 30,
                'description' => 'Standard professional haircut',
                'is_active' => true,
            ],
            [
                'id' => Str::uuid(),
                'name' => 'Wash',
                'price' => 25000,
                'estimated_duration_minutes' => 15,
                'description' => 'Hair wash and dry',
                'is_active' => true,
            ],
            [
                'id' => Str::uuid(),
                'name' => 'Coloring',
                'price' => 250000,
                'estimated_duration_minutes' => 120,
                'description' => 'Full hair coloring service',
                'is_active' => true,
            ],
            [
                'id' => Str::uuid(),
                'name' => 'Spa',
                'price' => 150000,
                'estimated_duration_minutes' => 45,
                'description' => 'Relaxing hair spa and scalp massage',
                'is_active' => true,
            ],
        ];

        foreach ($services as $service) {
            Service::updateOrCreate(
                ['name' => $service['name']],
                $service
            );
        }
    }
}
