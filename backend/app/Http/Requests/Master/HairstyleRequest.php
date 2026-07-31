<?php
namespace App\Http\Requests\Master;

use Illuminate\Foundation\Http\FormRequest;

class HairstyleRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'category' => ['nullable', 'string', 'max:50'],
            'suitable_face_shapes' => ['nullable', 'array'],
            'suitable_face_shapes.*' => ['string'],
            'unsuitable_face_shapes' => ['nullable', 'array'],
            'unsuitable_face_shapes.*' => ['string'],
            'maintenance_level' => ['nullable', 'string', 'max:50'],
            'difficulty' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
        ];
    }
}
