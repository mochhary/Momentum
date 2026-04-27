<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Frame extends Model
{
    protected $fillable = ['name', 'image', 'layout_config'];

    protected $casts = [
        'layout_config' => 'array',
    ];
}
