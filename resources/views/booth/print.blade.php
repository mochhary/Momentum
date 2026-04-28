<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Mencetak... - Photobooth Studio</title>
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256'><rect width='256' height='256' fill='none'/><path d='M208,56H180.28L166.65,35.56A8,8,0,0,0,160,32H96a8,8,0,0,0-6.65,3.56L75.71,56H48A24,24,0,0,0,24,80V192a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V80A24,24,0,0,0,208,56Zm8,136a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V80a8,8,0,0,1,8-8H80a8,8,0,0,0,6.66-3.56L100.28,48h55.43l13.63,20.44A8,8,0,0,0,176,72h32a8,8,0,0,1,8,8ZM128,88a44,44,0,1,0,44,44A44.05,44.05,0,0,0,128,88Zm0,72a28,28,0,1,1,28-28A28,28,0,0,1,128,160Z' fill='%238b5cf6'/></svg>">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Space+Grotesk:wght@500;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/@phosphor-icons/web"></script>
    <link rel="stylesheet" href="{{ asset('css/print.css') }}">
    @vite(['resources/js/app.js'])
</head>
<body>
    <div class="screen-view animate-in">
        <div class="success-icon">
            <i class="ph ph-check-circle"></i>
        </div>
        <h2 style="font-family: 'Space Grotesk', sans-serif;">Pembayaran Selesai!</h2>
        <p class="status-text">
            Terima kasih! Pembayaran Anda telah kami terima.<br>
            Foto Anda sedang diproses untuk dicetak. Silakan ambil hasil cetaknya pada mesin.
        </p>
        
        <div class="spinner"></div>
        
        <div style="margin-top: 30px;">
            <a href="{{ route('booth.index') }}" class="btn btn-success btn-lg" style="padding: 18px 48px; font-size: 1.2rem; border-radius: 100px;">
                <i class="ph ph-check-circle"></i> Selesai
            </a>
        </div>
        
        <div class="redirect-hint" style="margin-top: 24px; opacity: 0.6; font-size: 0.8rem;">
            <i class="ph ph-clock"></i> Kembali ke awal otomatis dalam 1 menit
        </div>
    </div>

    <div class="print-area">
        <div class="print-frame">
            @if($order->photos->isNotEmpty())
                <!-- Menggunakan relative path /storage/ untuk menghindari error Mixed Content (Insecure) di Ngrok -->
                <div class="print-photo">
                    <img src="/storage/{{ $order->photos->first()->photo_path }}" alt="Photobooth Print" @if($order->print_mode === 'bw') style="filter: grayscale(100%);" @endif>
                </div>
            @endif
        </div>
    </div>

    <div data-island="GlobalApp" style="display:none"></div>
    <div
        data-island="BoothPrint"
        data-props="{{ json_encode([
            'boothIndexUrl' => route('booth.index'),
            'printedUrl' => route('booth.printed', $order->order_code),
        ]) }}"
        style="display:none"
    ></div>
</body>
</html>
