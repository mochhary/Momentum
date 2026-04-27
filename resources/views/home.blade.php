@extends('layouts.app')
@section('title', 'Momentum - Professional Photobooth Kiosk')

@section('styles')
    <link rel="stylesheet" href="{{ asset('css/home.css') }}">
@endsection

@section('content')
<section class="landing-hero">
    <div class="hero-content animate-in">
        <div class="hero-logo"><i class="ph ph-camera"></i> Momentum</div>
        <h1 class="hero-title">Abadikan Setiap <span>Momen</span> Berharga.</h1>
        <p class="hero-desc">
            Solusi photobooth digital modern. Upload foto dari smartphone Anda, pilih frame eksklusif, dan cetak langsung di booth kami.
        </p>
        
        <div class="cta-group">
            <a href="{{ route('frame.select') }}" class="btn-hero btn-hero-primary">
                <i class="ph ph-upload-simple"></i> Mulai Upload Foto
            </a>
            <a href="{{ route('booth.index') }}" class="btn-hero btn-hero-secondary">
                <i class="ph ph-monitor"></i> Ke Layar Booth
            </a>
        </div>

        <div class="floating-photos">
            <div class="photo-card" style="--rot: -5deg; --delay: 0.1s">
                <div class="photo-placeholder"><i class="ph ph-image"></i></div>
            </div>
            <div class="photo-card" style="--rot: 2deg; --delay: 0.2s">
                <div class="photo-placeholder"><i class="ph ph-heart"></i></div>
            </div>
            <div class="photo-card" style="--rot: -3deg; --delay: 0.3s">
                <div class="photo-placeholder"><i class="ph ph-star"></i></div>
            </div>
        </div>
    </div>

    <div style="position: absolute; bottom: 40px; width: 100%; text-align: center; color: var(--text-muted); font-size: 0.9rem; font-weight: 600;">
        <p>&copy; {{ date('Y') }} Momentum Studio. All rights reserved.</p>
    </div>
</section>
@endsection

