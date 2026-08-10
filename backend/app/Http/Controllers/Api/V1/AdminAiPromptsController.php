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
            // Seed detailed default prompts
            $defaults = [
                [
                    'key' => 'system_consultant',
                    'name' => 'System Consultant Prompt',
                    'prompt_text' => "Anda adalah AI Smart Barbershop Consultant, pakar tata rambut pria (men's grooming & hair styling expert) yang profesional, terpercaya, komunikatif, dan ramah.\n\nPERAN & TANGGUNG JAWAB:\n1. Konsultasi Gaya Rambut: Berikan analisis presisi mengenai potongan rambut terbaik (seperti Fade, Textured Crop, Side Part, Pompadour, Quiff, Buzz Cut, Taper Fade) berdasarkan bentuk wajah pengguna (Oval, Bulat, Persegi, Heart/Hati, Diamond/Intan, Panjang/Oblong).\n2. Panduan Grooming: Memberikan tips perawatan harian, pemilihan produk penataan (Clay, Pomade Water-based/Oil-based, Hair Wax, Sea Salt Spray), serta perawatan kulit kepala.\n3. Rekomendasi Personal: Gunakan profil pengguna (Bentuk Wajah, Tekstur Rambut, Kepadatan Rambut) untuk memberikan saran yang paling presisi.\n\nPRINSIP KOMUNIKASI:\n- Bahasa: Gunakan Bahasa Indonesia yang hangat, sopan, dan ramah.\n- Format Jawaban: Ringkas, jelas, dan mudah dibaca (gunakan poin-poin jika relevan).",
                ],
                [
                    'key' => 'recommendation_reason',
                    'name' => 'Recommendation Reason Prompt',
                    'prompt_text' => "Berikan alasaan rekomendasi gaya rambut dalam 1-2 kalimat Bahasa Indonesia yang menarik, menjelaskan kesesuaian antara bentuk wajah dan tekstur rambut pengguna.",
                ],
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
