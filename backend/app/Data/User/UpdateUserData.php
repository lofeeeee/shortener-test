<?php

namespace App\Data\User;

use App\Services\HashIdService;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Spatie\LaravelData\Attributes\Validation\BooleanType;
use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Attributes\Validation\StringType;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Optional;

class UpdateUserData extends Data
{
    public function __construct(
        #[StringType, Max(100)]
        public readonly Optional|string $display_name,

        // email and password rules are in rules() because they need dynamic logic
        public readonly Optional|string $email,

        public readonly Optional|string $password,

        #[BooleanType]
        public readonly Optional|bool $is_active,
    ) {}

    public static function rules(): array
    {
        $userId = null;
        $hashedId = request()->route('hashedId');

        if ($hashedId) {
            $userId = app(HashIdService::class)->decode((string) $hashedId);
        }

        return [
            'email' => [
                'sometimes', 'string', 'email', 'max:255',
                Rule::unique('users', 'email')->ignore($userId),
            ],
            'password' => [
                'sometimes', 'string',
                Password::min(8)->mixedCase()->numbers(),
                'confirmed',
            ],
        ];
    }
}
