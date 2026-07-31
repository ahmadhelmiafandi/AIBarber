<?php

namespace App\Services\AI\Contracts;

use App\Models\CustomerFaceProfile;
use App\Models\Hairstyle;

class ChatResponse
{
    public function __construct(
        public string $replyText,
        public int $promptTokens = 0,
        public int $completionTokens = 0,
        public float $costUsd = 0.0,
        public string $modelName = 'gpt-4o-mini'
    ) {}
}

interface LLMProviderInterface
{
    public function generateRecommendationReason(CustomerFaceProfile $profile, Hairstyle $hairstyle): string;
    public function chat(array $messages, array $context = []): ChatResponse;
    public function getProviderName(): string;
}
