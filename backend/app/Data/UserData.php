<?php

namespace App\Data;

use App\Models\User;
use App\Services\HashIdService;
use Spatie\LaravelData\Data;

class UserData extends Data
{
    public function __construct(
        public readonly string  $id,
        public readonly string  $username,
        public readonly string  $display_name,
        public readonly string  $email,
        public readonly bool    $is_active,
        public readonly bool    $can_custom_slug,
        public readonly bool    $is_admin,
        public readonly ?string $created_at,
    ) {}

    public static function fromModel(User $user): self
    {
        $hashId = app(HashIdService::class);

        return new self(
            id: $hashId->encode($user->id),
            username: $user->username,
            display_name: $user->display_name,
            email: $user->email,
            is_active: $user->is_active,
            can_custom_slug: (bool) ($user->can_custom_slug ?? false),
            is_admin: (bool) ($user->is_admin ?? false),
            created_at: $user->created_at?->toIso8601String(),
        );
    }
}
