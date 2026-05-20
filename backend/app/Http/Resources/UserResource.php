<?php

namespace App\Http\Resources;

use App\Services\HashIdService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $hashId = app(HashIdService::class);

        return [
            'id' => $hashId->encode($this->id),
            'username' => $this->username,
            'display_name' => $this->display_name,
            'email' => $this->email,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
