<?php

namespace App\Data\Auth;

use Spatie\LaravelData\Attributes\Validation\AlphaDash;
use Spatie\LaravelData\Attributes\Validation\Confirmed;
use Spatie\LaravelData\Attributes\Validation\Email;
use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Attributes\Validation\Min;
use Spatie\LaravelData\Attributes\Validation\StringType;
use Spatie\LaravelData\Attributes\Validation\Unique;
use Spatie\LaravelData\Data;

class RegisterData extends Data
{
    public function __construct(
        #[StringType, AlphaDash, Max(30), Unique('users', 'username')]
        public readonly string $username,

        #[StringType, Max(100)]
        public readonly string $display_name,

        #[Email, Max(255), Unique('users', 'email')]
        public readonly string $email,

        // password_confirmation is checked by Confirmed but not stored as a property
        #[Min(8), Confirmed]
        public readonly string $password,
    ) {}
}
