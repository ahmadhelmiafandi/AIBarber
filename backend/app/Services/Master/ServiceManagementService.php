<?php
namespace App\Services\Master;

use App\Models\Service;

class ServiceManagementService
{
    public function getAll(bool $activeOnly = false)
    {
        return Service::when($activeOnly, fn ($q) => $q->where('is_active', true))->get();
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
