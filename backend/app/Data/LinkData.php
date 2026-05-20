<?php

namespace App\Data;

use App\Models\Link;
use App\Services\HashIdService;
use Spatie\LaravelData\Data;

class LinkData extends Data
{
    public function __construct(
        public readonly string  $id,
        public readonly string  $unique_id,
        public readonly string  $short_url,
        public readonly string  $link_target,
        public readonly int     $passed,
        public readonly bool    $is_active,
        public readonly bool    $is_expired,
        public readonly ?string $valid_until,
        public readonly string  $created_at,
        public readonly string  $updated_at,
        public readonly string  $created_by,
        public readonly ?string $deleted_at,
        public readonly ?string $deleted_by,
    ) {}

    public static function fromModel(Link $link): self
    {
        $hashId = app(HashIdService::class);

        return new self(
            id: $hashId->encode($link->id),
            unique_id: $link->unique_id,
            short_url: config('app.url').'/'.$link->unique_id,
            link_target: $link->link_target,
            passed: $link->passed,
            is_active: $link->is_active,
            is_expired: $link->isExpired(),
            valid_until: $link->valid_until?->toIso8601String(),
            created_at: $link->created_at->toIso8601String(),
            updated_at: $link->updated_at->toIso8601String(),
            created_by: $hashId->encode($link->created_by),
            deleted_at: $link->deleted_at?->toIso8601String(),
            deleted_by: $link->deleted_by ? $hashId->encode($link->deleted_by) : null,
        );
    }
}
