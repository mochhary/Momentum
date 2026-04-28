import { useEffect } from "react";

export default function AdminFramesIsland() {
    useEffect(() => {
        let orientation = "vertical";
        let uploadedImageObj = null;
        let editorWidth = 350;
        let editorHeight = 500;
        let slots = [];
        let activeSlotId = null;
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
            const slot = slots.find((item) => item.id === id);
            if (!slot) {
                return;
            }

            const transformStr = target.style.transform;
            const translateMatch = transformStr.match(
                /translate\(([-\d.]+)px,\s*([-\d.]+)px\)/,
            );
            if (translateMatch) {
                slot.x = parseFloat(translateMatch[1]);
                slot.y = parseFloat(translateMatch[2]);
            }

            const rotateMatch = transformStr.match(/rotate\(([-\d.]+)deg\)/);
            if (rotateMatch) {
                slot.rotate = parseFloat(rotateMatch[1]);
            }

            if (w !== undefined) {
                slot.width = w;
            }
            if (h !== undefined) {
                slot.height = h;
            }
        };

        const renderSlots = () => {
            const container = document.getElementById("slotsContainer");
            if (!container) {
                return;
            }
            container.innerHTML = "";

            slots.forEach((slot, index) => {
                const element = document.createElement("div");
                element.className = `slot-node ${activeSlotId === slot.id ? "active" : ""}`;
                element.id = `slot-${slot.id}`;
                element.style.width = `${slot.width}px`;
                element.style.height = `${slot.height}px`;
                element.style.transform = `translate(${slot.x}px, ${slot.y}px) rotate(${slot.rotate}deg)`;

                const span = document.createElement("span");
                span.innerText = String(index + 1);
                element.appendChild(span);

                element.addEventListener("mousedown", (event) => {
                    event.stopPropagation();
                    window.setActiveSlot(slot.id);
                });

                container.appendChild(element);
            });
        };

        const initMoveable = () => {
            if (moveable) {
                moveable.destroy();
            }

            moveable = new window.Moveable(
                document.getElementById("workspace"),
                {
                    target: activeSlotId
                        ? document.getElementById(`slot-${activeSlotId}`)
                        : null,
                    draggable: true,
                    resizable: true,
                    rotatable: true,
                    snappable: true,
                    edge: true,
                    origin: false,
                    keepRatio: false,
                },
            );

            moveable
                .on("drag", (event) => {
                    event.target.style.transform = event.transform;
                    updateSlotData(event.target);
                })
                .on("resize", (event) => {
                    event.target.style.width = `${event.width}px`;
                    event.target.style.height = `${event.height}px`;
                    event.target.style.transform = event.drag.transform;
                    updateSlotData(event.target, event.width, event.height);
                })
                .on("rotate", (event) => {
                    event.target.style.transform = event.drag.transform;
                    updateSlotData(event.target);
                });
        };

        window.setOrient = (type) => {
            orientation = type;
            document
                .querySelectorAll(".orientation-btn")
                .forEach((button) => button.classList.remove("active"));
            const target = document.querySelector(
                `.orientation-btn[data-orient="${type}"]`,
            );
            if (target) {
                target.classList.add("active");
            }
        };

        window.handleFileSelected = (event) => {
            const file = event.target.files?.[0];
            if (!file) {
                return;
            }

            const reader = new FileReader();
            reader.onload = (readEvent) => {
                const preview = document.getElementById("previewImg");
                const workspaceBg = document.getElementById("workspaceBg");
                if (preview) {
                    preview.src = readEvent.target.result;
                }
                if (workspaceBg) {
                    workspaceBg.src = readEvent.target.result;
                }

                uploadedImageObj = new Image();
                uploadedImageObj.onload = () => {
                    const aspect =
                        uploadedImageObj.width / uploadedImageObj.height;
                    const maxWidth = 500;
                    const maxHeight = 600;

                    if (uploadedImageObj.width > uploadedImageObj.height) {
                        editorWidth = Math.min(
                            uploadedImageObj.width,
                            maxWidth,
                        );
                        editorHeight = editorWidth / aspect;
                    } else {
                        editorHeight = Math.min(
                            uploadedImageObj.height,
                            maxHeight,
                        );
                        editorWidth = editorHeight * aspect;
                    }

                    const workspace = document.getElementById("workspace");
                    if (workspace) {
                        workspace.style.width = `${editorWidth}px`;
                        workspace.style.height = `${editorHeight}px`;
                    }

                    const fileUploadGroup =
                        document.getElementById("fileUploadGroup");
                    const step2 = document.getElementById("step2");
                    const submitBtn = document.getElementById("submitBtn");
                    if (fileUploadGroup) fileUploadGroup.style.display = "none";
                    if (step2) step2.style.display = "block";
                    if (submitBtn) submitBtn.style.display = "block";
                };

                uploadedImageObj.src = readEvent.target.result;
            };

            reader.readAsDataURL(file);
        };

        window.cancelUpload = () => {
            const frameImageInput = document.getElementById("frameImage");
            if (frameImageInput) {
                frameImageInput.value = "";
            }
            const fileUploadGroup = document.getElementById("fileUploadGroup");
            const step2 = document.getElementById("step2");
            const submitBtn = document.getElementById("submitBtn");
            if (fileUploadGroup) fileUploadGroup.style.display = "block";
            if (step2) step2.style.display = "none";
            if (submitBtn) submitBtn.style.display = "none";

            slots = [];
            if (moveable) {
                moveable.destroy();
                moveable = null;
            }
        };

        window.openEditor = () => {
            document.getElementById("editorModal")?.classList.add("active");
            if (slots.length === 0) {
                slots = JSON.parse(JSON.stringify(slotsConfig[orientation]));
            }
            renderSlots();
            initMoveable();
        };

        window.saveEditor = () => {
            document.getElementById("editorModal")?.classList.remove("active");
            if (moveable) {
                moveable.target = null;
            }

            const percentageConfig = slots.map((slot) => ({
                id: slot.id,
                width: parseFloat(
                    ((slot.width / editorWidth) * 100).toFixed(4),
                ),
                height: parseFloat(
                    ((slot.height / editorHeight) * 100).toFixed(4),
                ),
                top: parseFloat(((slot.y / editorHeight) * 100).toFixed(4)),
                left: parseFloat(((slot.x / editorWidth) * 100).toFixed(4)),
                rotate: parseFloat(slot.rotate),
            }));

            const layoutInput = document.getElementById("layoutConfigInput");
            if (layoutInput) {
                layoutInput.value = JSON.stringify(percentageConfig);
            }

            if (typeof window.Swal !== "undefined") {
                window.Swal.fire(
                    "Berhasil",
                    "Posisi slot berhasil dikonfigurasi.",
                    "success",
                );
            }
        };

        window.setActiveSlot = (id) => {
            activeSlotId = id;
            document
                .querySelectorAll(".slot-node")
                .forEach((node) => node.classList.remove("active"));
            const target = document.getElementById(`slot-${id}`);
            if (target) {
                target.classList.add("active");
                if (moveable) {
                    moveable.target = target;
                }
            }
        };

        window.addSlot = () => {
            const newId = Date.now();
            slots.push({
                id: newId,
                x: 50,
                y: 50,
                width: 100,
                height: 100,
                rotate: 0,
            });
            renderSlots();
            window.setActiveSlot(newId);
        };

        window.removeActiveSlot = () => {
            if (!activeSlotId) {
                return;
            }
            slots = slots.filter((slot) => slot.id !== activeSlotId);
            activeSlotId = null;
            if (moveable) {
                moveable.target = null;
            }
            renderSlots();
        };

        return () => {
            delete window.setOrient;
            delete window.handleFileSelected;
            delete window.cancelUpload;
            delete window.openEditor;
            delete window.saveEditor;
            delete window.setActiveSlot;
            delete window.addSlot;
            delete window.removeActiveSlot;
            if (moveable) {
                moveable.destroy();
            }
        };
    }, []);

    return null;
}
