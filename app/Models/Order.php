<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Order extends Model
{
    // Frame type configurations
    public const FRAMES = [
        'classic_2x2' => ['name' => 'Classic 2x2', 'slots' => 4, 'icon' => '⊞', 'desc' => 'Grid 2×2 klasik'],
        'strip' => ['name' => 'Strip', 'slots' => 4, 'icon' => '▮', 'desc' => 'Strip vertikal 4 foto'],
        'collage' => ['name' => 'Collage', 'slots' => 3, 'icon' => '◲', 'desc' => '1 besar + 2 kecil'],
        'single' => ['name' => 'Single', 'slots' => 1, 'icon' => '◻', 'desc' => '1 foto full'],
    ];

    protected $fillable = [
        'order_code',
        'customer_name',
        'customer_email',
        'customer_phone',
        'frame_type',
        'status',
        'print_mode',
        'print_qty',
        'total_price',
        'qr_code_url',
        'midtrans_order_id',
        'payment_type',
        'paid_at',
        'expired_at',
        'printed_at',
    ];

    protected $casts = [
        'paid_at' => 'datetime',
        'expired_at' => 'datetime',
        'printed_at' => 'datetime',
    ];

    public function photos(): HasMany
    {
        return $this->hasMany(OrderPhoto::class);
    }

    /**
     * Generate unique order code like MOM-A3F2
     */
    public static function generateCode(): string
    {
        do {
            $code = 'MOM-' . strtoupper(Str::random(4));
        } while (self::where('order_code', $code)->exists());

        return $code;
    }

    /**
     * Calculate price based on print mode and quantity
     */
    public static function calculatePrice(string $mode, int $qty): int
    {
        $pricePerSheet = $mode === 'color'
            ? config('midtrans.price_color', 10000)
            : config('midtrans.price_bw', 7000);

        return $pricePerSheet * $qty;
    }

    public function scopeWaiting($query)
    {
        return $query->where('status', 'waiting');
    }

    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }
}
