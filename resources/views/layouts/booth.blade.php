<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Booth Cetak - Photobooth Studio')</title>
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256'><rect width='256' height='256' fill='none'/><path d='M208,56H180.28L166.65,35.56A8,8,0,0,0,160,32H96a8,8,0,0,0-6.65,3.56L75.71,56H48A24,24,0,0,0,24,80V192a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V80A24,24,0,0,0,208,56Zm8,136a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V80a8,8,0,0,1,8-8H80a8,8,0,0,0,6.66-3.56L100.28,48h55.43l13.63,20.44A8,8,0,0,0,176,72h32a8,8,0,0,1,8,8ZM128,88a44,44,0,1,0,44,44A44.05,44.05,0,0,0,128,88Zm0,72a28,28,0,1,1,28-28A28,28,0,0,1,128,160Z' fill='%238b5cf6'/></svg>">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/@phosphor-icons/web"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <link rel="stylesheet" href="{{ asset('css/main.css') }}">
    <link rel="stylesheet" href="{{ asset('css/booth.css') }}">
    <!-- GSAP for Studio-Grade Animations -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    <!-- Simple-Keyboard for Kiosk -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/simple-keyboard@latest/build/css/index.css">
    <script src="https://cdn.jsdelivr.net/npm/simple-keyboard@latest/build/index.min.js"></script>
    @vite(['resources/js/app.js'])
    @yield('styles')
</head>
<body class="bg-page booth-body @yield('body_class')">
    @if(!request()->is('booth/*/payment') && !request()->routeIs('booth.payment.page'))
    <div class="custom-cursor">
        <div class="cursor-tip"></div>
        <div class="cursor-icon">
            <i class="ph-fill ph-aperture"></i>
        </div>
    </div>
    @endif
    <div class="booth-wrapper d-flex flex-column align-items-center justify-content-center min-vh-100">
        <div class="floating-bg">
            <div class="shape shape-1"></div>
            <div class="shape shape-2"></div>
            <div class="shape shape-3"></div>
        </div>

        <div class="booth-logo text-center mb-4">
            <div class="logo-font d-flex align-items-center justify-content-center logo-icon-gap cursor-default">
                <i class="ph ph-camera"></i> Momentum
            </div>
        </div>

        @yield('content')
    </div>

    <div data-island="GlobalApp" style="display:none"></div>
    @yield('scripts')

</body>
</html>
