<?php

namespace App\Jobs;

use App\Models\AiRecommendation;
use App\Models\AiRecommendationItem;
use App\Models\CustomerFaceProfile;
use App\Services\AI\AiAuditAndCostService;
use App\Services\AI\Contracts\LLMProviderInterface;
use App\Services\AI\Contracts\VisionProviderInterface;
use App\Services\AI\RecommendationScoringService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Str;

class ProcessAiConsultationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public string $recommendationId,
        public string $imagePath
    ) {}

    public function handle(
        VisionProviderInterface $visionProvider,
        LLMProviderInterface $llmProvider,
        RecommendationScoringService $scoringService,
        AiAuditAndCostService $auditService
    ): void {
        $startTime = microtime(true);
        $recommendation = AiRecommendation::find($this->recommendationId);

        if (!$recommendation) {
            return;
        }

        $recommendation->update(['status' => 'processing']);

        try {
            // Reserve Budget ($0.02 estimated for analysis)
            $estimatedCost = 0.02000;
            $auditService->reserveBudget($estimatedCost);

            $resolvedImagePath = file_exists($this->imagePath)
                ? $this->imagePath
                : \Illuminate\Support\Facades\Storage::disk('public')->path($this->imagePath);

            // 1. Analyze Face & Hair Vision
            $analysisResult = $visionProvider->analyzeFaceAndHair($resolvedImagePath);

            // 2. Create/Update Customer Face Profile
            $profile = CustomerFaceProfile::updateOrCreate(
                ['user_id' => $recommendation->user_id],
                [
                    'face_shape' => $analysisResult->faceShape,
                    'hairline' => $analysisResult->hairline,
                    'hair_texture' => $analysisResult->hairTexture,
                    'hair_density' => $analysisResult->hairDensity,
                ]
            );

            $recommendation->update(['face_profile_id' => $profile->id]);

            // 3. Score & Rank Active Hairstyles
            $scoredItems = $scoringService->scoreAndRank($profile);

            // Take Top 3 items
            $topItems = $scoredItems->take(3);

            foreach ($topItems as $index => $item) {
                $hairstyle = $item['hairstyle'];
                $reason = $llmProvider->generateRecommendationReason($profile, $hairstyle);

                AiRecommendationItem::create([
                    'id' => Str::uuid(),
                    'recommendation_id' => $recommendation->id,
                    'hairstyle_id' => $hairstyle->id,
                    'rank' => $index + 1,
                    'score' => $item['score'],
                    'reason' => $reason,
                ]);
            }

            $recommendation->update(['status' => 'completed']);

            $durationMs = (int) round((microtime(true) - $startTime) * 1000);
            $actualCost = 0.00500;

            $auditService->reconcileBudget($estimatedCost, $actualCost);
            $auditService->logOperation([
                'user_id' => $recommendation->user_id,
                'operation_type' => 'consultation',
                'model_used' => $visionProvider->getProviderName(),
                'engine_version' => $recommendation->engine_version,
                'duration_ms' => $durationMs,
                'cost_usd' => $actualCost,
                'status' => 'success',
                'request_payload' => ['recommendation_id' => $recommendation->id],
                'response_payload' => ['item_count' => $topItems->count()],
            ]);
        } catch (\Throwable $e) {
            $recommendation->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);

            $durationMs = (int) round((microtime(true) - $startTime) * 1000);
            $auditService->logOperation([
                'user_id' => $recommendation->user_id,
                'operation_type' => 'consultation',
                'model_used' => $visionProvider->getProviderName(),
                'engine_version' => $recommendation->engine_version,
                'duration_ms' => $durationMs,
                'cost_usd' => 0.0,
                'status' => 'failed',
                'request_payload' => ['recommendation_id' => $recommendation->id],
                'response_payload' => ['error' => $e->getMessage()],
            ]);
        }
    }
}
