<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\AiPrompt;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminAiPromptsController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $prompts = AiPrompt::all();
        if ($prompts->isEmpty()) {
            // Seed defaults
            $defaults = [
                ['key' => 'system_consultant', 'name' => 'System Consultant Prompt', 'prompt_text' => 'Anda adalah AI Smart Barbershop Consultant yang sangat ahli dan ramah dalam memberikan saran gaya rambut...'],
                ['key' => 'recommendation_reason', 'name' => 'Recommendation Reason Prompt', 'prompt_text' => 'Generate a concise 1-2 sentence recommendation reason in Indonesian explaining why...'],
            ];
            foreach ($defaults as $d) {
                AiPrompt::create([
                    'id' => (string) Str::uuid(),
                    'key' => $d['key'],
                    'name' => $d['name'],
                    'prompt_text' => $d['prompt_text'],
                    'is_active' => true,
                ]);
            }
            $prompts = AiPrompt::all();
        }

        return $this->successResponse('Daftar prompt AI CMS.', $prompts);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'key' => ['required', 'string', 'max:50'],
            'name' => ['required', 'string', 'max:100'],
            'prompt_text' => ['required', 'string'],
        ]);

        $prompt = AiPrompt::updateOrCreate(
            ['key' => $request->input('key')],
            [
                'id' => (string) Str::uuid(),
                'name' => $request->input('name'),
                'prompt_text' => $request->input('prompt_text'),
                'is_active' => true,
            ]
        );

        return $this->successResponse('Prompt AI berhasil disimpan.', $prompt, status: 200);
    }
}
