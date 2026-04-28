@extends('layouts.app')
@section('title', 'Momentum')

@section('styles')
<style>
    .hero {
        min-height: calc(100vh - 80px); display: flex; align-items: center; justify-content: center;
        text-align: center; position: relative; overflow: hidden;
    }
    .hero::before {
        content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
        background: radial-gradient(circle at 20% 50%, rgba(139,92,246,0.12) 0%, transparent 50%),
                    radial-gradient(circle at 80% 50%, rgba(6,182,212,0.08) 0%, transparent 50%),
                    radial-gradient(circle at 50% 80%, rgba(236,72,153,0.06) 0%, transparent 50%);
        animation: bgRotate 40s linear infinite; z-index: -1;
    }
    @keyframes bgRotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .hero-content { max-width: 700px; padding: 40px 24px; }
    .hero-icon { font-size: 4rem; margin-bottom: 24px; animation: float 3s ease-in-out infinite; }
    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
    .hero-title {
        font-family: 'Outfit', sans-serif; font-size: 3.5rem; font-weight: 800; line-height: 1.1;
        margin-bottom: 20px; background: linear-gradient(135deg, #f8fafc, #6366f1, #38bdf8);
        -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        letter-spacing: -2px;
    }
    .hero-desc { font-size: 1.15rem; color: var(--text-secondary); margin-bottom: 40px; line-height: 1.7; }
    .steps {
        display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px; margin-top: 80px; padding-bottom: 60px;
    }
    .step { text-align: center; padding: 32px 20px; animation: fadeInUp 0.6s ease forwards; opacity: 0; }
    .step:nth-child(1) { animation-delay: 0.1s; }
    .step:nth-child(2) { animation-delay: 0.2s; }
    .step:nth-child(3) { animation-delay: 0.3s; }
    .step:nth-child(4) { animation-delay: 0.4s; }
    .step-icon {
        width: 64px; height: 64px; border-radius: 16px; background: var(--gradient-primary);
        display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin: 0 auto 16px;
    }
    .step-title { font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 600; margin-bottom: 8px; font-size: 1.05rem; }
    .step-desc { font-size: 0.85rem; color: var(--text-muted); }
    @media (max-width: 768px) { .hero-title { font-size: 2.2rem; } .hero-desc { font-size: 1rem; } }
</style>
@endsection

@section('content')
<section class="hero">
    <div class="hero-content">
        <div class="hero-icon">📸</div>
        <h1 class="hero-title animate-in">Momentum</h1>
        <p class="hero-desc animate-in animate-delay-1">
            Pilih frame favorit, upload foto, dapatkan kode, lalu cetak di booth kami dengan kualitas premium.
        </p>
        <a href="{{ route('frame.select') }}" class="btn btn-primary btn-lg animate-in animate-delay-2">
            🖼️ Pilih Frame & Upload Foto
        </a>
    </div>
</section>

<section class="container">
    <div class="steps">
        <div class="step card">
            <div class="step-icon">🖼️</div>
            <div class="step-title">1. Pilih Frame</div>
            <div class="step-desc">Pilih template frame yang Anda suka</div>
        </div>
        <div class="step card">
            <div class="step-icon">📸</div>
            <div class="step-title">2. Upload Foto</div>
            <div class="step-desc">Masukkan foto ke slot-slot dalam frame</div>
        </div>
        <div class="step card">
            <div class="step-icon">🔑</div>
            <div class="step-title">3. Dapat Kode</div>
            <div class="step-desc">Dapatkan kode order untuk booth cetak</div>
        </div>
        <div class="step card">
            <div class="step-icon">🖨️</div>
            <div class="step-title">4. Cetak di Booth</div>
            <div class="step-desc">Masukkan kode, pilih setting, bayar & cetak!</div>
        </div>
    </div>
</section>
@endsection
