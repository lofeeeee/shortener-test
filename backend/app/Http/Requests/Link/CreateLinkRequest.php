<?php

namespace App\Http\Requests\Link;

use Illuminate\Foundation\Http\FormRequest;

class CreateLinkRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'link_target' => ['required', 'url', 'max:2048'],
            'valid_until' => ['nullable', 'date', 'after:now'],
        ];
    }

    public function messages(): array
    {
        return [
            'valid_until.after' => 'The expiry date must be in the future.',
        ];
    }
}
