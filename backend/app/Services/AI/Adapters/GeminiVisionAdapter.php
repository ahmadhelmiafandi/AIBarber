<?php

namespace App\Services\AI\Adapters;

use App\Models\CustomerFaceProfile;
use App\Models\Hairstyle;
use App\Services\AI\Contracts\ChatResponse;
use App\Services\AI\Contracts\LLMProviderInterface;
use App\Services\AI\Contracts\VisionAnalysisResult;
use App\Services\AI\Contracts\VisionProviderInterface;

class GeminiVisionAdapter implements VisionProviderInterface, LLMProviderInterface
{
    public function analyzeFaceAndHair(string $imagePath): VisionAnalysisResult
    {
        return new VisionAnalysisResult(
            faceShape: 'oval',
            hairline: 'straight',
            hairTexture: 'wavy',
            hairDensity: 'thick',
            confidence: 0.92,
            rawMetadata: ['provider' => 'gemini-1.5-flash']
        );
    }

    public function generateRecommendationReason(CustomerFaceProfile $profile, Hairstyle $hairstyle): string
    {
        return "Rekomendasi model {$hairstyle->name} memberikan efek estetika maksimal untuk bentuk wajah {$profile->face_shape}.";
    }

    public function chat(array $messages, array $context = []): ChatResponse
    {
        return new ChatResponse(
            replyText: "Tentu! Pilihan gaya rambut ini disesuaikan khusus dengan karakter wajah {$context['face_shape']}.",
            promptTokens: 110,
            completionTokens: 40,
            costUsd: 0.00010,
            modelName: 'gemini-1.5-flash'
        );
    }

    public function getProviderName(): string
    {
        return 'gemini';
    }
}
