<?php
namespace App\Services\Master;

use App\Models\Branch;

class BranchService
{
    public function getAll(bool $activeOnly = false, $request = null)
    {
        $query = Branch::query();

        if ($activeOnly) {
            $query->where('is_active', true);
        }

        if ($request && $request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($request) {
            return \App\Helpers\QueryHelper::paginateOrAll($query, $request, 10);
        }

        return $query->get();
    }

    public function create(array $data): Branch
    {
        return Branch::create($data);
    }

    public function update(Branch $branch, array $data): Branch
    {
        $branch->update($data);
        return $branch;
    }

    public function delete(Branch $branch): bool
    {
        return $branch->delete();
    }
}
