<?php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\AiRuleRequest;
use App\Http\Resources\AiRuleResource;
use App\Http\Traits\ApiResponse;
use App\Models\AiRule;
use App\Services\Master\AiRuleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

class AiRuleController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly AiRuleService $aiRuleService) {}

    public function index(): JsonResponse
    {
        Gate::authorize('viewAny', AiRule::class);
        $rules = $this->aiRuleService->getAll();
        return $this->successResponse('Data AI Rule berhasil diambil.', AiRuleResource::collection($rules));
    }

    public function store(AiRuleRequest $request): JsonResponse
    {
        Gate::authorize('create', AiRule::class);
        $rule = $this->aiRuleService->create($request->validated());
        return $this->successResponse('AI Rule berhasil ditambahkan.', new AiRuleResource($rule->load('hairstyle')), status: 201);
    }

    public function show(AiRule $aiRule): JsonResponse
    {
        Gate::authorize('view', $aiRule);
        return $this->successResponse('Data AI Rule.', new AiRuleResource($aiRule->load('hairstyle')));
    }

    public function update(AiRuleRequest $request, AiRule $aiRule): JsonResponse
    {
        Gate::authorize('update', $aiRule);
        $updated = $this->aiRuleService->update($aiRule, $request->validated());
        return $this->successResponse('AI Rule berhasil diupdate.', new AiRuleResource($updated->load('hairstyle')));
    }

    public function destroy(AiRule $aiRule): JsonResponse
    {
        Gate::authorize('delete', $aiRule);
        $this->aiRuleService->delete($aiRule);
        return $this->successResponse('AI Rule berhasil dihapus.');
    }
}
