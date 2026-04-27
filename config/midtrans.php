<?php

return [
    'server_key' => env('MIDTRANS_SERVER_KEY', ''),
    'client_key' => env('MIDTRANS_CLIENT_KEY', ''),
    'is_production' => env('MIDTRANS_IS_PRODUCTION', false),
    'is_sanitized' => true,
    'is_3ds' => true,

    'price_color' => env('PHOTOBOOTH_PRICE_COLOR', 10000),
    'price_bw' => env('PHOTOBOOTH_PRICE_BW', 7000),
];
