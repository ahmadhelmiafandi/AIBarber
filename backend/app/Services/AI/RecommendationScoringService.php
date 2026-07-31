<?php

namespace App\Services\AI;

use App\Models\AiRule;
use App\Models\CustomerFaceProfile;
use App\Models\Hairstyle;
use App\Models\SystemSetting;
use Illuminate\Support\Collection;

class RecommendationScoringService
{
    public function getScoringWeights(): array
    {
        return [
            'face_shape' => (float) (SystemSetting::where('key', 'ai_weight_face_shape')->value('value') ?? 0.40),
            'hair_texture' => (float) (SystemSetting::where('key', 'ai_weight_hair_texture')->value('value') ?? 0.30),
            'density' => (float) (SystemSetting::where('key', 'ai_weight_density')->value('value') ?? 0.20),
            'cms_modifier' => (float) (SystemSetting::where('key', 'ai_weight_cms_modifier')->value('value') ?? 0.10),
        ];
    }

    public function scoreAndRank(CustomerFaceProfile $profile): Collection
    {
        $weights = $this->getScoringWeights();
        $activeHairstyles = Hairstyle::where('is_active', true)->get();
        $cmsRules = AiRule::where('is_active', true)->get();

        $scoredList = collect();

        foreach ($activeHairstyles as $hairstyle) {
            // 1. Face Shape Subscore (0 to 100)
            $faceSubscore = $this->calculateMatchScore(
                $profile->face_shape,
                $hairstyle->suitable_face_shapes ?? []
            );

            // 2. Hair Texture Subscore (0 to 100)
            $textureSubscore = $this->calculateMatchScore(
                $profile->hair_texture,
                $hairstyle->suitable_hair_textures ?? []
            );

            // 3. Density Subscore (0 to 100)
            $densitySubscore = 80; // Baseline good compatibility

            // 4. CMS Rules Modifier
            $cmsModifier = 0;
            foreach ($cmsRules as $rule) {
                $matchFace = empty($rule->face_shape) || strtolower($rule->face_shape) === strtolower($profile->face_shape);
                $matchTexture = empty($rule->hair_texture) || strtolower($rule->hair_texture) === strtolower($profile->hair_texture);
                $matchHairstyle = empty($rule->hairstyle_id) || $rule->hairstyle_id === $hairstyle->id;

                if ($matchFace && $matchTexture && $matchHairstyle) {
                    $cmsModifier += (int) $rule->score_modifier;
                }
            }

            // Weighted Total Score calculation
            $totalScore = (int) round(
                ($faceSubscore * $weights['face_shape']) +
                ($textureSubscore * $weights['hair_texture']) +
                ($densitySubscore * $weights['density']) +
                ($cmsModifier * $weights['cms_modifier'])
            );

            // Clamp between 50 and 99
            $finalScore = max(50, min(99, $totalScore));

            $scoredList->push([
                'hairstyle' => $hairstyle,
                'score' => $finalScore,
                'face_subscore' => $faceSubscore,
                'texture_subscore' => $textureSubscore,
            ]);
        }

        // Deterministic Sort: By score DESC, then hairstyle name ASC
        return $scoredList->sort(function ($a, $b) {
            if ($a['score'] === $b['score']) {
                return strcmp($a['hairstyle']->name, $b['hairstyle']->name);
            }
            return $b['score'] <=> $a['score'];
        })->values();
    }

    private function calculateMatchScore(string $userAttribute, array|string|null $suitableList): int
    {
        if (empty($suitableList)) {
            return 75; // Neutral match
        }

        $list = is_array($suitableList) ? $suitableList : json_decode((string) $suitableList, true) ?? [];
        $userAttrLower = strtolower(trim($userAttribute));

        foreach ($list as $item) {
            if (strtolower(trim((string) $item)) === $userAttrLower) {
                return 100;
            }
        }

        return 60;
    }
}
