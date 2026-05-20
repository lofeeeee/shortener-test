<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Link extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'unique_id',
        'link_target',
        'passed',
        'datetime_created',
        'created_by',
        'datetime_deleted',
        'deleted_by',
        'is_active',
    ];

    protected $casts = [
        'datetime_created' => 'datetime',
        'datetime_deleted' => 'datetime',
        'is_active' => 'boolean',
        'passed' => 'integer',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function deleter()
    {
        return $this->belongsTo(User::class, 'deleted_by');
    }
}
