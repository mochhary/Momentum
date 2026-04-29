@extends('layouts.booth')
@section('title', 'Pembayaran')
@section('body_class', 'payment-page')
@section('content')
<div class="card booth-card animate-in">
    <div class="booth-layout-split">
        <!-- Left Side: Order & Status -->
        <div class="booth-side-left">
            <div class="payment-info">
                <h2><i class="ph ph-credit-card"></i> Pembayaran</h2>
                <p>Order: <strong>{{ $order->order_code }}</strong></p>
            </div>

            <div class="total-amount" style="font-size: 2.5rem; margin-bottom: 20px;">Rp {{ number_format($order->total_price, 0, ',', '.') }}</div>

            <div class="payment-details" style="grid-template-columns: 1fr; margin-bottom: 20px;">
                <div class="pd-item" style="padding: 12px 16px;">
                    <div class="pd-label" style="font-size: 0.7rem;">Rincian Pesanan</div>
                    <div class="pd-value" style="font-size: 1rem;">
                        {{ $order->print_qty }}x {!! $order->print_mode === 'color' ? 'Berwarna' : 'Hitam Putih' !!}
                    </div>
                </div>
            </div>

            <div class="status-checking" style="padding: 15px; background: white; border-radius: var(--radius-md); border: 1px solid var(--border); font-size: 1rem;">
                <i class="ph ph-spinner ph-spin"></i> Menunggu Pembayaran...
            </div>

            <div class="countdown" id="countdown" style="margin-top: 15px; font-size: 1rem;">
                @if($order->expired_at)
                    <i class="ph ph-timer"></i> <span id="timer">--:--</span>
                @endif
            </div>

            <!-- Batalkan & Ubah Pengaturan (Small Link Button) -->
            <div style="margin-top: auto; padding-top: 20px; text-align: center;">
                <a href="{{ route('booth.settings', $order->order_code) }}" style="color: var(--text-muted); font-size: 0.85rem; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 8px; opacity: 0.7;">
                    <i class="ph ph-arrow-left"></i> Batalkan & Ubah Pengaturan
                </a>
            </div>
        </div>

        <!-- Right Side: QR Code -->
        <div class="booth-side-right">
            @if($order->qr_code_url)
            <div class="qr-container" style="margin-bottom: 10px; padding: 15px; cursor: pointer;" onclick="copyQRUrl('{{ $order->qr_code_url }}')" title="Klik untuk salin URL">
                <img src="{{ $order->qr_code_url }}" id="payment-qr" class="payment-qr-img" alt="QR Code" draggable="true">
                <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 10px;">
                    <i class="ph ph-copy"></i> Klik gambar untuk salin URL
                </div>
            </div>
            @else
            <div class="qr-container" style="padding: 40px;"><div style="color: var(--text-muted);">QR Code Error</div></div>
            @endif
            
            <div class="scan-hint" style="margin-bottom: 0; padding: 15px; font-size: 0.9rem; width: 100%;">
                <i class="ph ph-qr-code"></i> Scan QR dengan E-Wallet / Bank
            </div>

            @if(session('midtrans_error') || str_starts_with($order->midtrans_order_id, 'DEMO-'))
            <div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: var(--radius-sm); padding: 12px; margin-top: 15px; font-size: 0.85rem; width: 100%;">
                <form action="{{ route('midtrans.notification') }}" method="POST">
                    @csrf
                    <input type="hidden" name="order_id" value="{{ $order->midtrans_order_id }}">
                    <input type="hidden" name="transaction_status" value="settlement">
                    <button type="submit" class="btn btn-primary btn-block" style="background: #f59e0b; border: none; padding: 10px;">
                        Simulasi Bayar Berhasil
                    </button>
                </form>
            </div>
            @endif
        </div>
    </div>
    <div
        data-island="BoothPayment"
        data-props="{{ json_encode([
            'expiredAtIso' => $order->expired_at ? $order->expired_at->toISOString() : '',
            'statusUrl' => route('booth.status', $order->order_code),
        ]) }}"
        style="display:none"
    ></div>
</div>
@endsection
