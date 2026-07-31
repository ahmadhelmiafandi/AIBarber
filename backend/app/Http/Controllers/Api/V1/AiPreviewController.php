<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Jobs\GenerateAiPreviewJob;
use App\Models\AiPreview;
use App\Models\AiRecommendation;
use App\Models\Hairstyle;
use App\Services\AI\AiAuditAndCostService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AiPreviewController extends Controller
{
    use ApiResponse;

    public function store(Request $request, AiAuditAndCostService $costService): JsonResponse
    {
        $request->validate([
            'recommendation_id' => ['required', 'uuid', 'exists:ai_recommendations,id'],
            'hairstyle_id' => ['nullable', 'uuid', 'exists:hairstyles,id'],
        ]);

        $user = $request->user();
        $recommendationId = $request->input('recommendation_id');
        $recommendation = AiRecommendation::with('items')->find($recommendationId);

        if (!$recommendation) {
            return response()->json([
                'success' => false,
                'message' => 'Rekomendasi AI tidak ditemukan.',
            ], 404);
        }

        // Ownership Check
        if ($recommendation->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke rekomendasi ini.',
            ], 403);
        }

        // Completed Status Check
        if ($recommendation->status !== 'completed') {
            return response()->json([
                'success' => false,
                'message' => 'Rekomendasi AI belum selesai diproses.',
            ], 422);
        }

        // Selected Hairstyle Determination & Correlation Check
        $requestedHairstyleId = $request->input('hairstyle_id');
        $validItemIds = $recommendation->items->pluck('hairstyle_id')->toArray();

        if ($requestedHairstyleId) {
            if (!in_array($requestedHairstyleId, $validItemIds, true)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Gaya rambut yang dipilih harus merupakan bagian dari hasil rekomendasi.',
                ], 422);
            }
            $targetHairstyleId = $requestedHairstyleId;
        } else {
            $topItem = $recommendation->items->firstWhere('rank', 1) ?: $recommendation->items->first();
            if (!$topItem) {
                return response()->json([
                    'success' => false,
                    'message' => 'Rekomendasi tidak memiliki item gaya rambut yang valid.',
                ], 422);
            }
            $targetHairstyleId = $topItem->hairstyle_id;
        }

        // Hairstyle Active Check
        $hairstyle = Hairstyle::find($targetHairstyleId);
        if (!$hairstyle || !$hairstyle->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Gaya rambut tidak aktif atau tidak ditemukan.',
            ], 422);
        }

        // Preview Idempotency & Caching Check
        $idempotencyKey = hash('sha256', $user->id . '_' . $recommendation->id . '_' . $targetHairstyleId . '_v1.0');

        $cachedPreview = AiPreview::where('user_id', $user->id)
            ->where('idempotency_key', $idempotencyKey)
            ->where('status', 'completed')
            ->first();

        if ($cachedPreview) {
            return $this->successResponse('Hasil preview AI diambil dari cache.', [
                'preview_id' => $cachedPreview->id,
                'status' => 'completed',
                'generated_image_url' => $cachedPreview->generated_image_url,
                'similarity_score' => $cachedPreview->similarity_score,
                'threshold_used' => $cachedPreview->threshold_used,
                'identity_verified' => $cachedPreview->identity_verified,
            ]);
        }

        // Reserve budget ($0.05 estimated)
        $costService->reserveBudget(0.05000);

        $preview = null;
        $originalImageUrl = storage_path('app/public/' . ($recommendation->image_url ?? 'ai_uploads/default.jpg'));

        DB::transaction(function () use ($user, $recommendation, $targetHairstyleId, $idempotencyKey, $originalImageUrl, &$preview) {
            $preview = AiPreview::create([
                'id' => Str::uuid(),
                'user_id' => $user->id,
                'recommendation_id' => $recommendation->id,
                'hairstyle_id' => $targetHairstyleId,
                'original_image_url' => $originalImageUrl,
                'idempotency_key' => $idempotencyKey,
                'status' => 'pending',
            ]);

            DB::afterCommit(function () use ($preview) {
                GenerateAiPreviewJob::dispatch($preview->id);
            });
        });

        return response()->json([
            'success' => true,
            'message' => 'Generasi preview AI berhasil dijadwalkan.',
            'data' => [
                'preview_id' => $preview->id,
                'status' => 'pending',
            ],
        ], 202);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $preview = AiPreview::with('hairstyle')->find($id);

        if (!$preview) {
            return response()->json([
                'success' => false,
                'message' => 'Preview AI tidak ditemukan.',
            ], 404);
        }

        if ($preview->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke preview ini.',
            ], 403);
        }

        return $this->successResponse('Status preview AI.', [
            'preview_id' => $preview->id,
            'status' => $preview->status,
            'error_message' => $preview->error_message,
            'generated_image_url' => $preview->generated_image_url,
            'similarity_score' => $preview->similarity_score,
            'threshold_used' => $preview->threshold_used,
            'identity_verified' => $preview->identity_verified,
            'metric' => $preview->metric,
            'verifier_version' => $preview->verifierVersion,
            'hairstyle' => $preview->hairstyle,
        ]);
    }
}
