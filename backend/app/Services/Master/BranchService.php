<?php
namespace App\Services\Master;

use App\Models\Branch;

class BranchService
{
    public function getAll(bool $activeOnly = false)
    {
        return Branch::when($activeOnly, fn ($q) => $q->where('is_active', true))->get();
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
