<?php

namespace App\Data\Link;

use Illuminate\Support\Carbon;
use Spatie\LaravelData\Attributes\Validation\After;
use Spatie\LaravelData\Attributes\Validation\BooleanType;
use Spatie\LaravelData\Attributes\Validation\Date;
use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Attributes\Validation\Nullable;
use Spatie\LaravelData\Attributes\Validation\Url;
use Spatie\LaravelData\Attributes\WithCast;
use Spatie\LaravelData\Casts\DateTimeInterfaceCast;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Optional;

class UpdateLinkData extends Data
{
    public function __construct(
        #[Url, Max(2048)]
        public readonly Optional|string $link_target,

        #[BooleanType]
        public readonly Optional|bool $is_active,

        // Pass null explicitly to remove an existing expiry date.
        #[Nullable, Date, After('now')]
        #[WithCast(DateTimeInterfaceCast::class, format: 'Y-m-d')]
        public readonly Optional|Carbon|null $valid_until,
    ) {}
}
