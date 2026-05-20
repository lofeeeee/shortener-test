<?php

namespace App\Data\Link;

use Illuminate\Support\Carbon;
use Spatie\LaravelData\Attributes\Validation\After;
use Spatie\LaravelData\Attributes\Validation\Date;
use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Attributes\Validation\Nullable;
use Spatie\LaravelData\Attributes\Validation\Url;
use Spatie\LaravelData\Data;

class CreateLinkData extends Data
{
    public function __construct(
        #[Url, Max(2048)]
        public readonly string $link_target,

        // NULL = permanent (no expiry). Must be a future date when provided.
        #[Nullable, Date, After('now')]
        public readonly ?Carbon $valid_until,
    ) {}
}
