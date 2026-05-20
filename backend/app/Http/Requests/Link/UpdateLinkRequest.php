<?php

namespace App\Http\Requests\Link;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLinkRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'link_target' => ['sometimes', 'url', 'max:2048'],
            'is_active' => ['sometimes', 'boolean'],
            'valid_until' => ['sometimes', 'nullable', 'date', 'after:now'],
        ];
    }

    public function messages(): array
    {
        return [
            'valid_until.after' => 'The expiry date must be in the future.',
        ];
    }
}
