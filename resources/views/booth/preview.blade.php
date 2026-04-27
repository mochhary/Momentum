@extends('layouts.booth')
@section('title', 'Preview Foto - Booth Cetak')

@section('content')
<div class="card booth-card animate-in">
    <div class="booth-layout-split">
        <!-- Left Side: Info & Controls -->
        <div class="booth-side-left">
            <div class="preview-header">
                <h2><i class="ph ph-image-square"></i> Preview Foto</h2>
                <p>Order: <strong>{{ $order->order_code }}</strong></p>
                <p style="color: var(--text-muted); font-size: 0.9rem;">Frame: {{ \App\Models\Order::FRAMES[$order->frame_type]['name'] ?? $order->frame_type }}</p>
            </div>

            <div class="customer-info-box">
                <div style="font-size: 2.2rem; color: var(--primary);"><i class="ph ph-user-circle"></i></div>
                <div>
                    <strong style="display: block; font-size: 1.2rem; color: var(--text-head);">{{ $order->customer_name }}</strong>
                    <span style="color: var(--text-muted); font-size: 0.95rem;">{{ $order->customer_email }}</span>
                </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 16px; margin-top: auto;">
                <a href="{{ route('booth.settings', $order->order_code) }}" class="btn btn-primary" style="padding: 24px; font-size: 1.3rem;">
                    Lanjut ke Cetak <i class="ph ph-arrow-right"></i>
                </a>
                <a href="{{ route('booth.index') }}" class="btn btn-secondary" style="padding: 16px; font-size: 1rem;">
                    <i class="ph ph-arrow-left"></i> Kembali
                </a>
            </div>
        </div>

        <!-- Right Side: Preview -->
        <div class="booth-side-right">
            <div class="preview-card">
                @foreach($order->photos as $photo)
                    <div class="preview-item">
                        <img src="{{ asset('storage/' . $photo->photo_path) }}" alt="{{ $photo->original_name }}">
                    </div>
                @endforeach
            </div>
        </div>
    </div>
</div>
@endsection
