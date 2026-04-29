@extends('layouts.booth')
@section('title', 'Pengaturan Cetak')

@section('styles')
    <link rel="stylesheet" href="{{ asset('css/booth-settings.css') }}">
    <style>
        .settings-header { text-align: left; margin-bottom: 30px; }
        .settings-header h2 { margin-bottom: 10px; font-size: 1.8rem; }
        .order-meta { font-size: 1rem; line-height: 1.6; color: var(--text-body); }
        .order-meta div { margin-bottom: 4px; }
        .order-meta strong { color: var(--text-head); }

        /* Alignment Fixes */
        .qty-section { align-items: flex-start; text-align: left; }
        .total-payment-box { text-align: left; }
        
        /* Photo Preview on Right */
        .preview-container {
            display: flex;
            flex-direction: column;
            gap: 15px;
            max-height: 80vh;
            overflow-y: auto;
            padding-right: 10px;
        }
        .preview-item img {
            width: 100%;
            border-radius: 12px;
            box-shadow: var(--shadow-md);
            transition: filter 0.4s ease;
        }
        
        /* B&W Filter Effect - Applied to container */
        #previewContainer.is-bw img { 
            filter: grayscale(100%) contrast(1.1); 
        }

        /* Modal Styles */
        .modal-backdrop {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(15, 23, 42, 0.4);
            backdrop-filter: blur(12px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            opacity: 0;
            pointer-events: none;
            transition: all 0.3s ease;
        }
        .modal-backdrop.is-active { opacity: 1; pointer-events: auto; }
        .confirm-modal {
            background: white;
            width: 90%;
            max-width: 500px;
            border-radius: 24px;
            padding: 35px;
            transform: scale(0.9);
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            box-shadow: 0 30px 60px -12px rgba(0,0,0,0.3);
        }
        .modal-backdrop.is-active .confirm-modal { transform: scale(1); }
        .modal-body { margin: 25px 0; border-top: 1px dashed #e2e8f0; padding-top: 25px; text-align: left; }
        .confirm-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 1.05rem; }
        .confirm-total { 
            background: #f1f5f9; 
            padding: 20px; 
            border-radius: 16px; 
            margin-top: 20px;
            font-size: 1.3rem;
            color: var(--primary);
        }
        .btn-center-text { text-align: center; justify-content: center; width: 100%; display: flex; align-items: center; gap: 8px; }
    </style>
@endsection

@section('content')
<div class="booth-container">
    <div class="card booth-card animate-in">
        <form action="{{ route('booth.payment', $order->order_code) }}" method="POST" id="settingsForm">
            @csrf
            <div class="booth-layout-split">
                
                <!-- LEFT SIDE: Controls & Info -->
                <div class="booth-side-left">
                    <div class="settings-header">
                        <h2><i class="ph ph-sliders-horizontal"></i> Pengaturan Cetak</h2>
                        
                        <div class="order-meta">
                            <div>Order ID: <strong>{{ $order->order_code }}</strong></div>
                            <div>Nama: <strong>{{ $order->customer_name }}</strong></div>
                            <div>Email: <strong>{{ $order->customer_email }}</strong></div>
                            <div>No. HP: <strong>{{ $order->customer_phone }}</strong></div>
                        </div>
                    </div>

                    <input type="hidden" name="print_mode" id="printMode" value="color">
                    <input type="hidden" name="print_qty" id="printQty" value="1">

                    <div class="qty-section">
                        <div class="qty-label">Jumlah Salinan</div>
                        <div class="qty-control">
                            <button type="button" class="qty-btn" onclick="updateQty(-1)"><i class="ph ph-minus"></i></button>
                            <div class="qty-value" id="qtyDisplay">1</div>
                            <button type="button" class="qty-btn" onclick="updateQty(1)"><i class="ph ph-plus"></i></button>
                        </div>
                    </div>

                    <div class="mode-grid">
                        <div class="mode-card selected" id="mode-color" onclick="updateMode('color')">
                            <div class="mode-icon"><i class="ph ph-palette"></i></div>
                            <div class="mode-name">Berwarna</div>
                            <div class="mode-price">Rp {{ number_format($priceColor, 0, ',', '.') }}</div>
                        </div>
                        <div class="mode-card" id="mode-bw" onclick="updateMode('bw')">
                            <div class="mode-icon"><i class="ph ph-circle-half-tilt"></i></div>
                            <div class="mode-name">Hitam Putih</div>
                            <div class="mode-price">Rp {{ number_format($priceBw, 0, ',', '.') }}</div>
                        </div>
                    </div>

                    <div class="total-payment-box">
                        <div class="total-label">Total Pembayaran</div>
                        <div class="total-amount-display" id="totalDisplay">Rp {{ number_format($priceColor, 0, ',', '.') }}</div>
                    </div>

                    <button type="button" class="btn btn-primary btn-block btn-center-text" onclick="showConfirmModal()" style="padding: 22px; font-size: 1.2rem;">
                        <i class="ph ph-wallet"></i> Bayar Sekarang
                    </button>

                    <!-- Back Button Restored -->
                    <div style="margin-top: 15px; text-align: left;">
                        <a href="{{ route('booth.index') }}" class="btn btn-secondary btn-center-text" style="padding: 15px; font-size: 1rem;">
                            <i class="ph ph-arrow-left"></i> Kembali ke Input Kode
                        </a>
                    </div>
                </div>

                <!-- RIGHT SIDE: Photo Preview -->
                <div class="booth-side-right">
                    <div class="preview-container" id="previewContainer">
                        @foreach($order->photos as $photo)
                            <div class="preview-item">
                                <img src="{{ asset('storage/' . $photo->photo_path) }}" alt="Preview Photo">
                            </div>
                        @endforeach
                    </div>
                </div>

            </div>
        </form>
    </div>
</div>

<!-- Modal Konfirmasi -->
<div class="modal-backdrop" id="confirmModal">
    <div class="confirm-modal">
        <div class="modal-header" style="text-align: center;">
            <h2 style="margin:0; font-family:'Space Grotesk'; font-size: 1.8rem;">Konfirmasi Cetak</h2>
            <p style="color:var(--text-muted);">Pastikan pesanan sudah sesuai</p>
        </div>
        <div class="modal-body">
            <div class="confirm-row"><span>Nama</span> <span style="font-weight:700;">{{ $order->customer_name }}</span></div>
            <div class="confirm-row"><span>Mode</span> <span style="font-weight:700;" id="modalModeText">Berwarna</span></div>
            <div class="confirm-row"><span>Jumlah</span> <span style="font-weight:700;" id="modalQtyText">1 lembar</span></div>
            
            <div class="confirm-row confirm-total">
                <span style="font-weight:600; color:#1e293b;">Total Bayar</span> 
                <span style="font-weight:800; font-size: 1.5rem;" id="modalTotalText">Rp 0</span>
            </div>
        </div>
        <div class="d-flex gap-3">
            <button type="button" class="btn btn-secondary flex-1 btn-center-text" onclick="closeConfirmModal()" style="padding: 15px;">Batal</button>
            <button type="button" class="btn btn-primary flex-1 btn-center-text" onclick="submitFinalOrder()" style="padding: 15px;">Konfirmasi</button>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script>
    let currentMode = 'color';
    let currentQty = 1;
    const priceColor = {{ $priceColor }};
    const priceBw = {{ $priceBw }};

    function updateMode(mode) {
        currentMode = mode;
        document.getElementById('printMode').value = mode;
        
        // Update Cards UI
        document.getElementById('mode-color').classList.toggle('selected', mode === 'color');
        document.getElementById('mode-bw').classList.toggle('selected', mode === 'bw');
        
        // Apply B&W Filter to Preview
        const preview = document.getElementById('previewContainer');
        if (mode === 'bw') {
            preview.classList.add('is-bw');
        } else {
            preview.classList.remove('is-bw');
        }
        
        calculateTotal();
    }

    function updateQty(delta) {
        currentQty = Math.min(10, Math.max(1, currentQty + delta));
        document.getElementById('printQty').value = currentQty;
        document.getElementById('qtyDisplay').textContent = currentQty;
        calculateTotal();
    }

    function calculateTotal() {
        const price = currentMode === 'color' ? priceColor : priceBw;
        const total = price * currentQty;
        const formatted = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(total).replace('IDR', 'Rp');
        document.getElementById('totalDisplay').textContent = formatted;
    }

    function showConfirmModal() {
        document.getElementById('modalModeText').textContent = currentMode === 'color' ? 'Berwarna' : 'Hitam Putih';
        document.getElementById('modalQtyText').textContent = currentQty + ' lembar';
        document.getElementById('modalTotalText').textContent = document.getElementById('totalDisplay').textContent;
        document.getElementById('confirmModal').classList.add('is-active');
    }

    function closeConfirmModal() {
        document.getElementById('confirmModal').classList.remove('is-active');
    }

    function submitFinalOrder() {
        document.getElementById('settingsForm').submit();
    }
</script>
@endsection
