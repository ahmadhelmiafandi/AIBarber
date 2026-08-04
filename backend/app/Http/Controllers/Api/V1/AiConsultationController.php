<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Jobs\ProcessAiConsultationJob;
use App\Models\AiRecommendation;
use App\Services\AI\AiAuditAndCostService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AiConsultationController extends Controller
{
    use ApiResponse;

    public function store(Request $request, AiAuditAndCostService $costService): JsonResponse
    {
        $request->validate([
            'image' => ['required', 'file', 'image', 'mimes:jpeg,png,webp', 'max:10240'],
        ]);

        $user = $request->user();
        $idempotencyKey = $request->header('Idempotency-Key')
            ?: hash('sha256', $user->id . '_' . $request->file('image')->getClientOriginalName() . '_' . $request->file('image')->getSize());

        // Check for existing pending/processing idempotency request
        $existing = AiRecommendation::where('user_id', $user->id)
            ->where('idempotency_key', $idempotencyKey)
            ->whereIn('status', ['pending', 'processing', 'completed'])
            ->first();

        if ($existing) {
            return response()->json([
                'success' => true,
                'message' => 'Analisis AI sedang diproses atau sudah selesai.',
                'data' => [
                    'consultation_id' => $existing->id,
                    'status' => $existing->status,
                ],
            ], 202);
        }

        try {
            // Budget check before dispatching
            $costService->reserveBudget(0.02000);

            // Ensure destination directory exists
            \Illuminate\Support\Facades\Storage::disk('public')->makeDirectory('ai_uploads');

            $path = $request->file('image')->store('ai_uploads', 'public');
            $fullPath = \Illuminate\Support\Facades\Storage::disk('public')->path($path);

            $recommendation = null;

            DB::transaction(function () use ($user, $idempotencyKey, $path, $fullPath, &$recommendation) {
                $recommendation = AiRecommendation::create([
                    'id' => Str::uuid(),
                    'user_id' => $user->id,
                    'status' => 'pending',
                    'idempotency_key' => $idempotencyKey,
                    'engine_version' => 'v1.0',
                    'rule_version' => 'cms-v1',
                    'image_url' => $path,
                ]);

                DB::afterCommit(function () use ($recommendation, $fullPath) {
                    ProcessAiConsultationJob::dispatch($recommendation->id, $fullPath);
                });
            });

            return response()->json([
                'success' => true,
                'message' => 'Analisis AI berhasil dijadwalkan.',
                'data' => [
                    'consultation_id' => $recommendation->id,
                    'status' => 'pending',
                ],
            ], 202);
        } catch (\Illuminate\Validation\ValidationException $ve) {
            throw $ve;
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('AiConsultationController store error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal memproses foto untuk analisis AI. ' . $e->getMessage(),
            ], 500);
        }
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $recommendation = AiRecommendation::with(['faceProfile', 'items.hairstyle'])->find($id);

        if (!$recommendation) {
            return response()->json([
                'success' => false,
                'message' => 'Konsultasi AI tidak ditemukan.',
            ], 404);
        }

        if ($recommendation->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke konsultasi ini.',
            ], 403);
        }

        return $this->successResponse('Status konsultasi AI.', [
            'consultation_id' => $recommendation->id,
            'status' => $recommendation->status,
            'error_message' => $recommendation->error_message,
            'face_profile' => $recommendation->faceProfile,
            'recommendations' => $recommendation->items->map(function ($item) {
                return [
                    'rank' => $item->rank,
                    'score' => $item->score,
                    'reason' => $item->reason,
                    'hairstyle' => $item->hairstyle,
                ];
            }),
        ]);
    }
}
