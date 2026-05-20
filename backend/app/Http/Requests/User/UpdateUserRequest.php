<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->route('hashedId')
            ? app(\App\Services\HashIdService::class)->decode($this->route('hashedId'))
            : null;

        return [
            'display_name' => ['sometimes', 'string', 'max:100'],
            'email' => [
                'sometimes', 'string', 'email', 'max:255',
                Rule::unique('users', 'email')->ignore($userId),
            ],
            'password' => ['sometimes', 'string', Password::min(8)->mixedCase()->numbers(), 'confirmed'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
