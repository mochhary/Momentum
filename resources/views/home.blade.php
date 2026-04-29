@extends('layouts.app')

@section('title', 'Momentum - Capture Your Joy')

@section('styles')
    <link rel="stylesheet" href="{{ asset('css/home.css') }}">
    <style>
        /* Optimasi Render */
        html { scroll-behavior: auto !important; overscroll-behavior-y: none; }
        .navbar { display: none !important; }
        .main-content { padding-top: 0 !important; }

        .gallery-section, .footer-premium { content-visibility: auto; contain-intrinsic-size: 1000px; }
        .horizontal-scroll-section { contain: layout style; }

        /* Logo Momentum */
        .home-center-logo {
            position: fixed;
            top: 50px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 3000;
            pointer-events: none;
            will-change: transform;
        }

        .home-center-logo img {
            height: 120px;
            width: auto;
            filter: drop-shadow(0 10px 20px rgba(0,0,0,0.1));
            animation: bobbing 3s ease-in-out infinite;
        }

        .home-center-logo.is-cornered {
            top: 25px;
            left: calc(100% - 100px);
            transform: translateX(0);
            transition: all 0.6s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .home-center-logo.is-cornered img { height: 60px; }

        @keyframes bobbing {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-15px); }
        }

        /* Hero Slide */
        .hero-slide {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            min-width: 100vw;
            height: 100vh;
        }

        .hero-title {
            font-size: 5rem;
            font-weight: 800;
            color: var(--primary);
            margin-bottom: 15px;
            font-family: 'Space Grotesk', sans-serif;
        }

        /* Scroll Guide (Floating above CTA) */
        .cta-scroll-guide {
            position: absolute;
            bottom: 120%; /* Tepat di atas tombol CTA */
            left: 0;
            right: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 5px;
            color: var(--primary);
            text-transform: uppercase;
            font-size: 0.8rem;
            font-weight: 700;
            letter-spacing: 1px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.05);
            animation: guideFloat 2s infinite ease-in-out;
            pointer-events: none;
        }

        @keyframes guideFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
        }

        /* Treasure Path (DI BELAKANG KONTEN) */
        .treasure-map-svg {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1; /* Di bawah .step-slide */
            pointer-events: none;
            overflow: visible;
        }

        .treasure-path {
            fill: none;
            stroke: #FFD27D;
            stroke-width: 6;
            stroke-dasharray: 10, 18;
            stroke-linecap: round;
            stroke-opacity: 0.6; /* Dibuat sedikit lebih soft */
        }

        .step-slide {
            position: relative;
            z-index: 2; /* Di atas garis harta karun */
        }

        @media (max-width: 768px) {
            .hero-title { font-size: 3rem; }
            .home-center-logo img { height: 80px; }
        }
    </style>
@endsection

@section('content')
<!-- Logo Momentum -->
<div class="home-center-logo" id="main-logo">
    <img src="{{ asset('images/logo.png') }}" alt="Momentum" fetchpriority="high">
</div>

<!-- Floating CTA Container with Scroll Guide -->
<div class="floating-cta-container">
    <div class="cta-scroll-guide" id="cta-guide">
        <span>Scroll untuk memulai</span>
        <i class="ph-bold ph-caret-double-down"></i>
    </div>
    <a href="{{ route('frame.select') }}" class="btn-floating-cta">
        <i class="ph-fill ph-rocket-launch"></i> Mulai Cetak Sekarang!
    </a>
</div>

<!-- Main Section -->
<section class="horizontal-scroll-section">
    <div class="pin-panel-container">
        <!-- SVG Path (Behind Content) -->
        <svg class="treasure-map-svg" viewBox="0 0 7500 1000" preserveAspectRatio="none">
            <path id="treasure-path" class="treasure-path" 
                  d="M1500,500 
                     C1750,300 2250,700 2500,500 
                     C2750,300 3250,700 3500,500 
                     C3750,300 4250,700 4500,500 
                     C4750,300 5250,700 5500,500 
                     C5750,300 6250,700 6500,500" />
        </svg>

        <!-- Intro Slide (Hero) -->
        <div class="hero-slide step-slide">
            <h1 class="hero-title">Momentum</h1>
            <p class="hero-slogan">Abadikan momen serumu dalam sekejap, dan cetak kenangan indahmu untuk selamanya.</p>
        </div>

        @php 
            $icons = ['browsers', 'cloud-arrow-up', 'key', 'map-pin', 'qr-code', 'printer'];
            $titles = ['Pilih Frame', 'Upload Foto', 'Dapatkan Kode Momentum', 'Datangi booth Momentum', 'Masukkan Kode Momentum', 'Bayar & Cetak'];
            $descs = ['Pilih frame seleramu.', 'Upload foto dari HP.', 'Simpan kode unik.', 'Datangi booth kami.', 'Ketik kode di booth.', 'Ambil cetakanmu!'];
        @endphp

        @for($i = 0; $i < 6; $i++)
        <div class="step-slide">
            <div class="step-number">0{{ $i+1 }}</div>
            <div class="step-icon"><i class="ph-fill ph-{{ $icons[$i] }}"></i></div>
            <div class="step-content">
                <h2 class="step-title">{{ $titles[$i] }}</h2>
                <p class="step-desc">{{ $descs[$i] }}</p>
            </div>
        </div>
        @endfor

        <div class="step-spacer" style="min-width: 50vw;"></div>
    </div>
</section>

<!-- Collage Gallery Section -->
<section class="gallery-section">
    <h2 class="gallery-title">Inspirasi <span>Momen</span> Seru</h2>
    <div class="collage-container">
        @for($i = 1; $i <= 10; $i++)
        <div class="collage-item item-{{ $i }}">
            <img src="{{ asset('images/mockups/mockup' . $i . '.png') }}" alt="Mockup {{ $i }}" loading="lazy">
        </div>
        @endfor
    </div>
</section>

<!-- Footer -->
<footer class="footer-premium">
    <div class="footer-grid">
        <div class="footer-about"><h3>Momentum</h3><p>Abadikan tawa dan kenangan.</p></div>
        <div class="footer-col"><h4>Lokasi</h4><ul class="footer-links"><li>Grand Indonesia</li><li>Pakuwon Mall</li><li>Paris Van Java</li></ul></div>
        <div class="footer-col"><h4>Kontak</h4><ul class="footer-links"><li>WhatsApp</li><li>Instagram</li></ul></div>
    </div>
</footer>

@endsection

@section('scripts')
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
<script>
    document.addEventListener('DOMContentLoaded', () => {
        if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
        window.scrollTo(0, 0);

        gsap.registerPlugin(ScrollTrigger);

        const slides = gsap.utils.toArray(".step-slide");
        const cta = document.querySelector(".floating-cta-container");
        const logo = document.getElementById("main-logo");
        const ctaGuide = document.getElementById("cta-guide");
        const path = document.getElementById("treasure-path");
        const pathLen = path.getTotalLength();
        
        gsap.set(path, { strokeDasharray: pathLen, strokeDashoffset: pathLen });

        // 1. Horizontal Scroll
        gsap.to(".pin-panel-container", {
            x: () => -(document.querySelector(".pin-panel-container").scrollWidth - window.innerWidth),
            ease: "none",
            scrollTrigger: {
                trigger: ".horizontal-scroll-section",
                pin: true,
                scrub: 1,
                end: () => "+=" + (window.innerWidth * 5.5),
                anticipatePin: 1,
                onUpdate: (self) => {
                    let p = (self.progress - 0.13) / (1 - 0.13);
                    p = Math.max(0, Math.min(1, p));
                    path.style.strokeDashoffset = pathLen - (pathLen * p);
                    
                    // Sembunyikan Guide di atas CTA setelah mulai scroll
                    if (self.progress > 0.05) {
                        gsap.to(ctaGuide, { opacity: 0, y: 10, duration: 0.3 });
                    } else {
                        gsap.to(ctaGuide, { opacity: 1, y: 0, duration: 0.3 });
                    }

                    if (self.progress > 0.8) {
                        logo.classList.add('is-cornered');
                        cta.classList.add('is-visible');
                    } else {
                        logo.classList.remove('is-cornered');
                        // Di awal-awal pastikan CTA terlihat (jika diinginkan muncul di awal)
                        // Namun karena kita taruh guide disitu, biarkan is-visible diatur manual
                    }
                }
            }
        });

        // Pastikan CTA Visible di awal agar Guide-nya terlihat
        cta.classList.add('is-visible');

        // 2. Mockup Animation
        gsap.from(".collage-item", {
            scrollTrigger: {
                trigger: ".gallery-section",
                start: "top 90%",
                toggleActions: "play none none none"
            },
            y: 80,
            opacity: 0,
            scale: 0.9,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
            force3D: true,
            clearProps: "all"
        });

        // CTA Visibility Logic for Bottom
        ScrollTrigger.create({
            trigger: "body",
            start: "bottom bottom",
            onEnter: () => cta.classList.remove('is-visible'),
            onLeaveBack: () => cta.classList.add('is-visible')
        });

        ScrollTrigger.refresh();
    });
</script>
@endsection
