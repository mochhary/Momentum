<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderPhoto extends Model
{
    protected $fillable = [
        'order_id',
        'photo_path',
        'original_name',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
