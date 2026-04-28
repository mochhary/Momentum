@extends('layouts.app')
@section('title', 'Upload Foto - Photobooth Studio')

@section('styles')
    <link rel="stylesheet" href="{{ asset('css/upload.css') }}">
@endsection

@section('content')
<div class="upload-layout">

    <form action="{{ route('upload.store') }}" method="POST" id="uploadForm" class="upload-form">
        @csrf
        <input type="hidden" name="frame_type" value="{{ $frame->id }}">
        <input type="hidden" name="final_photo" id="finalPhotoInput">

        <div class="mobile-header">
            <div style="margin-bottom: 24px; text-align: left;">
                <a href="{{ route('frame.select') }}" class="text-primary" style="text-decoration: none; font-size: 0.95rem; font-weight: 700;">
                    <i class="ph ph-arrow-left"></i> Pilih Frame Lain
                </a>
            </div>
            <h1><i class="ph ph-camera"></i> Buat Foto</h1>
            <div class="badge badge-primary" style="margin-top: 8px;">{{ $frame->name }}</div>
        </div>

        <div class="upload-sidebar">
            <div class="desktop-header">
                <h1 style="margin-bottom: 8px;"><i class="ph ph-camera"></i> Buat Foto</h1>
                <div class="badge badge-primary" style="margin-bottom: 32px;">{{ $frame->name }}</div>
            </div>

            <div class="card">
                <h3 style="margin-bottom: 20px;"><i class="ph ph-user"></i> Data Customer</h3>
                <div class="form-group">
                    <label class="form-label">Nama Lengkap</label>
                    <input type="text" name="customer_name" id="customer_name" class="form-input" placeholder="Masukkan nama" value="{{ old('customer_name') }}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Email</label>
                    <input type="email" name="customer_email" id="customer_email" class="form-input" placeholder="email@contoh.com" value="{{ old('customer_email') }}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">No. HP</label>
                    <input type="tel" name="customer_phone" id="customer_phone" class="form-input" placeholder="08xxxxxxxxxx" value="{{ old('customer_phone') }}" required>
                </div>
                
                <button type="button" class="btn btn-primary btn-block" id="generateBtn" onclick="generateAndSubmit()" style="margin-top: 10px;">
                    <i class="ph ph-check-circle"></i> Selesai & Bayar
                </button>
            </div>
            <div class="desktop-header" style="text-align: left; margin-top: 24px;">
                <a href="{{ route('frame.select') }}" class="btn btn-secondary" style="text-decoration: none; font-size: 0.95rem; font-weight: 700; display: inline-flex; align-items: center; gap: 8px;">
                    <i class="ph ph-arrow-left"></i> Pilih Frame Lain
                </a>
            </div>
        </div>

        <div class="upload-workspace">
            <div style="width: 100%; display: flex; flex-direction: column; align-items: center;">
                <div class="badge badge-cream" style="margin-bottom: 32px; font-size: 0.9rem; padding: 12px 24px;">
                    <i class="ph ph-info"></i> Upload foto di setiap slot, lalu geser/zoom untuk menyesuaikan.
                </div>
                
                <div id="editorWrapper" class="editor-wrapper" style="position: relative; background: #f8fafc; border-radius: 8px;">
                    <!-- Skeleton Loader for Frame -->
                    <div id="frameSkeleton" style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; z-index: 1;">
                        <div class="spinner-sm"></div>
                    </div>
                    <img src="/storage/{{ $frame->image }}" class="frame-bg" id="frameBg" crossorigin="anonymous" fetchpriority="high" loading="eager" onload="document.getElementById('frameSkeleton').style.display='none'">
                    <div id="slotsContainer"></div>
                </div>

                <div class="editor-controls" id="editorControls" style="display: none;">
                    <div class="control-actions">
                        <button type="button" class="ctrl-btn" onclick="rotateActiveSlot(-90)" title="Putar Kiri"><i class="ph ph-arrow-u-up-left"></i></button>
                        <button type="button" class="ctrl-btn" onclick="rotateActiveSlot(90)" title="Putar Kanan"><i class="ph ph-arrow-u-up-right"></i></button>
                        <button type="button" class="ctrl-btn" onclick="flipActiveSlot()" title="Cermin"><i class="ph ph-arrows-left-right"></i></button>
                        <button type="button" class="ctrl-btn btn-delete" onclick="deleteActiveSlot()" title="Hapus"><i class="ph ph-trash"></i></button>
                    </div>
                    
                    <div class="control-sliders">
                        <div class="slider-item">
                            <span class="slider-label"><i class="ph ph-magnifying-glass-plus"></i> Ukuran</span>
                            <input type="range" id="scaleSlider" class="ctrl-slider" min="0.1" max="3" step="0.01" value="1" oninput="updateScale(this.value)">
                        </div>

                        <div class="slider-item">
                            <span class="slider-label"><i class="ph ph-arrows-counter-clockwise"></i> Putar</span>
                            <input type="range" id="rotateSlider" class="ctrl-slider" min="-180" max="180" step="1" value="0" oninput="updateRotation(this.value)">
                        </div>

                        <div class="slider-item">
                            <span class="slider-label"><i class="ph ph-sun"></i> Cahaya</span>
                            <input type="range" id="brightnessSlider" class="ctrl-slider" min="50" max="150" step="1" value="100" oninput="updateBrightness(this.value)">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </form>
    
    <!-- Hidden file inputs -->
    <div id="fileInputsContainer" style="display: none;"></div>
</div>

<!-- Loading Overlay -->
<div id="loadingOverlay" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255,255,255,0.95); backdrop-filter: blur(8px); z-index: 9999; flex-direction: column; align-items: center; justify-content: center; color: var(--text-head);">
    <div id="loadingSpinner" style="width: 64px; height: 64px; border: 4px solid var(--primary-light); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 24px;"></div>
    <h2 id="loadingTitle">Memproses Foto...</h2>
    <p id="loadingDesc" style="color: var(--text-muted); margin-top: 8px;">Mohon tunggu sebentar, kami sedang menyiapkan mahakarya Anda.</p>
    
    <div id="progressContainer" style="display: none; width: 100%; max-width: 400px; margin-top: 40px; padding: 0 20px;">
        <div style="background: var(--border); border-radius: 20px; height: 12px; overflow: hidden; margin-bottom: 16px;">
            <div id="progressBar" style="width: 0%; height: 100%; background: var(--primary); transition: width 0.1s; border-radius: 20px;"></div>
        </div>
        <div style="display: flex; justify-content: space-between; font-weight: 700;">
            <span style="color: var(--primary);">Mengunggah...</span>
            <span id="progressText">0%</span>
        </div>
        <button id="cancelUploadBtn" type="button" onclick="cancelUpload()" class="btn btn-secondary" style="margin-top: 32px; width: 100%; color: var(--error); border-color: var(--error);">Batalkan Upload</button>
    </div>
    <div
        data-island="UploadEditor"
        data-props="{{ json_encode([
            'layoutConfig' => $frameConfig ? $frameConfig : [],
            'frameImgUrl' => '/storage/' . $frame->image,
        ]) }}"
        style="display:none"
    ></div>
</div>
@endsection

@section('scripts')
<script src="https://daybrush.com/moveable/release/latest/dist/moveable.min.js"></script>
@endsection
