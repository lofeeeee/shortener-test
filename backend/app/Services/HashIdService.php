<?php

namespace App\Services;

use Hashids\Hashids;

class HashIdService
{
    private Hashids $hashids;

    public function __construct()
    {
        $this->hashids = new Hashids(
            (string) env('HASHIDS_SECRET', 'default-secret'),
            (int) env('HASHIDS_LENGTH', 8),
            'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
        );
    }

    public function encode(int $id): string
    {
        return $this->hashids->encode($id);
    }

    public function decode(string $hash): ?int
    {
        $decoded = $this->hashids->decode($hash);

        return !empty($decoded) ? (int) $decoded[0] : null;
    }
}
