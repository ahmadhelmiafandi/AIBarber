<?php
namespace App\Http\Requests\Master;

use Illuminate\Foundation\Http\FormRequest;

class AiRuleRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'face_shape' => ['required', 'string', 'max:50'],
            'hairstyle_id' => ['required', 'uuid', 'exists:hairstyles,id'],
            'score_boost' => ['integer'],
            'prompt_template' => ['nullable', 'string'],
            'negative_prompt' => ['nullable', 'string'],
            'is_active' => ['boolean']
        ];
    }
}
