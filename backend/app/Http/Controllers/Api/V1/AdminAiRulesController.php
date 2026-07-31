<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\AiRule;
use App\Models\SystemSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminAiRulesController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $rules = AiRule::with('hairstyle')->get();
        $settings = SystemSetting::where('key', 'like', 'ai_%')->get();

        return $this->successResponse('Daftar CMS aturan AI & konfigurasi bobot.', [
            'rules' => $rules,
            'settings' => $settings,
        ]);
    }

    public function storeRule(Request $request): JsonResponse
    {
        $request->validate([
            'rule_name' => ['required', 'string', 'max:100'],
            'face_shape' => ['nullable', 'string', 'max:50'],
            'hair_texture' => ['nullable', 'string', 'max:50'],
            'hairstyle_id' => ['nullable', 'uuid', 'exists:hairstyles,id'],
            'score_modifier' => ['required', 'integer', 'between:-50,50'],
        ]);

        $rule = AiRule::create([
            'id' => Str::uuid(),
            'rule_name' => $request->input('rule_name'),
            'face_shape' => $request->input('face_shape'),
            'hair_texture' => $request->input('hair_texture'),
            'hairstyle_id' => $request->input('hairstyle_id'),
            'score_modifier' => $request->input('score_modifier'),
            'is_active' => true,
        ]);

        return $this->successResponse('Aturan AI CMS berhasil ditambahkan.', $rule, status: 201);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $request->validate([
            'ai_identity_threshold' => ['nullable', 'numeric', 'between:0.5,1.0'],
            'ai_weight_face_shape' => ['nullable', 'numeric', 'between:0,1.0'],
            'ai_weight_hair_texture' => ['nullable', 'numeric', 'between:0,1.0'],
            'ai_weight_density' => ['nullable', 'numeric', 'between:0,1.0'],
            'ai_weight_cms_modifier' => ['nullable', 'numeric', 'between:0,1.0'],
            'daily_ai_cost_limit_usd' => ['nullable', 'numeric', 'min:1.0'],
        ]);

        foreach ($request->only([
            'ai_identity_threshold',
            'ai_weight_face_shape',
            'ai_weight_hair_texture',
            'ai_weight_density',
            'ai_weight_cms_modifier',
            'daily_ai_cost_limit_usd',
        ]) as $key => $value) {
            if ($value !== null) {
                SystemSetting::updateOrCreate(
                    ['key' => $key],
                    ['value' => (string) $value, 'type' => 'string']
                );
            }
        }

        return $this->successResponse('Pengaturan bobot & ambang AI berhasil diperbarui.');
    }
}
