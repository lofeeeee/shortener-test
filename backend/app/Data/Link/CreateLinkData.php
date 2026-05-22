<?php

namespace App\Data\Link;

use Illuminate\Support\Carbon;
use Spatie\LaravelData\Attributes\Validation\After;
use Spatie\LaravelData\Attributes\Validation\Date;
use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Attributes\Validation\Nullable;
use Spatie\LaravelData\Attributes\Validation\Regex;
use Spatie\LaravelData\Attributes\Validation\Url;
use Spatie\LaravelData\Attributes\WithCast;
use Spatie\LaravelData\Casts\DateTimeInterfaceCast;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Optional;

class CreateLinkData extends Data
{
    public function __construct(
        #[Url, Max(2048)]
        public readonly string $link_target,

        // NULL = permanent (no expiry). Must be a future date when provided.
        #[Nullable, Date, After('now')]
        #[WithCast(DateTimeInterfaceCast::class, format: 'Y-m-d')]
        public readonly ?Carbon $valid_until,

        // Optional custom slug — only honoured if the user has can_custom_slug permission.
        #[Nullable, Regex('/^[a-z0-9][a-z0-9_-]{1,18}[a-z0-9]$/')]
        public readonly Optional|string|null $custom_slug,
    ) {}
}
