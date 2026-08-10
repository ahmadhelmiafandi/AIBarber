<?php
namespace App\Services\Master;

use App\Models\Barber;

class BarberService
{
    public function getAll($request = null)
    {
        $query = Barber::with(['user', 'branch']);

        if ($request && $request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', function ($uq) use ($search) {
                    $uq->where('name', 'like', "%{$search}%")
                       ->orWhere('email', 'like', "%{$search}%")
                       ->orWhere('phone', 'like', "%{$search}%");
                })->orWhere('specialization', 'like', "%{$search}%");
            });
        }

        if ($request && $request->filled('branch_id')) {
            $query->where('branch_id', $request->input('branch_id'));
        }

        if ($request) {
            return \App\Helpers\QueryHelper::paginateOrAll($query, $request, 10);
        }

        return $query->get();
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
