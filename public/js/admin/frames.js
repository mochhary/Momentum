/**
 * Frame Manager Visual Editor Logic
 */

let orientation = 'vertical';
let uploadedImageObj = null;
let editorWidth = 350;
let editorHeight = 500;

// Slots state
let slots = [];
let activeSlotId = null;
let moveable = null;

// Standard slots config
const slotsConfig = {
    vertical: [
        { id: 1, x: 40, y: 20, width: 100, height: 80, rotate: 0 },
        { id: 2, x: 190, y: 20, width: 100, height: 80, rotate: 0 },
        { id: 3, x: 40, y: 120, width: 100, height: 80, rotate: 0 },
        { id: 4, x: 190, y: 120, width: 100, height: 80, rotate: 0 }
    ],
    horizontal: [
        { id: 1, x: 20, y: 40, width: 100, height: 80, rotate: 0 },
        { id: 2, x: 120, y: 40, width: 100, height: 80, rotate: 0 },
        { id: 3, x: 220, y: 40, width: 100, height: 80, rotate: 0 },
        { id: 4, x: 20, y: 140, width: 100, height: 80, rotate: 0 }
    ]
};

function setOrient(type) {
    orientation = type;
    document.querySelectorAll('.orientation-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.orientation-btn[data-orient="${type}"]`).classList.add('active');
}

function handleFileSelected(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
        document.getElementById('previewImg').src = ev.target.result;
        document.getElementById('workspaceBg').src = ev.target.result;
        
        uploadedImageObj = new Image();
        uploadedImageObj.onload = () => {
            const aspect = uploadedImageObj.width / uploadedImageObj.height;
            const maxWidth = 500;
            const maxHeight = 600;
            
            if (uploadedImageObj.width > uploadedImageObj.height) {
                editorWidth = Math.min(uploadedImageObj.width, maxWidth);
                editorHeight = editorWidth / aspect;
            } else {
                editorHeight = Math.min(uploadedImageObj.height, maxHeight);
                editorWidth = editorHeight * aspect;
            }
            
            document.getElementById('workspace').style.width = `${editorWidth}px`;
            document.getElementById('workspace').style.height = `${editorHeight}px`;
            
            document.getElementById('fileUploadGroup').style.display = 'none';
            document.getElementById('step2').style.display = 'block';
            document.getElementById('submitBtn').style.display = 'block';
        };
        uploadedImageObj.src = ev.target.result;
    };
    reader.readAsDataURL(file);
}

function cancelUpload() {
    document.getElementById('frameImage').value = '';
    document.getElementById('fileUploadGroup').style.display = 'block';
    document.getElementById('step2').style.display = 'none';
    document.getElementById('submitBtn').style.display = 'none';
    slots = [];
    if(moveable) { moveable.destroy(); moveable = null; }
}

function openEditor() {
    document.getElementById('editorModal').classList.add('active');
    if(slots.length === 0) {
        slots = JSON.parse(JSON.stringify(slotsConfig[orientation]));
    }
    renderSlots();
    initMoveable();
}

function saveEditor() {
    document.getElementById('editorModal').classList.remove('active');
    if(moveable) { moveable.target = null; }
    
    const percentageConfig = slots.map(slot => ({
        id: slot.id,
        width: parseFloat(((slot.width / editorWidth) * 100).toFixed(4)),
        height: parseFloat(((slot.height / editorHeight) * 100).toFixed(4)),
        top: parseFloat(((slot.y / editorHeight) * 100).toFixed(4)),
        left: parseFloat(((slot.x / editorWidth) * 100).toFixed(4)),
        rotate: parseFloat(slot.rotate)
    }));
    
    document.getElementById('layoutConfigInput').value = JSON.stringify(percentageConfig);
    Swal.fire('Berhasil', 'Posisi slot berhasil dikonfigurasi.', 'success');
}

function renderSlots() {
    const container = document.getElementById('slotsContainer');
    container.innerHTML = '';
    
    slots.forEach((slot, index) => {
        const el = document.createElement('div');
        el.className = `slot-node ${activeSlotId === slot.id ? 'active' : ''}`;
        el.id = `slot-${slot.id}`;
        el.style.width = `${slot.width}px`;
        el.style.height = `${slot.height}px`;
        el.style.transform = `translate(${slot.x}px, ${slot.y}px) rotate(${slot.rotate}deg)`;
        
        const span = document.createElement('span');
        span.innerText = index + 1;
        el.appendChild(span);
        
        el.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            setActiveSlot(slot.id);
        });
        container.appendChild(el);
    });
}

function setActiveSlot(id) {
    activeSlotId = id;
    document.querySelectorAll('.slot-node').forEach(el => el.classList.remove('active'));
    const target = document.getElementById(`slot-${id}`);
    if(target) {
        target.classList.add('active');
        if(moveable) moveable.target = target;
    }
}

function addSlot() {
    const newId = Date.now();
    slots.push({
        id: newId,
        x: 50, y: 50, width: 100, height: 100, rotate: 0
    });
    renderSlots();
    setActiveSlot(newId);
}

function removeActiveSlot() {
    if(!activeSlotId) return;
    slots = slots.filter(s => s.id !== activeSlotId);
    activeSlotId = null;
    if(moveable) moveable.target = null;
    renderSlots();
}

function initMoveable() {
    if (moveable) moveable.destroy();
    
    moveable = new Moveable(document.getElementById('workspace'), {
        target: activeSlotId ? document.getElementById(`slot-${activeSlotId}`) : null,
        draggable: true,
        resizable: true,
        rotatable: true,
        snappable: true,
        edge: true,
        origin: false,
        keepRatio: false
    });

    moveable.on("drag", e => {
        e.target.style.transform = e.transform;
        updateSlotData(e.target);
    }).on("resize", e => {
        e.target.style.width = `${e.width}px`;
        e.target.style.height = `${e.height}px`;
        e.target.style.transform = e.drag.transform;
        updateSlotData(e.target, e.width, e.height);
    }).on("rotate", e => {
        e.target.style.transform = e.drag.transform;
        updateSlotData(e.target);
    });
}

function updateSlotData(target, w, h) {
    const id = parseInt(target.id.replace('slot-', ''));
    const slot = slots.find(s => s.id === id);
    if(!slot) return;
    
    const transformStr = target.style.transform;
    const translateMatch = transformStr.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
    if(translateMatch) {
        slot.x = parseFloat(translateMatch[1]);
        slot.y = parseFloat(translateMatch[2]);
    }
    
    const rotateMatch = transformStr.match(/rotate\(([-\d.]+)deg\)/);
    if(rotateMatch) {
        slot.rotate = parseFloat(rotateMatch[1]);
    }
    
    if(w !== undefined) slot.width = w;
    if(h !== undefined) slot.height = h;
}
