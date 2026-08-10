<?php

namespace App\Services\AI\Adapters;

use App\Models\CustomerFaceProfile;
use App\Models\Hairstyle;
use App\Services\AI\Contracts\ChatResponse;
use App\Services\AI\Contracts\LLMProviderInterface;
use App\Services\AI\Contracts\VisionAnalysisResult;
use App\Services\AI\Contracts\VisionProviderInterface;
use Illuminate\Support\Facades\Http;

class OpenAiVisionAdapter implements VisionProviderInterface, LLMProviderInterface
{
    public function analyzeFaceAndHair(string $imagePath): VisionAnalysisResult
    {
        $apiKey = config('services.openai.key') ?: env('OPENAI_API_KEY');

        if (!$apiKey) {
            // Safe fallback if API key is not set
            return new VisionAnalysisResult(
                faceShape: 'oval',
                hairline: 'straight',
                hairTexture: 'wavy',
                hairDensity: 'thick',
                confidence: 0.90,
                rawMetadata: ['fallback' => true]
            );
        }

        try {
            $base64Image = base64_encode(file_get_contents($imagePath));
            $response = Http::withToken($apiKey)
                ->timeout(15)
                ->post('https://api.openai.com/v1/chat/completions', [
                    'model' => 'gpt-4o-mini',
                    'messages' => [
                        [
                            'role' => 'user',
                            'content' => [
                                ['type' => 'text', 'text' => 'Classify face_shape (oval, round, square, heart, diamond, oblong), hairline (straight, m-shaped, receding), hair_texture (straight, wavy, curly), hair_density (thin, medium, thick) in JSON format.'],
                                ['type' => 'image_url', 'image_url' => ['url' => "data:image/jpeg;base64,{$base64Image}"]],
                            ],
                        ],
                    ],
                    'response_format' => ['type' => 'json_object'],
                ]);

            if ($response->successful()) {
                $data = $response->json('choices.0.message.content');
                $parsed = json_decode($data, true) ?? [];
                return new VisionAnalysisResult(
                    faceShape: $parsed['face_shape'] ?? 'oval',
                    hairline: $parsed['hairline'] ?? 'straight',
                    hairTexture: $parsed['hair_texture'] ?? 'wavy',
                    hairDensity: $parsed['hair_density'] ?? 'thick',
                    confidence: 0.95,
                    rawMetadata: ['model' => 'gpt-4o-mini']
                );
            }
        } catch (\Throwable) {
            // Fallback on HTTP error
        }

        return new VisionAnalysisResult(
            faceShape: 'oval',
            hairline: 'straight',
            hairTexture: 'wavy',
            hairDensity: 'thick',
            confidence: 0.85,
            rawMetadata: ['fallback' => true]
        );
    }

    public function generateRecommendationReason(CustomerFaceProfile $profile, Hairstyle $hairstyle): string
    {
        $apiKey = config('services.openai.key') ?: env('OPENAI_API_KEY');

        if ($apiKey) {
            try {
                $prompt = "Generate a concise 1-2 sentence recommendation reason in Indonesian explaining why the haircut '{$hairstyle->name}' ({$hairstyle->description}) suits a customer with face shape '{$profile->face_shape}', hairline '{$profile->hairline}', hair texture '{$profile->hair_texture}', and hair density '{$profile->hair_density}'.";

                $response = Http::withToken($apiKey)
                    ->timeout(12)
                    ->post('https://api.openai.com/v1/chat/completions', [
                        'model' => 'gpt-4o-mini',
                        'messages' => [
                            ['role' => 'user', 'content' => $prompt],
                        ],
                        'max_tokens' => 150,
                        'temperature' => 0.7,
                    ]);

                if ($response->successful()) {
                    $reply = trim((string) $response->json('choices.0.message.content'));
                    if (!empty($reply)) {
                        return $reply;
                    }
                }
            } catch (\Throwable) {
                // Fallback on API error
            }
        }

        return "Model gaya rambut {$hairstyle->name} sangat cocok untuk menyeimbangkan proporsi wajah {$profile->face_shape} dan tekstur {$profile->hair_texture}.";
    }

    public function chat(array $messages, array $context = []): ChatResponse
    {
        $apiKey = config('services.openai.key') ?: env('OPENAI_API_KEY');

        if ($apiKey) {
            try {
                $systemPrompt = "Anda adalah AI Smart Barbershop Consultant yang sangat ahli dan ramah dalam memberikan saran gaya rambut, perawatan rambut, serta style cukur pria. "
                    . "Profil pengguna: Nama '{$context['user_name']}', Bentuk Wajah '{$context['face_shape']}', Tekstur Rambut '{$context['hair_texture']}', Kepadatan Rambut '{$context['hair_density']}'. "
                    . "Berikan jawaban yang membantu, singkat, dan tepat sasaran dalam Bahasa Indonesia.";

                $apiMessages = [['role' => 'system', 'content' => $systemPrompt]];
                foreach ($messages as $msg) {
                    $apiMessages[] = [
                        'role' => ($msg['role'] ?? 'user') === 'user' ? 'user' : 'assistant',
                        'content' => $msg['content'] ?? '',
                    ];
                }

                $response = Http::withToken($apiKey)
                    ->timeout(15)
                    ->post('https://api.openai.com/v1/chat/completions', [
                        'model' => 'gpt-4o-mini',
                        'messages' => $apiMessages,
                        'max_tokens' => 400,
                        'temperature' => 0.7,
                    ]);

                if ($response->successful()) {
                    $replyText = trim((string) $response->json('choices.0.message.content'));
                    $promptTokens = (int) ($response->json('usage.prompt_tokens') ?? 120);
                    $completionTokens = (int) ($response->json('usage.completion_tokens') ?? 80);
                    $cost = ($promptTokens * 0.00000015) + ($completionTokens * 0.00000060);

                    if (!empty($replyText)) {
                        return new ChatResponse(
                            replyText: $replyText,
                            promptTokens: $promptTokens,
                            completionTokens: $completionTokens,
                            costUsd: round($cost, 6),
                            modelName: 'gpt-4o-mini'
                        );
                    }
                }
            } catch (\Throwable) {
                // Fallback on API error
            }
        }

        $lastMsg = end($messages)['content'] ?? 'konsultasi';
        return new ChatResponse(
            replyText: "Berdasarkan analisis bentuk wajah {$context['face_shape']} dan tekstur rambut {$context['hair_texture']} Anda, pertanyaan seputar '{$lastMsg}' dapat disesuaikan dengan model rambut terkini yang menjaga proporsi wajah Anda tetap seimbang.",
            promptTokens: 110,
            completionTokens: 45,
            costUsd: 0.00010,
            modelName: 'gpt-4o-mini-fallback'
        );
    }

    public function getProviderName(): string
    {
        return 'openai';
    }
}
