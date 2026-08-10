<?php
namespace App\Services\Master;

use App\Models\Hairstyle;

class HairstyleService
{
    public function getAll($request = null)
    {
        $query = Hairstyle::query();

        if ($request && $request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
            });
        }

        if ($request && $request->filled('face_shape')) {
            $query->where('suitable_face_shape', 'like', "%" . $request->input('face_shape') . "%");
        }

        if ($request) {
            return \App\Helpers\QueryHelper::paginateOrAll($query, $request, 10);
        }

        return $query->get();
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
