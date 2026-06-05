<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

class Link extends Model
{
    use HasFactory;

    // created_at and updated_at are managed automatically
    public $timestamps = true;

    protected $fillable = [
        'unique_id',
        'title',
        'link_target',
        'password',
        'passed',
        'is_active',
        'valid_until',
        'created_by',
        'deleted_at',
        'deleted_by',
    ];

    protected $casts = [
        'valid_until' => 'datetime',
        'deleted_at' => 'datetime',
        'is_active' => 'boolean',
        'passed' => 'integer',
    ];

    public function isExpired(): bool
    {
        return $this->valid_until !== null
            && Carbon::now()->greaterThanOrEqualTo($this->valid_until);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function deleter()
    {
        return $this->belongsTo(User::class, 'deleted_by');
    }
}
