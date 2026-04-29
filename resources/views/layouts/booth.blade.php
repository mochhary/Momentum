<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title') - Momentum Booth</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/@phosphor-icons/web"></script>
    <link rel="stylesheet" href="{{ asset('css/main.css') }}">
    <link rel="stylesheet" href="{{ asset('css/booth.css') }}">
    @yield('styles')
    <style>
        /* Idle Timeout Modal Styles */
        #idleModal {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(15, 23, 42, 0.6);
            backdrop-filter: blur(15px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            opacity: 0;
            pointer-events: none;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        #idleModal.is-active { opacity: 1; pointer-events: auto; }
        .idle-content {
            background: white;
            padding: 40px;
            border-radius: 32px;
            text-align: center;
            max-width: 450px;
            width: 90%;
            box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
            transform: translateY(20px);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        #idleModal.is-active .idle-content { transform: translateY(0); }
        .idle-icon {
            font-size: 4rem;
            color: var(--warning);
            margin-bottom: 20px;
            animation: pulse 2s infinite;
        }
        .idle-timer-circle {
            font-size: 3rem;
            font-weight: 800;
            color: var(--primary);
            margin: 20px 0;
            font-family: 'Space Grotesk', sans-serif;
        }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
    </style>
</head>
<body class="@yield('body_class')">
    @include('partials.background')

    <nav class="navbar booth-navbar">
        <div class="container d-flex justify-content-between align-items-center">
            <a href="{{ route('booth.index') }}" class="navbar-brand">
                <i class="ph ph-camera"></i>
                <span>Momentum <small style="font-size: 0.6em; opacity: 0.7;">BOOTH</small></span>
            </a>
            <div class="booth-time" id="booth-clock">--:--</div>
        </div>
    </nav>

    <main class="main-content">
        @yield('content')
    </main>

    <!-- Idle Timeout Warning Modal -->
    <div id="idleModal">
        <div class="idle-content">
            <div class="idle-icon"><i class="ph ph-timer"></i></div>
            <h2 style="font-family:'Space Grotesk'; font-size: 1.8rem; margin-bottom: 10px;">Masih di sana?</h2>
            <p style="color: var(--text-muted);">Sesi Anda akan berakhir karena tidak ada aktivitas.</p>
            <div class="idle-timer-circle" id="idleCountdown">30</div>
            <button type="button" class="btn btn-primary btn-block" onclick="resetIdleTimerManually()" style="padding: 20px; font-size: 1.1rem;">
                Ya, Lanjutkan Sesi
            </button>
        </div>
    </div>

    <script>
        // Clock
        function updateClock() {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            const clockEl = document.getElementById('booth-clock');
            if (clockEl) clockEl.textContent = timeStr;
        }
        setInterval(updateClock, 1000);
        updateClock();

        // --- IDLE TIMEOUT LOGIC ---
        let idleTime = 0;
        let countdownTime = 30;
        let isModalActive = false;
        let countdownInterval;

        // 5 Minutes = 300 seconds. Show modal at 270s (4.5 min)
        const IDLE_LIMIT = 270; 

        function resetIdleTimer() {
            if (isModalActive) return; // Don't reset if modal is already warning
            idleTime = 0;
        }

        // Activities that reset the timer
        window.onload = resetIdleTimer;
        window.onmousemove = resetIdleTimer;
        window.onmousedown = resetIdleTimer;
        window.ontouchstart = resetIdleTimer;
        window.onclick = resetIdleTimer;
        window.onkeypress = resetIdleTimer;

        // Check idle time every second
        setInterval(function() {
            if (isModalActive) return;

            idleTime++;
            if (idleTime >= IDLE_LIMIT) {
                showIdleWarning();
            }
        }, 1000);

        function showIdleWarning() {
            isModalActive = true;
            countdownTime = 30;
            document.getElementById('idleCountdown').textContent = countdownTime;
            document.getElementById('idleModal').classList.add('is-active');

            countdownInterval = setInterval(function() {
                countdownTime--;
                document.getElementById('idleCountdown').textContent = countdownTime;

                if (countdownTime <= 0) {
                    clearInterval(countdownInterval);
                    window.location.href = "{{ route('booth.index') }}";
                }
            }, 1000);
        }

        function resetIdleTimerManually() {
            clearInterval(countdownInterval);
            isModalActive = false;
            idleTime = 0;
            document.getElementById('idleModal').classList.remove('is-active');
        }
    </script>
    @yield('scripts')
    <script src="{{ asset('js/app.js') }}"></script>
</body>
</html>
