<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Momentum - Upload foto dan cetak di booth kami">
    <title>Momentum @hasSection('title') - @yield('title') @endif</title>
    <link rel="icon" type="image/png" href="{{ asset('images/favicon.png') }}?v=2">
    <link rel="shortcut icon" href="{{ asset('images/favicon.png') }}?v=2" type="image/png">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/@phosphor-icons/web"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/hammer.js/2.0.8/hammer.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    <link rel="stylesheet" href="{{ asset('css/main.css') }}">
    <link rel="stylesheet" href="{{ asset('css/customer.css') }}">
    @vite(['resources/js/app.js'])
    @yield('styles')
</head>
<body>
    <nav class="navbar">
        <a href="{{ route('frame.select') }}" class="navbar-brand">
            <img src="{{ asset('images/logo.png') }}" alt="Momentum" 
                 width="200" height="85"
                 style="height: 85px; width: auto; object-fit: contain;" 
                 fetchpriority="high" loading="eager" decoding="async">
        </a>
    </nav>

    <main class="main-content">
        @yield('content')
    </main>

    <div data-island="GlobalApp" style="display:none"></div>
    @yield('scripts')

</body>
</html>
