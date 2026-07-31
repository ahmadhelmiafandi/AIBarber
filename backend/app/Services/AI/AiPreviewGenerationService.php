<?php

namespace App\Services\AI;

use App\Models\AiPreview;
use App\Models\AiRecommendation;
use App\Models\Hairstyle;
use App\Models\User;
use App\Services\AI\Contracts\IdentityVerifierInterface;
use App\Services\AI\Contracts\ImageGeneratorInterface;
use Illuminate\Support\Carbon;

class AiPreviewGenerationService
{
    public function __construct(
        private readonly ImageGeneratorInterface $imageGenerator,
        private readonly IdentityVerifierInterface $verifier,
        private readonly IdentityVerificationService $identityService,
        private readonly AiAuditAndCostService $auditService
    ) {}

    public function generatePreview(AiPreview $preview): void
    {
        $startTime = microtime(true);
        $preview->update(['status' => 'processing']);

        try {
            $recommendation = $preview->recommendation;
            $hairstyle = $preview->hairstyle;

            // 1. Generate Hairstyle Preview Image
            $genResult = $this->imageGenerator->generateHairstylePreview(
                $preview->original_image_url,
                $hairstyle
            );

            // 2. Perform Identity Preservation Verification
            $verification = $this->identityService->verify(
                $preview->original_image_url,
                $genResult->generatedImageUrl
            );

            $preview->update([
                'generated_image_url' => $genResult->generatedImageUrl,
                'similarity_score' => $verification->similarityScore,
                'threshold_used' => $verification->thresholdUsed,
                'identity_verified' => $verification->identityVerified,
                'metric' => $verification->metric,
                'verifier_version' => $verification->verifierVersion,
                'cost_usd' => $genResult->costUsd,
                'status' => 'completed',
            ]);

            $durationMs = (int) round((microtime(true) - $startTime) * 1000);
            $this->auditService->reconcileBudget(0.05000, $genResult->costUsd);
            $this->auditService->logOperation([
                'user_id' => $preview->user_id,
                'operation_type' => 'preview',
                'model_used' => $genResult->providerName,
                'engine_version' => 'v1.0',
                'duration_ms' => $durationMs,
                'similarity_score' => $verification->similarityScore,
                'cost_usd' => $genResult->costUsd,
                'status' => 'success',
                'request_payload' => ['preview_id' => $preview->id, 'hairstyle_id' => $hairstyle->id],
                'response_payload' => ['identity_verified' => $verification->identityVerified],
            ]);
        } catch (\Throwable $e) {
            $preview->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);

            $durationMs = (int) round((microtime(true) - $startTime) * 1000);
            $this->auditService->logOperation([
                'user_id' => $preview->user_id,
                'operation_type' => 'preview',
                'model_used' => 'image_generator',
                'engine_version' => 'v1.0',
                'duration_ms' => $durationMs,
                'similarity_score' => null,
                'cost_usd' => 0.0,
                'status' => 'failed',
                'request_payload' => ['preview_id' => $preview->id],
                'response_payload' => ['error' => $e->getMessage()],
            ]);
        }
    }
}
