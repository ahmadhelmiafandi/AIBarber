<?php

namespace App\Http\Requests\Booking;

use Illuminate\Foundation\Http\FormRequest;

class BookingAvailabilityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('booking_date') && !$this->has('date')) {
            $this->merge([
                'date' => $this->input('booking_date'),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'branch_id' => ['required', 'uuid', 'exists:branches,id'],
            'service_id' => ['required', 'uuid', 'exists:services,id'],
            'date' => ['required', 'date_format:Y-m-d', 'after_or_equal:today'],
            'barber_id' => ['nullable', 'uuid', 'exists:barbers,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'date.after_or_equal' => 'Tanggal booking tidak boleh di masa lalu.',
            'date.date_format' => 'Format tanggal harus Y-m-d.',
        ];
    }
}
