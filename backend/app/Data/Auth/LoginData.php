<?php

namespace App\Data\Auth;

use Spatie\LaravelData\Attributes\Validation\StringType;
use Spatie\LaravelData\Data;

class LoginData extends Data
{
    public function __construct(
        #[StringType]
        public readonly string $login,

        #[StringType]
        public readonly string $password,
    ) {}
}
