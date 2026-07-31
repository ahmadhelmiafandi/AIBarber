<?php
namespace App\Http\Requests\Master;

use Illuminate\Foundation\Http\FormRequest;

class BarberRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'user_id' => ['required', 'uuid', 'exists:users,id'],
            'branch_id' => ['required', 'uuid', 'exists:branches,id'],
            'specialization' => ['nullable', 'string', 'max:255'],
            'is_active' => ['boolean']
        ];
    }
}
