@extends('layouts.app')

@section('title', $code . ' - ' . ($code == 404 ? 'Tidak Ditemukan' : 'Kesalahan Sistem'))

@section('content')
<div class="error-layout">
    <div class="error-card animate-in">
        <div class="error-code">{{ $code }}</div>
        
        <h1 class="error-title">
            @if($code == 404)
                Halaman Tidak Ditemukan
            @elseif($code == 403)
                Akses Terbatas
            @else
                Kesalahan Server Internal
            @endif
        </h1>
        
        <p class="error-desc">
            @if($code == 404)
                Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.
            @elseif($code == 403)
                Anda tidak memiliki izin untuk mengakses bagian ini.
            @else
                Terjadi kendala teknis pada server kami. Jangan khawatir, tim kami sudah mendapat laporan otomatis dan sedang menanganinya.
            @endif
        </p>

        @if(isset($detailMessage) && $detailMessage)
            <script>
                console.error("Momentum Error [{{ $code }}]: {{ addslashes($detailMessage) }}");
            </script>
        @endif
        
        @php
            $currentUrl = request()->fullUrl();
            $isBooth = request()->is('booth*') || str_contains($currentUrl, '/booth');
            $isAdmin = request()->is('dashboard*') || str_contains($currentUrl, '/dashboard') || str_contains($currentUrl, 'login-operator-booth');
            
            $boothToken = env('BOOTH_SECRET_TOKEN', 'KioskMomentum2K26');
            
            if ($isBooth) {
                $homeUrl = url('/booth?token=' . $boothToken);
                $homeLabel = 'Mulai Ulang Booth';
            } elseif ($isAdmin) {
                $homeUrl = url('/dashboard');
                $homeLabel = 'Ke Dashboard';
            } else {
                $homeUrl = url('/');
                $homeLabel = 'Beranda';
            }
        @endphp
        
        <div style="display: flex; gap: 16px; justify-content: center;">
            <a href="javascript:history.back()" class="btn btn-secondary">
                <i class="ph ph-arrow-left"></i> Kembali
            </a>
            <a href="{{ $homeUrl }}" class="btn btn-primary">
                <i class="ph ph-house"></i> {{ $homeLabel }}
            </a>
        </div>
    </div>
</div>
@endsection
