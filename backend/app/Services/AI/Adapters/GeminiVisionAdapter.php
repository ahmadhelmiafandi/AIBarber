<?php

namespace App\Services\AI\Adapters;

use App\Models\CustomerFaceProfile;
use App\Models\Hairstyle;
use App\Services\AI\Contracts\ChatResponse;
use App\Services\AI\Contracts\LLMProviderInterface;
use App\Services\AI\Contracts\VisionAnalysisResult;
use App\Services\AI\Contracts\VisionProviderInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiVisionAdapter implements VisionProviderInterface, LLMProviderInterface
{
    private function getApiKey(): ?string
    {
        return config('services.gemini.key') ?: env('GEMINI_API_KEY');
    }

    public function analyzeFaceAndHair(string $imagePath): VisionAnalysisResult
    {
        $apiKey = $this->getApiKey();

        if ($apiKey && file_exists($imagePath)) {
            try {
                $fileBytes = file_get_contents($imagePath);
                $mimeType = mime_content_type($imagePath) ?: 'image/jpeg';
                $base64Data = base64_encode($fileBytes);

                $prompt = "Analyze this human face photo for hair salon & barbershop consulting. "
                    . "Detect: 1) face_shape (oval, round, square, heart, diamond, oblong), "
                    . "2) hairline (straight, m-shaped, receding), "
                    . "3) hair_texture (straight, wavy, curly), "
                    . "4) hair_density (thin, medium, thick), "
                    . "5) confidence (number between 0.8 and 0.99). "
                    . "Respond STRICTLY in valid JSON format with keys: face_shape, hairline, hair_texture, hair_density, confidence.";

                $response = Http::timeout(20)->post(
                    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={$apiKey}",
                    [
                        'contents' => [
                            [
                                'parts' => [
                                    ['text' => $prompt],
                                    [
                                        'inlineData' => [
                                            'mimeType' => $mimeType,
                                            'data' => $base64Data,
                                        ],
                                    ],
                                ],
                            ],
                        ],
                        'generationConfig' => [
                            'responseMimeType' => 'application/json',
                            'temperature' => 0.2,
                        ],
                    ]
                );

                if ($response->successful()) {
                    $jsonText = $response->json('candidates.0.content.parts.0.text');
                    $parsed = json_decode($jsonText, true);

                    if ($parsed && isset($parsed['face_shape'])) {
                        return new VisionAnalysisResult(
                            faceShape: strtolower($parsed['face_shape'] ?? 'oval'),
                            hairline: strtolower($parsed['hairline'] ?? 'straight'),
                            hairTexture: strtolower($parsed['hair_texture'] ?? 'wavy'),
                            hairDensity: strtolower($parsed['hair_density'] ?? 'thick'),
                            confidence: (float) ($parsed['confidence'] ?? 0.95),
                            rawMetadata: ['provider' => 'gemini-1.5-flash', 'api_status' => 'success']
                        );
                    }
                } else {
                    Log::warning('Gemini Vision API request returned non-200 status', [
                        'status' => $response->status(),
                        'body' => $response->body(),
                    ]);
                }
            } catch (\Throwable $e) {
                Log::error('Gemini Vision API Exception: ' . $e->getMessage());
            }
        }

        // Safe Fallback when API key is not present or API call fails
        return new VisionAnalysisResult(
            faceShape: 'oval',
            hairline: 'straight',
            hairTexture: 'wavy',
            hairDensity: 'thick',
            confidence: 0.88,
            rawMetadata: ['provider' => 'gemini-1.5-flash', 'fallback' => true]
        );
    }

    public function generateRecommendationReason(CustomerFaceProfile $profile, Hairstyle $hairstyle): string
    {
        $apiKey = $this->getApiKey();

        if ($apiKey) {
            try {
                $prompt = "Generate a concise 1-2 sentence recommendation reason in Indonesian explaining why the haircut '{$hairstyle->name}' ({$hairstyle->description}) suits a customer with face shape '{$profile->face_shape}', hairline '{$profile->hairline}', hair texture '{$profile->hair_texture}', and hair density '{$profile->hair_density}'.";

                $response = Http::timeout(10)->post(
                    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={$apiKey}",
                    [
                        'contents' => [
                            ['parts' => [['text' => $prompt]]],
                        ],
                        'generationConfig' => [
                            'temperature' => 0.7,
                            'maxOutputTokens' => 150,
                        ],
                    ]
                );

                if ($response->successful()) {
                    $reply = trim((string) $response->json('candidates.0.content.parts.0.text'));
                    if (!empty($reply)) {
                        return $reply;
                    }
                }
            } catch (\Throwable $e) {
                Log::warning('Gemini generateRecommendationReason failed: ' . $e->getMessage());
            }
        }

        return "Model {$hairstyle->name} sangat cocok untuk menyeimbangkan proporsi bentuk wajah {$profile->face_shape} dan tekstur rambut {$profile->hair_texture}.";
    }

    public function chat(array $messages, array $context = []): ChatResponse
    {
        $apiKey = $this->getApiKey();

        if ($apiKey) {
            try {
                $systemPrompt = "Anda adalah AI Smart Barbershop Consultant, pakar tata rambut pria (men's grooming & hair styling expert) yang profesional, terpercaya, dan ramah.\n"
                    . "Profil pengguna: Nama '{$context['user_name']}', Bentuk Wajah '{$context['face_shape']}', Tekstur Rambut '{$context['hair_texture']}', Kepadatan Rambut '{$context['hair_density']}'.\n"
                    . "Berikan jawaban konsultasi gaya rambut dan grooming yang sangat membantu, ramah, presisi, serta terstruktur rapi dalam Bahasa Indonesia.";

                $contents = [];
                foreach ($messages as $msg) {
                    $role = ($msg['role'] ?? 'user') === 'user' ? 'user' : 'model';
                    $contents[] = [
                        'role' => $role,
                        'parts' => [['text' => $msg['content'] ?? '']],
                    ];
                }

                $response = Http::timeout(15)->post(
                    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={$apiKey}",
                    [
                        'systemInstruction' => [
                            'parts' => [['text' => $systemPrompt]],
                        ],
                        'contents' => $contents,
                        'generationConfig' => [
                            'temperature' => 0.7,
                            'maxOutputTokens' => 400,
                        ],
                    ]
                );

                if ($response->successful()) {
                    $replyText = trim((string) $response->json('candidates.0.content.parts.0.text'));
                    $promptTokens = (int) ($response->json('usageMetadata.promptTokenCount') ?? 120);
                    $completionTokens = (int) ($response->json('usageMetadata.candidatesTokenCount') ?? 80);

                    if (!empty($replyText)) {
                        return new ChatResponse(
                            replyText: $replyText,
                            promptTokens: $promptTokens,
                            completionTokens: $completionTokens,
                            costUsd: 0.00015,
                            modelName: 'gemini-1.5-flash'
                        );
                    }
                } else {
                    Log::warning('Gemini Chat API returned non-200 status', [
                        'status' => $response->status(),
                        'body' => $response->body(),
                    ]);
                }
            } catch (\Throwable $e) {
                Log::error('Gemini Chat API Exception: ' . $e->getMessage());
            }
        }

        $lastMsg = end($messages)['content'] ?? 'konsultasi';
        return new ChatResponse(
            replyText: "Berdasarkan analisis bentuk wajah {$context['face_shape']} dan tekstur rambut {$context['hair_texture']} Anda, pertanyaan seputar '{$lastMsg}' dapat disesuaikan dengan model rambut terkini yang menjaga proporsi wajah Anda tetap seimbang.",
            promptTokens: 110,
            completionTokens: 45,
            costUsd: 0.00010,
            modelName: 'gemini-1.5-flash-fallback'
        );
    }

    public function getProviderName(): string
    {
        return 'gemini';
    }
}
