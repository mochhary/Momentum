@extends('layouts.booth')
@section('title', 'Pengaturan')

@section('styles')
    <link rel="stylesheet" href="{{ asset('css/booth-settings.css') }}">
@endsection

@section('content')
<div class="card booth-card animate-in">
    <form action="{{ route('booth.payment', $order->order_code) }}" method="POST" id="settingsForm">
        @csrf
        <div class="booth-layout-split">
            <!-- Left Side: Controls -->
            <div class="booth-side-left">
                <div class="settings-header">
                    <h2><i class="ph ph-gear"></i> Pengaturan Cetak</h2>
                    <p>Order: <strong>{{ $order->order_code }}</strong></p>
                </div>

                <input type="hidden" name="print_mode" id="printMode" value="color">
                <input type="hidden" name="print_qty" id="printQty" value="1">

                <div class="qty-section">
                    <div class="qty-label">Jumlah Salinan</div>
                    <div class="qty-control">
                        <button type="button" class="qty-btn" onclick="changeQty(-1)"><i class="ph ph-minus"></i></button>
                        <div class="qty-value" id="qtyDisplay">1</div>
                        <button type="button" class="qty-btn" onclick="changeQty(1)"><i class="ph ph-plus"></i></button>
                    </div>
                </div>

                <!-- Mode Selection -->
                <div class="mode-grid" style="grid-template-columns: 1fr;">
                    <div class="mode-card selected" data-mode="color" onclick="selectMode('color')" style="display: flex; align-items: center; gap: 20px; padding: 15px; text-align: left;">
                        <div class="mode-icon" style="margin:0; font-size: 2rem;"><i class="ph ph-palette"></i></div>
                        <div style="flex: 1;">
                            <div class="mode-name" style="margin:0; font-size: 1.1rem;">Berwarna</div>
                            <div class="mode-price" style="font-size: 1rem;">Rp {{ number_format($priceColor, 0, ',', '.') }}</div>
                        </div>
                    </div>
                    <div class="mode-card" data-mode="bw" onclick="selectMode('bw')" style="display: flex; align-items: center; gap: 20px; padding: 15px; text-align: left;">
                        <div class="mode-icon" style="margin:0; font-size: 2rem;"><i class="ph ph-circle-half-tilt"></i></div>
                        <div style="flex: 1;">
                            <div class="mode-name" style="margin:0; font-size: 1.1rem;">Hitam Putih</div>
                            <div class="mode-price" style="font-size: 1rem;">Rp {{ number_format($priceBw, 0, ',', '.') }}</div>
                        </div>
                    </div>
                </div>

                <div class="total-payment-box" style="padding: 15px 20px; margin-bottom: 20px;">
                    <div class="total-label" style="font-size: 0.9rem;">Total Bayar</div>
                    <div class="total-amount-display" id="totalDisplay" style="font-size: 1.8rem;">Rp {{ number_format($priceColor, 0, ',', '.') }}</div>
                </div>

                <button type="submit" class="btn btn-primary btn-block" style="padding: 20px; font-size: 1.2rem;">
                    <i class="ph ph-wallet"></i> Bayar Sekarang
                </button>
                
                <div style="text-align: center; margin-top: 12px;">
                    <a href="{{ route('booth.preview', $order->order_code) }}" class="btn btn-secondary" style="padding: 16px; font-size: 1rem; width: auto; display: inline-flex; align-items: center; gap: 8px;">
                        <i class="ph ph-arrow-left"></i> Kembali ke Preview
                    </a>
                </div>
            </div>

            <!-- Right Side: Visual Preview -->
            <div class="booth-side-right">
                <div class="preview-card" style="max-height: 70vh;">
                    <div id="modePreviewContainer" style="display: flex; flex-direction: column; gap: 10px;">
                        @foreach($order->photos as $photo)
                            <div class="preview-item">
                                <img src="{{ asset('storage/' . $photo->photo_path) }}" alt="" id="preview-img-{{ $loop->index }}">
                            </div>
                        @endforeach
                    </div>
                </div>
            </div>
        </div>
    </form>

    <div
        id="booth-settings-island"
        data-island="BoothSettings"
        data-props='@json([
            "priceColor" => $priceColor,
            "priceBw" => $priceBw,
        ])'
        style="display: none;"
    ></div>
</div>
@endsection

@section('scripts')
@endsection
