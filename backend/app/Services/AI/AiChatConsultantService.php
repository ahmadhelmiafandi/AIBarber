<?php

namespace App\Services\AI;

use App\Models\CustomerFaceProfile;
use App\Models\User;
use App\Services\AI\Contracts\ChatResponse;
use App\Services\AI\Contracts\LLMProviderInterface;
use Illuminate\Validation\ValidationException;

class AiChatConsultantService
{
    public function __construct(
        private readonly LLMProviderInterface $llmProvider,
        private readonly AiAuditAndCostService $auditService
    ) {}

    public function chat(User $user, array $messages): ChatResponse
    {
        // 1. Session message limit check (Max 10 messages)
        if (count($messages) > 10) {
            throw ValidationException::withMessages([
                'messages' => ['Batas pesan konsultasi per sesi (maksimal 10) telah tercapai.'],
            ]);
        }

        // 2. Fetch User Profile Context
        $profile = CustomerFaceProfile::where('user_id', $user->id)->first();

        // Bounded Context (Last 4 turns)
        $recentMessages = array_slice($messages, -4);

        $context = [
            'user_name' => $user->name,
            'face_shape' => $profile?->face_shape ?? 'oval',
            'hair_texture' => $profile?->hair_texture ?? 'wavy',
            'hair_density' => $profile?->hair_density ?? 'thick',
        ];

        // Reserve chat budget ($0.005 estimated)
        $this->auditService->reserveBudget(0.00500);

        $response = $this->llmProvider->chat($recentMessages, $context);

        $this->auditService->reconcileBudget(0.00500, $response->costUsd);
        $this->auditService->logOperation([
            'user_id' => $user->id,
            'operation_type' => 'chat',
            'model_used' => $response->modelName,
            'engine_version' => 'v1.0',
            'duration_ms' => 120,
            'cost_usd' => $response->costUsd,
            'status' => 'success',
            'request_payload' => ['message_count' => count($recentMessages)],
            'response_payload' => ['tokens' => $response->completionTokens],
        ]);

        return $response;
    }
}
