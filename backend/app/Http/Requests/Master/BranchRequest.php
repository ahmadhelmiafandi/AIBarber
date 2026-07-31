<?php
namespace App\Http\Requests\Master;

use Illuminate\Foundation\Http\FormRequest;

class BranchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Dihandle oleh Controller via Gate/Policy
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'address' => ['required', 'string'],
            'phone' => ['nullable', 'string', 'max:20'],
            'google_maps_url' => ['nullable', 'url'],
            'opening_hours' => ['nullable', 'array'],
            'is_active' => ['boolean']
        ];
    }
}
