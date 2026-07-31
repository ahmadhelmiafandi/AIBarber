<?php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\BarberRequest;
use App\Http\Resources\BarberResource;
use App\Http\Traits\ApiResponse;
use App\Models\Barber;
use App\Services\Master\BarberService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

class BarberController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly BarberService $barberService) {}

    public function index(): JsonResponse
    {
        Gate::authorize('viewAny', Barber::class);
        $barbers = $this->barberService->getAll();
        return $this->successResponse('Data barber berhasil diambil.', BarberResource::collection($barbers));
    }

    public function store(BarberRequest $request): JsonResponse
    {
        Gate::authorize('create', Barber::class);
        $barber = $this->barberService->create($request->validated());
        return $this->successResponse('Barber berhasil ditambahkan.', new BarberResource($barber->load(['user', 'branch'])), status: 201);
    }

    public function show(Barber $barber): JsonResponse
    {
        Gate::authorize('view', $barber);
        return $this->successResponse('Data barber.', new BarberResource($barber->load(['user', 'branch'])));
    }

    public function update(BarberRequest $request, Barber $barber): JsonResponse
    {
        Gate::authorize('update', $barber);
        $updated = $this->barberService->update($barber, $request->validated());
        return $this->successResponse('Barber berhasil diupdate.', new BarberResource($updated->load(['user', 'branch'])));
    }

    public function destroy(Barber $barber): JsonResponse
    {
        Gate::authorize('delete', $barber);
        $this->barberService->delete($barber);
        return $this->successResponse('Barber berhasil dihapus.');
    }
}
