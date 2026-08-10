<?php
namespace App\Services\Master;

use App\Models\Service;

class ServiceManagementService
{
    public function getAll(bool $activeOnly = false, $request = null)
    {
        $query = Service::query();

        if ($activeOnly) {
            $query->where('is_active', true);
        }

        if ($request && $request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request) {
            return \App\Helpers\QueryHelper::paginateOrAll($query, $request, 10);
        }

        return $query->get();
    }

    public function create(array $data): Service
    {
        return Service::create($data);
    }

    public function update(Service $service, array $data): Service
    {
        $service->update($data);
        return $service;
    }

    public function delete(Service $service): bool
    {
        return $service->delete();
    }
}
