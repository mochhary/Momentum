@extends('layouts.app')
@section('title', 'Manajemen Frame - Photobooth Studio')

@section('styles')
    <link rel="stylesheet" href="{{ asset('css/frames.css') }}">
@endsection

@section('content')
<div class="frame-manager-page container">
    <div class="admin-header animate-in">
        <div style="display: flex; align-items: center; gap: 20px;">
            <h1 style="font-size: 2.2rem;"><i class="ph ph-image-square"></i> Koleksi Frame</h1>
            <a href="{{ route('admin.index') }}" class="btn btn-secondary" style="padding: 10px 20px; font-size: 0.9rem;">
                <i class="ph ph-arrow-left"></i> Kembali ke Dashboard
            </a>
        </div>
    </div>

    <div class="editor-section animate-in">
        <h3 style="margin-bottom: 30px; font-size: 1.5rem;" id="formTitle">Tambah Frame Baru</h3>
        
        <form action="{{ route('admin.frames.store') }}" method="POST" enctype="multipart/form-data" id="frameForm">
            @csrf
            <div id="methodField"></div>
            <input type="hidden" name="layout_config" id="layoutConfigInput">
            
            <div id="step1">
                <div class="form-group">
                    <label class="form-label">Tipe Orientasi</label>
                    <div style="display: flex; gap: 20px;">
                        <button type="button" class="orientation-btn active" data-orient="vertical" onclick="debugSetOrient('vertical')">
                            <i class="ph ph-device-mobile"></i> Vertikal (Portrait)
                        </button>
                        <button type="button" class="orientation-btn" data-orient="horizontal" onclick="debugSetOrient('horizontal')">
                            <i class="ph ph-rectangle"></i> Horizontal (Landscape)
                        </button>
                    </div>
                    <p id="orientationNotice" style="font-size: 0.8rem; color: var(--primary); margin-top: 10px; font-weight: 600;">
                        <i class="ph ph-info"></i> Perhatian: Pastikan file desain yang diupload adalah <b>Portrait/Vertikal</b>.
                    </p>
                </div>

                <div class="form-group">
                    <label class="form-label">Nama Frame</label>
                    <input type="text" name="name" class="form-input" placeholder="Contoh: Summer Vibes 2024" required id="frameName">
                </div>
                
                <div class="form-group" id="fileUploadGroup">
                    <label class="form-label">File Desain (PNG dengan Transparansi)</label>
                    <label class="file-drop-area" for="frameImage">
                        <i class="ph ph-cloud-arrow-up" style="font-size: 50px; color: var(--primary); margin-bottom: 20px;"></i>
                        <h4 style="font-size: 1.2rem; margin-bottom: 10px;">Klik atau seret file ke sini</h4>
                        <p style="color: var(--text-muted);">Maksimal 5MB. Pastikan lubang foto sudah transparan.</p>
                        <input type="file" name="image" id="frameImage" accept="image/png" style="display:none;" onchange="handleFileSelected(event)">
                    </label>
                </div>
            </div>

            <div id="step2" style="display: none;">
                <div style="display: flex; flex-direction: column; align-items: center; gap: 30px; background: var(--bg-page); padding: 40px; border-radius: var(--radius-lg); border: 2px dashed var(--primary);">
                    <img id="previewImg" style="max-width: 300px; border-radius: 12px; box-shadow: var(--shadow-lg); background: white;">
                    <div style="display: flex; gap: 20px; width: 100%; max-width: 500px;">
                        <button type="button" onclick="cancelUpload()" class="btn btn-secondary" style="flex: 1; padding: 15px;">Batal</button>
                        <button type="button" onclick="openEditor()" class="btn btn-primary" style="flex: 1; padding: 15px;">Atur Posisi Slot Foto</button>
                    </div>
                </div>
            </div>
            
            <div style="display: flex; gap: 15px; margin-top: 30px;">
                <button type="submit" id="submitBtn" class="btn btn-primary btn-block" style="display: none; padding: 20px; flex: 1;">
                    <i class="ph ph-floppy-disk"></i> <span id="submitBtnText">Simpan Ke Database</span>
                </button>
            </div>
        </form>
    </div>

    <h3 style="margin-bottom: 16px; font-family: 'Space Grotesk', sans-serif;">Koleksi Frame Tersedia</h3>
    <div class="frame-grid animate-in animate-delay-1">
        @foreach($frames as $frame)
        <div class="frame-card">
            <div class="frame-actions">
                <button type="button" class="btn-action btn-edit-frame" title="Edit Frame" 
                        data-frame="{{ json_encode($frame) }}"
                        onclick="handleEditClick(this)">
                    <i class="ph ph-pencil-simple"></i>
                </button>
                <form id="delete-form-{{ $frame->id }}" action="{{ route('admin.frames.destroy', $frame->id) }}" method="POST" style="display: none;">
                    @csrf @method('DELETE')
                </form>
                <button type="button" class="btn-action btn-delete-frame" title="Hapus Frame" onclick="confirmDelete({{ $frame->id }})">
                    <i class="ph ph-trash"></i>
                </button>
            </div>
            <div class="frame-img-container">
                <img src="{{ asset('storage/' . $frame->image) }}" alt="{{ $frame->name }}">
            </div>
            <div class="frame-card-title">
                {{ $frame->name }}
            </div>
        </div>
        @endforeach
    </div>

    @if($frames->hasPages())
    <div class="pagination-container animate-in">
        {{ $frames->links() }}
    </div>
    @endif
</div>

<!-- EDITOR MODAL -->
<div class="editor-modal" id="editorModal">
    <h2 style="font-size: 2.2rem; margin-bottom: 10px;">Visual Layout Editor</h2>
    <p style="color: var(--text-muted); margin-bottom: 30px;">Atur posisi slot foto dengan menarik (drag) atau mengubah ukuran kotak biru.</p>
    
    <div style="display: flex; gap: 15px; margin-bottom: 30px;">
        <button type="button" onclick="addSlot()" class="btn btn-secondary" style="background: white; color: var(--primary);">
            <i class="ph ph-plus-circle"></i> Tambah Slot
        </button>
        <button type="button" onclick="removeActiveSlot()" class="btn btn-secondary" style="background: var(--error); color: white; border: none;">
            <i class="ph ph-trash"></i> Hapus Terpilih
        </button>
        <button type="button" onclick="saveEditor()" class="btn btn-primary">
            <i class="ph ph-check-circle"></i> Selesai & Simpan
        </button>
    </div>

    <div class="editor-workspace" id="workspace">
        <img id="workspaceBg" class="bg-frame" src="">
        <div id="slotsContainer"></div>
    </div>
    <div data-island="AdminFrames" style="display:none"></div>
</div>

@endsection

@section('scripts')
<script src="https://daybrush.com/moveable/release/latest/dist/moveable.min.js"></script>
<script>
    function debugSetOrient(type) {
        if (window.setOrient) {
            window.setOrient(type);
        } else {
            // Fallback UI jika island belum muat
            document.querySelectorAll(".orientation-btn").forEach(btn => btn.classList.remove("active"));
            const target = document.querySelector(`.orientation-btn[data-orient="${type}"]`);
            if (target) target.classList.add("active");
            
            const notice = document.getElementById("orientationNotice");
            if (notice) {
                const text = type === "vertical" ? "Portrait/Vertikal" : "Landscape/Horizontal";
                notice.innerHTML = `<i class="ph ph-info"></i> Memuat sistem... (Mohon tunggu sebentar)`;
            }
            console.warn("React Island is still loading...");
        }
    }

    function handleEditClick(btn) {
        try {
            const rawData = btn.getAttribute('data-frame');
            const frameData = JSON.parse(rawData);
            
            if (window.editFrame) {
                window.editFrame(frameData);
            } else {
                Swal.fire({
                    title: 'Memuat...',
                    text: 'Sistem sedang menyiapkan editor. Silakan tunggu 1 detik lalu klik kembali.',
                    icon: 'info',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        } catch (e) {
            console.error("Gagal parse data frame:", e);
        }
    }

    function confirmDelete(id) {
        Swal.fire({
            title: 'Hapus Frame?',
            text: "Data frame ini akan dihapus permanen!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#E11D48',
            cancelButtonColor: '#64748B',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                document.getElementById('delete-form-' + id).submit();
            }
        })
    }
</script>
@endsection
