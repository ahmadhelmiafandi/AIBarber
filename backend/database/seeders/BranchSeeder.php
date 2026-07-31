<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Branch;
use Illuminate\Support\Str;

class BranchSeeder extends Seeder
{
    public function run(): void
    {
        $defaultOpeningHours = [
            'monday' => ['is_open' => true, 'open' => '09:00', 'close' => '21:00'],
            'tuesday' => ['is_open' => true, 'open' => '09:00', 'close' => '21:00'],
            'wednesday' => ['is_open' => true, 'open' => '09:00', 'close' => '21:00'],
            'thursday' => ['is_open' => true, 'open' => '09:00', 'close' => '21:00'],
            'friday' => ['is_open' => true, 'open' => '09:00', 'close' => '21:00'],
            'saturday' => ['is_open' => true, 'open' => '09:00', 'close' => '21:00'],
            'sunday' => ['is_open' => true, 'open' => '09:00', 'close' => '21:00'],
        ];

        $branches = [
            [
                'id' => Str::uuid(),
                'name' => 'Jakarta Central',
                'address' => 'Jl. Jend. Sudirman Kav. 1, Jakarta',
                'phone' => '021-555-0100',
                'opening_hours' => $defaultOpeningHours,
                'is_active' => true,
            ],
            [
                'id' => Str::uuid(),
                'name' => 'Bandung Heritage',
                'address' => 'Jl. Braga No. 10, Bandung',
                'phone' => '022-555-0200',
                'opening_hours' => $defaultOpeningHours,
                'is_active' => true,
            ],
            [
                'id' => Str::uuid(),
                'name' => 'Surabaya Elite',
                'address' => 'Jl. Tunjungan No. 50, Surabaya',
                'phone' => '031-555-0300',
                'opening_hours' => $defaultOpeningHours,
                'is_active' => true,
            ]
        ];

        foreach ($branches as $branch) {
            Branch::updateOrCreate(
                ['name' => $branch['name']],
                $branch
            );
        }
    }
}
