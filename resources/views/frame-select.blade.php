@extends('layouts.app')
@section('title', 'Pilih Frame - Photobooth Studio')

@section('content')
<div class="frame-page container animate-in">
    <div class="frame-header">
        <h1><i class="ph ph-frames"></i> Pilih Template Frame</h1>
        <p>Temukan desain yang paling sesuai dengan momen Anda hari ini</p>
    </div>

    <div class="frame-grid">
        @foreach($frames as $frame)
        @php
            $config = is_string($frame->layout_config) ? json_decode($frame->layout_config, true) : ($frame->layout_config ?? []);
            $slotsCount = count($config ?? []);
        @endphp
        <a href="{{ route('upload.form', $frame->id) }}" class="frame-card">
            <div class="frame-img-box">
                <img src="{{ asset('storage/' . $frame->image) }}" class="frame-img" alt="{{ $frame->name }}" crossorigin="anonymous">
            </div>
            <div class="frame-name">{{ $frame->name }}</div>
            <span class="frame-slots">
                <i class="ph ph-camera"></i> {{ $slotsCount }} Foto
            </span>
        </a>
        @endforeach
        
        @if($frames->isEmpty())
        <div class="empty-state">
            <i class="ph ph-image-broken empty-icon"></i>
            <h3>Belum Ada Frame</h3>
            <p style="color: var(--text-muted); font-size: 1.1rem;">Maaf, saat ini belum ada pilihan frame yang tersedia.</p>
        </div>
        @endif
    </div>
</div>
@endsection
