/**
 * Photo Booth Editor & Upload Logic
 */

let editorWidth = 0;
let editorHeight = 0;
let activeSlotIndex = null;
let currentXhr = null;
let hammerManager = null;

function initEditor(layoutConfig, frameImgUrl) {
    const img = new Image();
    img.onload = () => {
        const container = document.querySelector('.upload-workspace');
        if (!container) return;
        
        // Use a more stable width calculation
        const containerWidth = container.getBoundingClientRect().width;
        const padding = window.innerWidth < 768 ? 32 : 80;
        const maxWidth = Math.min(containerWidth - padding, 500); 
        
        if (maxWidth <= 0) return;

        const aspect = img.width / img.height;
        
        if (img.width > img.height) {
            editorWidth = maxWidth;
            editorHeight = editorWidth / aspect;
        } else {
            const maxHeight = window.innerHeight * 0.6;
            editorHeight = Math.min(img.height, maxHeight);
            editorWidth = editorHeight * aspect;
            
            if (editorWidth > maxWidth) {
                editorWidth = maxWidth;
                editorHeight = editorWidth / aspect;
            }
        }

        const wrapper = document.getElementById('editorWrapper');
        wrapper.style.width = `${Math.floor(editorWidth)}px`;
        wrapper.style.height = `${Math.floor(editorHeight)}px`;

        initGlobalGestures(wrapper);
        renderSlots(layoutConfig);
    };
    img.src = frameImgUrl;
}

function initGlobalGestures(wrapper) {
    if (hammerManager) hammerManager.destroy();
    
    hammerManager = new Hammer.Manager(wrapper);
    const pinch = new Hammer.Pinch();
    const rotate = new Hammer.Rotate();
    const pan = new Hammer.Pan();

    pinch.recognizeWith(rotate);
    pinch.recognizeWith(pan);

    hammerManager.add([pinch, rotate, pan]);

    let startScale = 1;
    let startRot = 0;
    let startTx = 0;
    let startTy = 0;

    hammerManager.on("pinchstart rotatestart panstart", (e) => {
        if (!activeSlotIndex) return;
        const target = document.getElementById(`user-img-${activeSlotIndex}`);
        if (!target) return;
        
        startScale = parseFloat(target.dataset.scale) || 1;
        startRot = parseFloat(target.dataset.rot) || 0;
        startTx = parseFloat(target.dataset.tx) || 0;
        startTy = parseFloat(target.dataset.ty) || 0;
    });

    hammerManager.on("pinchmove rotatemove", (e) => {
        if (!activeSlotIndex) return;
        const target = document.getElementById(`user-img-${activeSlotIndex}`);
        if (!target) return;

        // Apply scale
        const newScale = startScale * e.scale;
        target.dataset.scale = Math.min(Math.max(newScale, 0.1), 5);
        document.getElementById('scaleSlider').value = target.dataset.scale;

        // Apply rotation
        target.dataset.rot = startRot + e.rotation;
        document.getElementById('rotateSlider').value = target.dataset.rot;

        applyTransform(target);
        if(activeMoveable) activeMoveable.updateRect();
    });

    hammerManager.on("panmove", (e) => {
        // Only pan if it's 2 fingers (pinch-to-drag) or if we want single finger drag
        // For photobooth, usually 2 fingers for scale/rotate is enough, Moveable handles 1 finger drag
        if (e.pointers.length < 2) return; 

        if (!activeSlotIndex) return;
        const target = document.getElementById(`user-img-${activeSlotIndex}`);
        if (!target) return;

        target.dataset.tx = startTx + e.deltaX;
        target.dataset.ty = startTy + e.deltaY;

        applyTransform(target);
        if(activeMoveable) activeMoveable.updateRect();
    });
}

function renderSlots(layoutConfig) {
    const container = document.getElementById('slotsContainer');
    const fileInputs = document.getElementById('fileInputsContainer');
    if (!container || !fileInputs) return;
    
    container.innerHTML = '';
    fileInputs.innerHTML = '';

    layoutConfig.forEach((slot, i) => {
        const index = i + 1;
        const widthPx = (slot.width / 100) * editorWidth;
        const heightPx = (slot.height / 100) * editorHeight;
        const leftPx = (slot.left / 100) * editorWidth;
        const topPx = (slot.top / 100) * editorHeight;

        const slotEl = document.createElement('div');
        slotEl.className = 'user-slot';
        slotEl.id = `slot-container-${index}`;
        slotEl.style.width = `${widthPx}px`;
        slotEl.style.height = `${heightPx}px`;
        slotEl.style.left = `${leftPx}px`;
        slotEl.style.top = `${topPx}px`;
        slotEl.style.transform = `rotate(${slot.rotate}deg)`;
        
        const placeholder = document.createElement('div');
        placeholder.className = 'placeholder-text';
        placeholder.innerText = `FOTO ${index}`;
        slotEl.appendChild(placeholder);
        
        const imgContainer = document.createElement('div');
        imgContainer.className = 'slot-image-container';
        
        const userImg = document.createElement('img');
        userImg.id = `user-img-${index}`;
        userImg.style.display = 'none';
        
        imgContainer.appendChild(userImg);
        slotEl.appendChild(imgContainer);
        
        slotEl.onclick = () => {
            if (slotEl.classList.contains('has-image')) {
                setActiveSlot(index);
                return;
            }
            document.getElementById(`file-${index}`).click();
        };

        container.appendChild(slotEl);

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = `file-${index}`;
        // Whitelist formats and prioritize camera/gallery on mobile
        fileInput.accept = 'image/jpeg, image/jpg, image/png, image/webp, .heic';
        fileInput.onchange = (e) => handlePhotoUpload(e, index, widthPx, heightPx);
        fileInputs.appendChild(fileInput);
    });
}

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'];
const ALLOWED_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'heic'];

function handlePhotoUpload(e, index, slotW, slotH) {
    const file = e.target.files[0];
    if(!file) return;

    const fileExt = file.name.split('.').pop().toLowerCase();
    const isAllowedType = ALLOWED_TYPES.includes(file.type) || file.type === ''; // Some browsers don't recognize HEIC mime
    const isAllowedExt = ALLOWED_EXTS.includes(fileExt);

    if (!isAllowedType && !isAllowedExt) {
        Swal.fire({
            icon: 'error',
            title: 'Format Tidak Didukung',
            text: 'Silakan pilih foto dengan format JPG, PNG, WEBP, atau HEIC.',
            confirmButtonColor: 'var(--primary)'
        });
        e.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        const userImg = document.getElementById(`user-img-${index}`);
        const slotContainer = document.getElementById(`slot-container-${index}`);
        
        slotContainer.classList.add('has-image');
        slotContainer.querySelector('.placeholder-text').style.display = 'none';
        
        userImg.src = event.target.result;
        userImg.style.display = 'block';

        userImg.onload = () => {
            const scale = Math.max(slotW / userImg.naturalWidth, slotH / userImg.naturalHeight);
            const startW = userImg.naturalWidth * scale;
            const startH = userImg.naturalHeight * scale;
            const startX = -(startW - slotW) / 2;
            const startY = -(startH - slotH) / 2;
            
            userImg.style.width = `${startW}px`;
            userImg.style.height = `${startH}px`;
            userImg.dataset.tx = startX;
            userImg.dataset.ty = startY;
            userImg.dataset.rot = 0;
            userImg.dataset.scale = 1;
            userImg.dataset.flipX = 1;
            userImg.dataset.brightness = 100;
            
            applyTransform(userImg);
            setActiveSlot(index);
            initSlotMoveable(index, userImg, slotContainer);
        };
    };
    reader.readAsDataURL(file);
}

let activeMoveable = null;

function setActiveSlot(index) {
    activeSlotIndex = index;
    document.querySelectorAll('.user-slot').forEach(el => el.classList.remove('active-slot'));
    const activeSlot = document.getElementById(`slot-container-${index}`);
    
    if(activeSlot) {
        activeSlot.classList.add('active-slot');
        document.getElementById('editorControls').style.display = 'flex';
        const userImg = document.getElementById(`user-img-${index}`);
        
        if(userImg) {
            // Sync sliders
            document.getElementById('brightnessSlider').value = userImg.dataset.brightness || 100;
            document.getElementById('scaleSlider').value = userImg.dataset.scale || 1;
            document.getElementById('rotateSlider').value = userImg.dataset.rot || 0;
            
            // Initialize or re-attach Moveable to this specific target
            initSlotMoveable(index, userImg, activeSlot);
        }
    }
}

function initSlotMoveable(index, userImg, container) {
    if(activeMoveable) activeMoveable.destroy();

    activeMoveable = new Moveable(document.body, {
        target: userImg,
        draggable: true,
        rotatable: true,
        scalable: true,
        pinchable: ["draggable", "scalable", "rotatable"],
        pinchOutside: true,
        keepRatio: true,
        origin: false,
        throttleScale: 0,
        throttleRotate: 0,
        pinchThreshold: 0,
    });

    activeMoveable.on("dragStart", () => {})
    .on("drag", e => {
        const target = e.target;
        target.dataset.tx = parseFloat(target.dataset.tx) + e.delta[0];
        target.dataset.ty = parseFloat(target.dataset.ty) + e.delta[1];
        applyTransform(target);
    })
    .on("scale", e => {
        const target = e.target;
        target.dataset.scale = parseFloat(target.dataset.scale) * e.delta[0];
        document.getElementById('scaleSlider').value = target.dataset.scale;
        applyTransform(target);
    })
    .on("rotate", e => {
        const target = e.target;
        target.dataset.rot = parseFloat(target.dataset.rot) + e.delta;
        document.getElementById('rotateSlider').value = target.dataset.rot;
        applyTransform(target);
    });
}

function updateScale(val) {
    if(!activeSlotIndex) return;
    const target = document.getElementById(`user-img-${activeSlotIndex}`);
    target.dataset.scale = val;
    applyTransform(target);
    if(activeMoveable) activeMoveable.updateRect();
}

function updateRotation(val) {
    if(!activeSlotIndex) return;
    const target = document.getElementById(`user-img-${activeSlotIndex}`);
    target.dataset.rot = val;
    applyTransform(target);
    if(activeMoveable) activeMoveable.updateRect();
}

function rotateActiveSlot(deg) {
    if(!activeSlotIndex) return;
    const target = document.getElementById(`user-img-${activeSlotIndex}`);
    target.dataset.rot = parseFloat(target.dataset.rot) + deg;
    applyTransform(target);
    if(activeMoveable) activeMoveable.updateRect();
}

function flipActiveSlot() {
    if(!activeSlotIndex) return;
    const target = document.getElementById(`user-img-${activeSlotIndex}`);
    target.dataset.flipX = parseFloat(target.dataset.flipX) * -1;
    applyTransform(target);
}

function updateBrightness(val) {
    if(!activeSlotIndex) return;
    const target = document.getElementById(`user-img-${activeSlotIndex}`);
    target.dataset.brightness = val;
    applyTransform(target);
}

function deleteActiveSlot() {
    if(!activeSlotIndex) return;
    const container = document.getElementById(`slot-container-${activeSlotIndex}`);
    const img = document.getElementById(`user-img-${activeSlotIndex}`);
    container.classList.remove('has-image', 'active-slot');
    container.querySelector('.placeholder-text').style.display = 'block';
    img.src = '';
    img.style.display = 'none';
    document.getElementById(`file-${activeSlotIndex}`).value = '';
    if(activeMoveable) {
        activeMoveable.destroy();
        activeMoveable = null;
    }
    document.getElementById('editorControls').style.display = 'none';
    activeSlotIndex = null;
}

function applyTransform(target) {
    const tx = target.dataset.tx;
    const ty = target.dataset.ty;
    const rot = target.dataset.rot;
    const scale = target.dataset.scale;
    const flipX = target.dataset.flipX;
    const brightness = target.dataset.brightness;
    target.style.transform = `translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(${scale}) scaleX(${flipX})`;
    target.style.filter = `brightness(${brightness}%)`;
}

function cancelUpload() {
    if (currentXhr) {
        currentXhr.abort();
        currentXhr = null;
    }
    document.getElementById('loadingOverlay').style.display = 'none';
    alert("Proses upload dibatalkan.");
}

async function generateAndSubmit(layoutConfig) {
    const uploadForm = document.getElementById('uploadForm');
    if (!uploadForm.reportValidity()) return;

    let allFilled = true;
    for(let i = 1; i <= layoutConfig.length; i++) {
        const img = document.getElementById(`user-img-${i}`);
        if(!img || img.style.display === 'none') { allFilled = false; break; }
    }
    if(!allFilled) { alert('Silakan upload foto untuk semua slot.'); return; }

    document.getElementById('loadingSpinner').style.display = 'block';
    document.getElementById('loadingTitle').innerText = 'Menyatukan Foto...';
    document.getElementById('progressContainer').style.display = 'none';
    document.getElementById('loadingOverlay').style.display = 'flex';

    await new Promise(r => setTimeout(r, 100));

    try {
        const frameImg = document.getElementById('frameBg');
        
        // Optimized resolution for faster upload (still high enough for A3 print)
        const targetLongSide = 2800; 
        const aspect = frameImg.naturalWidth / frameImg.naturalHeight;
        
        let originalW, originalH;
        if (frameImg.naturalWidth > frameImg.naturalHeight) {
            originalW = targetLongSide;
            originalH = originalW / aspect;
        } else {
            originalH = targetLongSide;
            originalW = originalH * aspect;
        }

        const canvas = document.createElement('canvas');
        canvas.width = originalW;
        canvas.height = originalH;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        
        // Fill white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, originalW, originalH);

        layoutConfig.forEach((slot, i) => {
            const index = i + 1;
            const userImg = document.getElementById(`user-img-${index}`);
            ctx.save();
            const slotX = (slot.left / 100) * originalW;
            const slotY = (slot.top / 100) * originalH;
            const slotW = (slot.width / 100) * originalW;
            const slotH = (slot.height / 100) * originalH;
            
            ctx.translate(slotX + slotW/2, slotY + slotH/2);
            ctx.rotate(slot.rotate * Math.PI / 180);
            ctx.beginPath(); 
            ctx.rect(-slotW/2, -slotH/2, slotW, slotH); 
            ctx.clip();
            
            const tx = parseFloat(userImg.dataset.tx) || 0;
            const ty = parseFloat(userImg.dataset.ty) || 0;
            const rot = parseFloat(userImg.dataset.rot) || 0;
            const scale = parseFloat(userImg.dataset.scale) || 1;
            const flipX = parseFloat(userImg.dataset.flipX) || 1;
            const brightness = parseFloat(userImg.dataset.brightness) || 100;
            
            ctx.filter = `brightness(${brightness}%)`;
            
            const scaleRatio = originalW / editorWidth;
            
            ctx.translate(tx * scaleRatio, ty * scaleRatio);
            ctx.rotate(rot * Math.PI / 180);
            ctx.scale(flipX, 1);
            
            const drawW = parseFloat(userImg.style.width) * scaleRatio * scale;
            const drawH = parseFloat(userImg.style.height) * scaleRatio * scale;
            
            ctx.drawImage(userImg, -slotW/2, -slotH/2, drawW, drawH);
            ctx.filter = 'none'; 
            ctx.restore();
        });

        // Draw frame on top
        ctx.drawImage(frameImg, 0, 0, originalW, originalH);
        
        // --- High Performance Binary Upload ---
        document.getElementById('loadingSpinner').style.display = 'none';
        document.getElementById('loadingTitle').innerText = 'Mengunggah...';
        document.getElementById('progressContainer').style.display = 'block';

        canvas.toBlob((blob) => {
            const formData = new FormData(uploadForm);
            formData.append('final_photo_file', blob, 'result.jpg');
            formData.set('final_photo', 'binary_mode'); // Keep validator happy

            currentXhr = new XMLHttpRequest();
            currentXhr.open('POST', uploadForm.action, true);
            currentXhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            
            currentXhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    let pct = Math.floor((e.loaded / e.total) * 100);
                    document.getElementById('progressBar').style.width = pct + '%';
                    document.getElementById('progressText').innerText = pct + '%';
                }
            };
            
            currentXhr.onload = () => {
                if (currentXhr.status >= 200 && currentXhr.status < 300) {
                    const response = JSON.parse(currentXhr.responseText);
                    if(response.redirect_url) window.location.href = response.redirect_url;
                    else window.location.reload();
                } else {
                    alert('Gagal mengunggah foto.');
                    document.getElementById('loadingOverlay').style.display = 'none';
                }
            };
            
            currentXhr.onerror = () => {
                alert('Koneksi terputus. Silakan coba lagi.');
                document.getElementById('loadingOverlay').style.display = 'none';
            };

            currentXhr.send(formData);
        }, 'image/jpeg', 0.85);
    } catch (e) {
        alert('Terjadi kesalahan proses gambar.');
        document.getElementById('loadingOverlay').style.display = 'none';
    }
}
