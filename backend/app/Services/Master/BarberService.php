<?php
namespace App\Services\Master;

use App\Models\Barber;

class BarberService
{
    public function getAll()
    {
        return Barber::with(['user', 'branch'])->get();
    }

    public function create(array $data): Barber
    {
        return Barber::create($data);
    }

    public function update(Barber $barber, array $data): Barber
    {
        $barber->update($data);
        return $barber;
    }

    public function delete(Barber $barber): bool
    {
        return $barber->delete();
    }
}
