<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Momentum @hasSection('title') - @yield('title') @endif</title>
    <link rel="icon" type="image/png" href="{{ asset('images/favicon.png') }}?v=2">
    <link rel="shortcut icon" href="{{ asset('images/favicon.png') }}?v=2" type="image/png">
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

        <div class="booth-logo text-center" style="margin-bottom: 20px;">
            <img src="{{ asset('images/logo.png') }}" alt="Momentum" 
                 width="400" height="160"
                 style="height: 160px; width: auto; object-fit: contain;" 
                 fetchpriority="high" loading="eager" decoding="async">
        </div>

        @yield('content')
    </div>

    <div data-island="GlobalApp" style="display:none"></div>
    @yield('scripts')

</body>
</html>
