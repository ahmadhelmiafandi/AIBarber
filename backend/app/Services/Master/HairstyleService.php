<?php
namespace App\Services\Master;

use App\Models\Hairstyle;

class HairstyleService
{
    public function getAll()
    {
        return Hairstyle::all();
    }

    public function create(array $data): Hairstyle
    {
        return Hairstyle::create($data);
    }

    public function update(Hairstyle $hairstyle, array $data): Hairstyle
    {
        $hairstyle->update($data);
        return $hairstyle;
    }

    public function delete(Hairstyle $hairstyle): bool
    {
        return $hairstyle->delete();
    }
}
