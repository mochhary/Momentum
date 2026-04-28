import { useEffect } from "react";

export default function AdminFramesIsland() {
    useEffect(() => {
        console.warn("🚀 ADMIN FRAMES ISLAND INITIALIZED");

        // Global State
        window.__frameState = {
            orientation: "vertical",
            slots: [],
            editorWidth: 350,
            editorHeight: 500,
            activeSlotId: null
        };

        let uploadedImageObj = null;
        let moveable = null;

        const slotsConfig = {
            vertical: [
                { id: 1, x: 40, y: 20, width: 100, height: 80, rotate: 0 },
                { id: 2, x: 190, y: 20, width: 100, height: 80, rotate: 0 },
                { id: 3, x: 40, y: 120, width: 100, height: 80, rotate: 0 },
                { id: 4, x: 190, y: 120, width: 100, height: 80, rotate: 0 },
            ],
            horizontal: [
                { id: 1, x: 20, y: 40, width: 100, height: 80, rotate: 0 },
                { id: 2, x: 120, y: 40, width: 100, height: 80, rotate: 0 },
                { id: 3, x: 220, y: 40, width: 100, height: 80, rotate: 0 },
                { id: 4, x: 20, y: 140, width: 100, height: 80, rotate: 0 },
            ],
        };

        const updateSlotData = (target, w, h) => {
            const id = parseInt(target.id.replace("slot-", ""), 10);
            const slot = window.__frameState.slots.find((item) => item.id === id);
            if (!slot) return;
            const transformStr = target.style.transform;
            const translateMatch = transformStr.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
            if (translateMatch) {
                slot.x = parseFloat(translateMatch[1]);
                slot.y = parseFloat(translateMatch[2]);
            }
            const rotateMatch = transformStr.match(/rotate\(([-\d.]+)deg\)/);
            if (rotateMatch) slot.rotate = parseFloat(rotateMatch[1]);
            if (w !== undefined) slot.width = w;
            if (h !== undefined) slot.height = h;
        };

        const renderSlots = () => {
            const container = document.getElementById("slotsContainer");
            if (!container) return;
            container.innerHTML = "";
            window.__frameState.slots.forEach((slot, index) => {
                const element = document.createElement("div");
                element.className = `slot-node ${window.__frameState.activeSlotId === slot.id ? "active" : ""}`;
                element.id = `slot-${slot.id}`;
                element.style.width = `${slot.width}px`;
                element.style.height = `${slot.height}px`;
                element.style.transform = `translate(${slot.x}px, ${slot.y}px) rotate(${slot.rotate}deg)`;
                const span = document.createElement("span");
                span.innerText = String(index + 1);
                element.appendChild(span);
                element.addEventListener("mousedown", (e) => { e.stopPropagation(); window.setActiveSlot(slot.id); });
                container.appendChild(element);
            });
        };

        const initMoveable = () => {
            if (moveable) moveable.destroy();
            moveable = new window.Moveable(document.getElementById("workspace"), {
                target: window.__frameState.activeSlotId ? document.getElementById(`slot-${window.__frameState.activeSlotId}`) : null,
                draggable: true, resizable: true, rotatable: true, snappable: true, edge: true, origin: false, keepRatio: false,
            });
            moveable
                .on("drag", (e) => { e.target.style.transform = e.transform; updateSlotData(e.target); })
                .on("resize", (e) => {
                    e.target.style.width = `${e.width}px`; e.target.style.height = `${e.height}px`; e.target.style.transform = e.drag.transform;
                    updateSlotData(e.target, e.width, e.height);
                })
                .on("rotate", (e) => { e.target.style.transform = e.drag.transform; updateSlotData(e.target); });
        };

        window.setOrient = (type) => {
            window.__frameState.orientation = type;
            document.querySelectorAll(".orientation-btn").forEach(btn => btn.classList.remove("active"));
            const target = document.querySelector(`.orientation-btn[data-orient="${type}"]`);
            if (target) target.classList.add("active");
            const notice = document.getElementById("orientationNotice");
            if (notice) {
                const text = type === "vertical" ? "Portrait/Vertikal" : "Landscape/Horizontal";
                notice.innerHTML = `<i class="ph ph-info"></i> Perhatian: Pastikan file desain yang diupload adalah <b>${text}</b>.`;
            }
        };

        window.handleFileSelected = (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (readEvent) => {
                uploadedImageObj = new Image();
                uploadedImageObj.onload = () => {
                    const isLandscape = uploadedImageObj.width > uploadedImageObj.height;
                    const targetOrient = window.__frameState.orientation;
                    const isValid = (targetOrient === "vertical" && !isLandscape) || (targetOrient === "horizontal" && isLandscape);
                    if (!isValid) {
                        window.Swal.fire({
                            icon: "error", title: "Orientasi Tidak Sesuai",
                            text: `Gambar bersifat ${isLandscape ? 'Horizontal' : 'Vertikal'}, tapi pilihan Anda adalah ${targetOrient}.`,
                            confirmButtonColor: "var(--primary)",
                        });
                        event.target.value = ""; return;
                    }
                    const preview = document.getElementById("previewImg");
                    const workspaceBg = document.getElementById("workspaceBg");
                    if (preview) preview.src = readEvent.target.result;
                    if (workspaceBg) workspaceBg.src = readEvent.target.result;
                    const aspect = uploadedImageObj.width / uploadedImageObj.height;
                    const maxWidth = 500, maxHeight = 600;
                    if (isLandscape) {
                        window.__frameState.editorWidth = Math.min(uploadedImageObj.width, maxWidth);
                        window.__frameState.editorHeight = window.__frameState.editorWidth / aspect;
                    } else {
                        window.__frameState.editorHeight = Math.min(uploadedImageObj.height, maxHeight);
                        window.__frameState.editorWidth = window.__frameState.editorHeight * aspect;
                    }
                    const workspace = document.getElementById("workspace");
                    if (workspace) {
                        workspace.style.width = `${window.__frameState.editorWidth}px`;
                        workspace.style.height = `${window.__frameState.editorHeight}px`;
                    }
                    document.getElementById("fileUploadGroup").style.display = "none";
                    document.getElementById("step2").style.display = "block";
                    document.getElementById("submitBtn").style.display = "block";
                };
                uploadedImageObj.src = readEvent.target.result;
            };
            reader.readAsDataURL(file);
        };

        window.editFrame = (frame) => {
            console.warn("!!! editFrame TRIGGERED for:", frame.name);
            const currentName = document.getElementById("frameName").value;
            if (currentName && currentName !== frame.name) {
                window.Swal.fire({
                    title: "Konfirmasi", text: "Ganti ke mode edit?", icon: "warning",
                    showCancelButton: true, confirmButtonColor: "var(--primary)",
                }).then((result) => { if (result.isConfirmed) performEdit(frame); });
            } else { performEdit(frame); }
        };

        const performEdit = (frame) => {
            const form = document.getElementById("frameForm");
            if (!form) return;
            form.action = `/dashboard/frames/${frame.id}`;
            document.getElementById("methodField").innerHTML = '<input type="hidden" name="_method" value="PUT">';
            document.getElementById("formTitle").innerText = "Edit Frame: " + frame.name;
            document.getElementById("submitBtnText").innerText = "Update Frame";
            document.getElementById("frameName").value = frame.name;
            
            const imageUrl = `/storage/${frame.image}`;
            const preview = document.getElementById("previewImg");
            const workspaceBg = document.getElementById("workspaceBg");
            if (preview) preview.src = imageUrl;
            if (workspaceBg) workspaceBg.src = imageUrl;

            uploadedImageObj = new Image();
            uploadedImageObj.onload = () => {
                const isLandscape = uploadedImageObj.width > uploadedImageObj.height;
                window.setOrient(isLandscape ? "horizontal" : "vertical");
                const aspect = uploadedImageObj.width / uploadedImageObj.height;
                const maxWidth = 500, maxHeight = 600;
                if (isLandscape) {
                    window.__frameState.editorWidth = Math.min(uploadedImageObj.width, maxWidth);
                    window.__frameState.editorHeight = window.__frameState.editorWidth / aspect;
                } else {
                    window.__frameState.editorHeight = Math.min(uploadedImageObj.height, maxHeight);
                    window.__frameState.editorWidth = window.__frameState.editorHeight * aspect;
                }
                const workspace = document.getElementById("workspace");
                if (workspace) {
                    workspace.style.width = `${window.__frameState.editorWidth}px`;
                    workspace.style.height = `${window.__frameState.editorHeight}px`;
                }
                if (frame.layout_config && Array.isArray(frame.layout_config) && frame.layout_config.length > 0) {
                    window.__frameState.slots = frame.layout_config.map(cfg => ({
                        id: cfg.id, x: (cfg.left / 100) * window.__frameState.editorWidth, y: (cfg.top / 100) * window.__frameState.editorHeight,
                        width: (cfg.width / 100) * window.__frameState.editorWidth, height: (cfg.height / 100) * window.__frameState.editorHeight,
                        rotate: cfg.rotate,
                    }));
                } else {
                    window.__frameState.slots = JSON.parse(JSON.stringify(slotsConfig[isLandscape ? "horizontal" : "vertical"]));
                }
                document.getElementById("fileUploadGroup").style.display = "none";
                document.getElementById("step2").style.display = "block";
                document.getElementById("submitBtn").style.display = "block";
                document.getElementById("layoutConfigInput").value = JSON.stringify(frame.layout_config || []);
            };
            uploadedImageObj.src = imageUrl;
            window.scrollTo({ top: 0, behavior: "smooth" });
        };

        window.cancelUpload = () => {
            console.log("Cancelling and resetting form...");
            const frameImageInput = document.getElementById("frameImage");
            if (frameImageInput) frameImageInput.value = "";
            document.getElementById("fileUploadGroup").style.display = "block";
            document.getElementById("step2").style.display = "none";
            
            const form = document.getElementById("frameForm");
            if (form) form.action = "/dashboard/frames";
            document.getElementById("methodField").innerHTML = "";
            document.getElementById("formTitle").innerText = "Tambah Frame Baru";
            document.getElementById("submitBtnText").innerText = "Simpan Ke Database";
            document.getElementById("frameName").value = "";
            document.getElementById("submitBtn").style.display = "none";

            window.__frameState.slots = [];
            if (moveable) { moveable.destroy(); moveable = null; }
        };

        window.openEditor = () => {
            document.getElementById("editorModal")?.classList.add("active");
            if (window.__frameState.slots.length === 0) window.__frameState.slots = JSON.parse(JSON.stringify(slotsConfig[window.__frameState.orientation]));
            renderSlots(); initMoveable();
        };

        window.saveEditor = () => {
            document.getElementById("editorModal")?.classList.remove("active");
            if (moveable) moveable.target = null;
            const percentageConfig = window.__frameState.slots.map(slot => ({
                id: slot.id, width: parseFloat(((slot.width / window.__frameState.editorWidth) * 100).toFixed(4)),
                height: parseFloat(((slot.height / window.__frameState.editorHeight) * 100).toFixed(4)),
                top: parseFloat(((slot.y / window.__frameState.editorHeight) * 100).toFixed(4)),
                left: parseFloat(((slot.x / window.__frameState.editorWidth) * 100).toFixed(4)),
                rotate: parseFloat(slot.rotate),
            }));
            document.getElementById("layoutConfigInput").value = JSON.stringify(percentageConfig);
            if (typeof window.Swal !== "undefined") window.Swal.fire("Berhasil", "Slot dikonfigurasi.", "success");
        };

        window.setActiveSlot = (id) => {
            window.__frameState.activeSlotId = id;
            document.querySelectorAll(".slot-node").forEach(node => node.classList.remove("active"));
            const target = document.getElementById(`slot-${id}`);
            if (target && moveable) { target.classList.add("active"); moveable.target = target; }
        };

        window.addSlot = () => {
            const newId = Date.now();
            window.__frameState.slots.push({ id: newId, x: 50, y: 50, width: 100, height: 100, rotate: 0 });
            renderSlots(); window.setActiveSlot(newId);
        };

        window.removeActiveSlot = () => {
            if (!window.__frameState.activeSlotId) return;
            window.__frameState.slots = window.__frameState.slots.filter(slot => slot.id !== window.__frameState.activeSlotId);
            window.__frameState.activeSlotId = null;
            if (moveable) moveable.target = null;
            renderSlots();
        };

        window.resetForm = () => window.cancelUpload();

        return () => {
            delete window.setOrient; delete window.handleFileSelected; delete window.cancelUpload;
            delete window.openEditor; delete window.saveEditor; delete window.setActiveSlot;
            delete window.addSlot; delete window.removeActiveSlot; delete window.editFrame; delete window.resetForm;
            if (moveable) moveable.destroy();
        };
    }, []);

    return null;
}
