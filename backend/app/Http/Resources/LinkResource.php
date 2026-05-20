<?php

namespace App\Http\Resources;

use App\Services\HashIdService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LinkResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $hashId = app(HashIdService::class);

        return [
            'id' => $hashId->encode($this->id),
            'unique_id' => $this->unique_id,
            'short_url' => config('app.url').'/'.$this->unique_id,
            'link_target' => $this->link_target,
            'passed' => $this->passed,
            'datetime_created' => $this->datetime_created?->toIso8601String(),
            'created_by' => $this->created_by ? $hashId->encode($this->created_by) : null,
            'datetime_deleted' => $this->datetime_deleted?->toIso8601String(),
            'deleted_by' => $this->deleted_by ? $hashId->encode($this->deleted_by) : null,
            'is_active' => $this->is_active,
        ];
    }
}
