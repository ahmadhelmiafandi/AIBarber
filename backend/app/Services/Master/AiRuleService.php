<?php
namespace App\Services\Master;

use App\Models\AiRule;

class AiRuleService
{
    public function getAll()
    {
        return AiRule::with('hairstyle')->get();
    }

    public function create(array $data): AiRule
    {
        return AiRule::create($data);
    }

    public function update(AiRule $aiRule, array $data): AiRule
    {
        $aiRule->update($data);
        return $aiRule;
    }

    public function delete(AiRule $aiRule): bool
    {
        return $aiRule->delete();
    }
}
