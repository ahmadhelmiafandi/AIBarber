<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Hairstyle;
use Illuminate\Support\Str;

class HairstyleSeeder extends Seeder
{
    public function run(): void
    {
        $hairstyles = [
            [
                'id' => Str::uuid(),
                'name' => 'French Crop',
                'category' => 'Short',
                'suitable_face_shapes' => json_encode(['Oval', 'Diamond', 'Square']),
                'unsuitable_face_shapes' => json_encode(['Round']),
                'maintenance_level' => 'Low',
                'difficulty' => 'Medium',
                'description' => 'A classic men\'s haircut featuring short hair all around the head and a noticeable fringe.',
            ],
            [
                'id' => Str::uuid(),
                'name' => 'Buzz Cut',
                'category' => 'Short',
                'suitable_face_shapes' => json_encode(['Square', 'Oval', 'Round']),
                'unsuitable_face_shapes' => json_encode(['Heart']),
                'maintenance_level' => 'Low',
                'difficulty' => 'Easy',
                'description' => 'Very short hairstyle where the hair is clipped close to the head.',
            ],
            [
                'id' => Str::uuid(),
                'name' => 'Pompadour',
                'category' => 'Medium',
                'suitable_face_shapes' => json_encode(['Round', 'Oval']),
                'unsuitable_face_shapes' => json_encode(['Long']),
                'maintenance_level' => 'High',
                'difficulty' => 'Hard',
                'description' => 'Hair swept upwards from the face and worn high over the forehead.',
            ],
            [
                'id' => Str::uuid(),
                'name' => 'Undercut',
                'category' => 'Fade',
                'suitable_face_shapes' => json_encode(['Diamond', 'Square', 'Round']),
                'unsuitable_face_shapes' => json_encode(['Heart']),
                'maintenance_level' => 'Medium',
                'difficulty' => 'Medium',
                'description' => 'Short sides and back with longer hair on top.',
            ]
        ];

        foreach ($hairstyles as $style) {
            Hairstyle::updateOrCreate(
                ['name' => $style['name']],
                $style
            );
        }
    }
}
