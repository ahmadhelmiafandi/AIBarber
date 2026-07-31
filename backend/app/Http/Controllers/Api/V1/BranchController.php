<?php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\BranchRequest;
use App\Http\Resources\BranchResource;
use App\Http\Traits\ApiResponse;
use App\Models\Branch;
use App\Services\Master\BranchService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class BranchController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly BranchService $branchService) {}

    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Branch::class);
        $branches = $this->branchService->getAll($request->boolean('active_only'));
        
        return $this->successResponse('Data cabang berhasil diambil.', BranchResource::collection($branches));
    }

    public function store(BranchRequest $request): JsonResponse
    {
        Gate::authorize('create', Branch::class);
        $branch = $this->branchService->create($request->validated());
        
        return $this->successResponse('Cabang berhasil ditambahkan.', new BranchResource($branch), status: 201);
    }

    public function show(Branch $branch): JsonResponse
    {
        Gate::authorize('view', $branch);
        return $this->successResponse('Data cabang.', new BranchResource($branch));
    }

    public function update(BranchRequest $request, Branch $branch): JsonResponse
    {
        Gate::authorize('update', $branch);
        $updated = $this->branchService->update($branch, $request->validated());
        
        return $this->successResponse('Cabang berhasil diupdate.', new BranchResource($updated));
    }

    public function destroy(Branch $branch): JsonResponse
    {
        Gate::authorize('delete', $branch);
        $this->branchService->delete($branch);
        
        return $this->successResponse('Cabang berhasil dihapus.');
    }
}
