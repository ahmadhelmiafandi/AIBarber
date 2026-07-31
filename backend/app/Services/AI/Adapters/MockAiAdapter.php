<?php

namespace App\Services\AI\Adapters;

use App\Models\CustomerFaceProfile;
use App\Models\Hairstyle;
use App\Services\AI\Contracts\ChatResponse;
use App\Services\AI\Contracts\IdentityVerificationResult;
use App\Services\AI\Contracts\IdentityVerifierInterface;
use App\Services\AI\Contracts\ImageGenerationResult;
use App\Services\AI\Contracts\ImageGeneratorInterface;
use App\Services\AI\Contracts\LLMProviderInterface;
use App\Services\AI\Contracts\VisionAnalysisResult;
use App\Services\AI\Contracts\VisionProviderInterface;
use Illuminate\Support\Facades\App;

class MockAiAdapter implements
    VisionProviderInterface,
    LLMProviderInterface,
    ImageGeneratorInterface,
    IdentityVerifierInterface
{
    public function __construct()
    {
        if (App::environment('production')) {
            throw new \RuntimeException('MockAiAdapter is strictly forbidden in production environment.');
        }
    }

    public function analyzeFaceAndHair(string $imagePath): VisionAnalysisResult
    {
        return new VisionAnalysisResult(
            faceShape: 'oval',
            hairline: 'straight',
            hairTexture: 'wavy',
            hairDensity: 'thick',
            confidence: 0.98,
            rawMetadata: ['provider' => 'mock_ai_v1']
        );
    }

    public function generateRecommendationReason(CustomerFaceProfile $profile, Hairstyle $hairstyle): string
    {
        return "Model {$hairstyle->name} sangat serasi dengan bentuk wajah {$profile->face_shape} dan tekstur rambut {$profile->hair_texture}.";
    }

    public function chat(array $messages, array $context = []): ChatResponse
    {
        $lastUserMsg = end($messages)['content'] ?? 'konsultasi';
        return new ChatResponse(
            replyText: "Tentu! Berdasarkan profil rambut Anda, model rekomendasi kami sangat cocok untuk gaya {$lastUserMsg}.",
            promptTokens: 120,
            completionTokens: 45,
            costUsd: 0.00015,
            modelName: 'mock-gpt-4o-mini'
        );
    }

    public function generateHairstylePreview(string $sourceImagePath, Hairstyle $hairstyle): ImageGenerationResult
    {
        return new ImageGenerationResult(
            generatedImageUrl: "http://localhost:8000/storage/mock_previews/{$hairstyle->id}.jpg",
            costUsd: 0.01000,
            providerName: 'mock_replicate',
            rawMetadata: ['seed' => 12345]
        );
    }

    public function verify(string $originalImagePath, string $generatedImagePath, float $threshold = 0.95): IdentityVerificationResult
    {
        $similarity = 0.965;
        return new IdentityVerificationResult(
            similarityScore: $similarity,
            identityVerified: $similarity >= $threshold,
            thresholdUsed: $threshold,
            metric: 'face_recognition_v1',
            verifierVersion: 'v1.0'
        );
    }

    public function getProviderName(): string
    {
        return 'mock_ai';
    }
}
