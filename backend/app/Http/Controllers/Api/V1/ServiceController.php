<?php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\ServiceRequest;
use App\Http\Resources\ServiceResource;
use App\Http\Traits\ApiResponse;
use App\Models\Service as HairService;
use App\Services\Master\ServiceManagementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ServiceController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly ServiceManagementService $serviceManager) {}

    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', HairService::class);
        $services = $this->serviceManager->getAll($request->boolean('active_only'), $request);
        
        return $this->successResponse('Data layanan berhasil diambil.', ServiceResource::collection($services));
    }

    public function store(ServiceRequest $request): JsonResponse
    {
        Gate::authorize('create', HairService::class);
        $service = $this->serviceManager->create($request->validated());
        
        return $this->successResponse('Layanan berhasil ditambahkan.', new ServiceResource($service), status: 201);
    }

    public function show(HairService $service): JsonResponse
    {
        Gate::authorize('view', $service);
        return $this->successResponse('Data layanan.', new ServiceResource($service));
    }

    public function update(ServiceRequest $request, HairService $service): JsonResponse
    {
        Gate::authorize('update', $service);
        $updated = $this->serviceManager->update($service, $request->validated());
        
        return $this->successResponse('Layanan berhasil diupdate.', new ServiceResource($updated));
    }

    public function destroy(HairService $service): JsonResponse
    {
        Gate::authorize('delete', $service);
        $this->serviceManager->delete($service);
        
        return $this->successResponse('Layanan berhasil dihapus.');
    }
}
