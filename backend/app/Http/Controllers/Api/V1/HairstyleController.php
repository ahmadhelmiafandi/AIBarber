<?php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\HairstyleRequest;
use App\Http\Resources\HairstyleResource;
use App\Http\Traits\ApiResponse;
use App\Models\Hairstyle;
use App\Services\Master\HairstyleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

class HairstyleController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly HairstyleService $hairstyleService) {}

    public function index(\Illuminate\Http\Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Hairstyle::class);
        $hairstyles = $this->hairstyleService->getAll($request);
        return $this->successResponse('Data gaya rambut berhasil diambil.', HairstyleResource::collection($hairstyles));
    }

    public function store(HairstyleRequest $request): JsonResponse
    {
        Gate::authorize('create', Hairstyle::class);
        $hairstyle = $this->hairstyleService->create($request->validated());
        return $this->successResponse('Gaya rambut berhasil ditambahkan.', new HairstyleResource($hairstyle), status: 201);
    }

    public function show(Hairstyle $hairstyle): JsonResponse
    {
        Gate::authorize('view', $hairstyle);
        return $this->successResponse('Data gaya rambut.', new HairstyleResource($hairstyle));
    }

    public function update(HairstyleRequest $request, Hairstyle $hairstyle): JsonResponse
    {
        Gate::authorize('update', $hairstyle);
        $updated = $this->hairstyleService->update($hairstyle, $request->validated());
        return $this->successResponse('Gaya rambut berhasil diupdate.', new HairstyleResource($updated));
    }

    public function destroy(Hairstyle $hairstyle): JsonResponse
    {
        Gate::authorize('delete', $hairstyle);
        $this->hairstyleService->delete($hairstyle);
        return $this->successResponse('Gaya rambut berhasil dihapus.');
    }
}
