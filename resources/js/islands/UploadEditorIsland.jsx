import { useEffect } from "react";

export default function UploadEditorIsland({
    layoutConfig = [],
    frameImgUrl = "",
}) {
    useEffect(() => {
        let editorWidth = 0;
        let editorHeight = 0;
        let activeSlotIndex = null;
        let currentXhr = null;
        let hammerManager = null;
        let activeMoveable = null;
        let renderScheduled = false;

        // Optimized transform application with throttled rendering
        const applyTransform = (target) => {
            const tx = target.dataset.tx;
            const ty = target.dataset.ty;
            const rot = target.dataset.rot;
            const scale = target.dataset.scale;
            const flipX = target.dataset.flipX;
            const brightness = target.dataset.brightness;
            target.style.transform = `translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(${scale}) scaleX(${flipX})`;
            target.style.filter = `brightness(${brightness}%)`;
        };

        // Throttled render using requestAnimationFrame
        const throttledUpdateMoveable = () => {
            if (renderScheduled) return;
            renderScheduled = true;
            requestAnimationFrame(() => {
                if (activeMoveable) {
                    activeMoveable.updateRect();
                }
                renderScheduled = false;
            });
        };

        const initSlotMoveable = (index, userImg) => {
            if (activeMoveable) {
                activeMoveable.destroy();
            }

            activeMoveable = new window.Moveable(document.body, {
                target: userImg,
                draggable: true,
                rotatable: true,
                scalable: true,
                pinchable: ["draggable", "scalable", "rotatable"],
                pinchOutside: true,
                keepRatio: true,
                origin: false,
                throttleScale: 16,
                throttleRotate: 16,
                pinchThreshold: 0,
            });

            activeMoveable
                .on("drag", (event) => {
                    const target = event.target;
                    target.dataset.tx =
                        parseFloat(target.dataset.tx || 0) + event.delta[0];
                    target.dataset.ty =
                        parseFloat(target.dataset.ty || 0) + event.delta[1];
                    applyTransform(target);
                    throttledUpdateMoveable();
                })
                .on("scale", (event) => {
                    const target = event.target;
                    target.dataset.scale =
                        parseFloat(target.dataset.scale || 1) * event.delta[0];
                    const scaleSlider = document.getElementById("scaleSlider");
                    if (scaleSlider) {
                        scaleSlider.value = target.dataset.scale;
                    }
                    applyTransform(target);
                    throttledUpdateMoveable();
                })
                .on("rotate", (event) => {
                    const target = event.target;
                    target.dataset.rot =
                        parseFloat(target.dataset.rot || 0) + event.delta;
                    const rotateSlider =
                        document.getElementById("rotateSlider");
                    if (rotateSlider) {
                        rotateSlider.value = target.dataset.rot;
                    }
                    applyTransform(target);
                    throttledUpdateMoveable();
                });
        };

        const setActiveSlot = (index) => {
            activeSlotIndex = index;
            document
                .querySelectorAll(".user-slot")
                .forEach((el) => el.classList.remove("active-slot"));
            const activeSlot = document.getElementById(
                `slot-container-${index}`,
            );

            if (!activeSlot) {
                return;
            }

            activeSlot.classList.add("active-slot");
            const editorControls = document.getElementById("editorControls");
            if (editorControls) {
                editorControls.style.display = "flex";
            }

            const userImg = document.getElementById(`user-img-${index}`);
            if (!userImg) {
                return;
            }

            const brightnessSlider =
                document.getElementById("brightnessSlider");
            const scaleSlider = document.getElementById("scaleSlider");
            const rotateSlider = document.getElementById("rotateSlider");
            if (brightnessSlider)
                brightnessSlider.value = userImg.dataset.brightness || 100;
            if (scaleSlider) scaleSlider.value = userImg.dataset.scale || 1;
            if (rotateSlider) rotateSlider.value = userImg.dataset.rot || 0;

            initSlotMoveable(index, userImg);
        };

        const handlePhotoUpload = (event, index, slotW, slotH) => {
            const file = event.target.files?.[0];
            if (!file) {
                return;
            }

            const allowedTypes = [
                "image/jpeg",
                "image/jpg",
                "image/png",
                "image/webp",
                "image/heic",
            ];
            const allowedExts = ["jpg", "jpeg", "png", "webp", "heic"];
            const fileExt = file.name.split(".").pop().toLowerCase();
            const isAllowedType =
                allowedTypes.includes(file.type) || file.type === "";
            const isAllowedExt = allowedExts.includes(fileExt);

            if (!isAllowedType && !isAllowedExt) {
                if (typeof window.Swal !== "undefined") {
                    window.Swal.fire({
                        icon: "error",
                        title: "Format Tidak Didukung",
                        text: "Silakan pilih foto dengan format JPG, PNG, WEBP, atau HEIC.",
                        confirmButtonColor: "var(--primary)",
                    });
                }
                event.target.value = "";
                return;
            }

            const reader = new FileReader();
            reader.onload = (readEvent) => {
                const userImg = document.getElementById(`user-img-${index}`);
                const slotContainer = document.getElementById(
                    `slot-container-${index}`,
                );
                if (!userImg || !slotContainer) {
                    return;
                }

                slotContainer.classList.add("has-image");
                const placeholder =
                    slotContainer.querySelector(".placeholder-text");
                if (placeholder) {
                    placeholder.style.display = "none";
                }

                // Use optimized preview - lower quality for faster rendering
                userImg.src = readEvent.target.result;
                userImg.style.display = "block";
                userImg.style.loading = "lazy";

                userImg.onload = () => {
                    // Optimize initial layout calculation
                    requestAnimationFrame(() => {
                        const scale = Math.max(
                            slotW / userImg.naturalWidth,
                            slotH / userImg.naturalHeight,
                        );
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
                        initSlotMoveable(index, userImg);
                    });
                };
            };

            reader.readAsDataURL(file);
        };

        const renderSlots = (slots) => {
            const container = document.getElementById("slotsContainer");
            const fileInputs = document.getElementById("fileInputsContainer");
            if (!container || !fileInputs) {
                return;
            }

            container.innerHTML = "";
            fileInputs.innerHTML = "";

            slots.forEach((slot, i) => {
                const index = i + 1;
                const widthPx = (slot.width / 100) * editorWidth;
                const heightPx = (slot.height / 100) * editorHeight;
                const leftPx = (slot.left / 100) * editorWidth;
                const topPx = (slot.top / 100) * editorHeight;

                const slotEl = document.createElement("div");
                slotEl.className = "user-slot";
                slotEl.id = `slot-container-${index}`;
                slotEl.style.width = `${widthPx}px`;
                slotEl.style.height = `${heightPx}px`;
                slotEl.style.left = `${leftPx}px`;
                slotEl.style.top = `${topPx}px`;
                slotEl.style.transform = `rotate(${slot.rotate}deg)`;

                const placeholder = document.createElement("div");
                placeholder.className = "placeholder-text";
                placeholder.innerText = `FOTO ${index}`;
                slotEl.appendChild(placeholder);

                const imgContainer = document.createElement("div");
                imgContainer.className = "slot-image-container";
                const userImg = document.createElement("img");
                userImg.id = `user-img-${index}`;
                userImg.style.display = "none";
                imgContainer.appendChild(userImg);
                slotEl.appendChild(imgContainer);

                slotEl.onclick = () => {
                    if (slotEl.classList.contains("has-image")) {
                        setActiveSlot(index);
                        return;
                    }
                    const fileInput = document.getElementById(`file-${index}`);
                    if (fileInput) {
                        fileInput.click();
                    }
                };

                container.appendChild(slotEl);

                const fileInput = document.createElement("input");
                fileInput.type = "file";
                fileInput.id = `file-${index}`;
                fileInput.accept =
                    "image/jpeg, image/jpg, image/png, image/webp, .heic";
                fileInput.onchange = (event) =>
                    handlePhotoUpload(event, index, widthPx, heightPx);
                fileInputs.appendChild(fileInput);
            });
        };

        const initGlobalGestures = (wrapper) => {
            if (hammerManager) {
                hammerManager.destroy();
            }

            hammerManager = new window.Hammer.Manager(wrapper);
            const pinch = new window.Hammer.Pinch();
            const rotate = new window.Hammer.Rotate();
            const pan = new window.Hammer.Pan();

            pinch.recognizeWith(rotate);
            pinch.recognizeWith(pan);
            hammerManager.add([pinch, rotate, pan]);

            let startScale = 1;
            let startRot = 0;
            let startTx = 0;
            let startTy = 0;

            hammerManager.on("pinchstart rotatestart panstart", () => {
                if (!activeSlotIndex) {
                    return;
                }

                const target = document.getElementById(
                    `user-img-${activeSlotIndex}`,
                );
                if (!target) {
                    return;
                }

                startScale = parseFloat(target.dataset.scale) || 1;
                startRot = parseFloat(target.dataset.rot) || 0;
                startTx = parseFloat(target.dataset.tx) || 0;
                startTy = parseFloat(target.dataset.ty) || 0;
            });

            hammerManager.on("pinchmove rotatemove", (event) => {
                if (!activeSlotIndex) {
                    return;
                }

                const target = document.getElementById(
                    `user-img-${activeSlotIndex}`,
                );
                if (!target) {
                    return;
                }

                const newScale = startScale * event.scale;
                target.dataset.scale = Math.min(Math.max(newScale, 0.1), 5);
                const scaleSlider = document.getElementById("scaleSlider");
                const rotateSlider = document.getElementById("rotateSlider");
                if (scaleSlider) scaleSlider.value = target.dataset.scale;

                target.dataset.rot = startRot + event.rotation;
                if (rotateSlider) rotateSlider.value = target.dataset.rot;

                applyTransform(target);
                if (activeMoveable) {
                    activeMoveable.updateRect();
                }
            });

            hammerManager.on("panmove", (event) => {
                if (event.pointers.length < 2 || !activeSlotIndex) {
                    return;
                }

                const target = document.getElementById(
                    `user-img-${activeSlotIndex}`,
                );
                if (!target) {
                    return;
                }

                target.dataset.tx = startTx + event.deltaX;
                target.dataset.ty = startTy + event.deltaY;
                applyTransform(target);
                if (activeMoveable) {
                    activeMoveable.updateRect();
                }
            });
        };

        const initEditor = () => {
            const img = new Image();
            img.onload = () => {
                const container = document.querySelector(".upload-workspace");
                if (!container) {
                    return;
                }

                const containerWidth = container.getBoundingClientRect().width;
                const padding = window.innerWidth < 768 ? 32 : 80;
                const maxWidth = Math.min(containerWidth - padding, 500);
                if (maxWidth <= 0) {
                    return;
                }

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

                const wrapper = document.getElementById("editorWrapper");
                if (!wrapper) {
                    return;
                }
                wrapper.style.width = `${Math.floor(editorWidth)}px`;
                wrapper.style.height = `${Math.floor(editorHeight)}px`;

                initGlobalGestures(wrapper);
                renderSlots(layoutConfig);
            };

            img.src = frameImgUrl;
        };

        window.updateScale = (value) => {
            if (!activeSlotIndex) return;
            const target = document.getElementById(
                `user-img-${activeSlotIndex}`,
            );
            if (!target) return;
            target.dataset.scale = value;
            applyTransform(target);
            if (activeMoveable) activeMoveable.updateRect();
        };

        window.updateRotation = (value) => {
            if (!activeSlotIndex) return;
            const target = document.getElementById(
                `user-img-${activeSlotIndex}`,
            );
            if (!target) return;
            target.dataset.rot = value;
            applyTransform(target);
            if (activeMoveable) activeMoveable.updateRect();
        };

        window.rotateActiveSlot = (deg) => {
            if (!activeSlotIndex) return;
            const target = document.getElementById(
                `user-img-${activeSlotIndex}`,
            );
            if (!target) return;
            target.dataset.rot = parseFloat(target.dataset.rot || 0) + deg;
            applyTransform(target);
            if (activeMoveable) activeMoveable.updateRect();
        };

        window.flipActiveSlot = () => {
            if (!activeSlotIndex) return;
            const target = document.getElementById(
                `user-img-${activeSlotIndex}`,
            );
            if (!target) return;
            target.dataset.flipX = parseFloat(target.dataset.flipX || 1) * -1;
            applyTransform(target);
        };

        window.updateBrightness = (value) => {
            if (!activeSlotIndex) return;
            const target = document.getElementById(
                `user-img-${activeSlotIndex}`,
            );
            if (!target) return;
            target.dataset.brightness = value;
            applyTransform(target);
        };

        window.deleteActiveSlot = () => {
            if (!activeSlotIndex) return;
            const container = document.getElementById(
                `slot-container-${activeSlotIndex}`,
            );
            const img = document.getElementById(`user-img-${activeSlotIndex}`);
            if (!container || !img) return;

            container.classList.remove("has-image", "active-slot");
            const placeholder = container.querySelector(".placeholder-text");
            if (placeholder) placeholder.style.display = "block";
            img.src = "";
            img.style.display = "none";
            const file = document.getElementById(`file-${activeSlotIndex}`);
            if (file) file.value = "";
            if (activeMoveable) {
                activeMoveable.destroy();
                activeMoveable = null;
            }
            const editorControls = document.getElementById("editorControls");
            if (editorControls) editorControls.style.display = "none";
            activeSlotIndex = null;
        };

        window.cancelUpload = () => {
            if (currentXhr) {
                currentXhr.abort();
                currentXhr = null;
            }
            const loadingOverlay = document.getElementById("loadingOverlay");
            if (loadingOverlay) loadingOverlay.style.display = "none";
            window.alert("Proses upload dibatalkan.");
        };

        window.generateAndSubmit = async () => {
            const uploadForm = document.getElementById("uploadForm");
            if (!uploadForm || !uploadForm.reportValidity()) {
                return;
            }

            let allFilled = true;
            for (let i = 1; i <= layoutConfig.length; i += 1) {
                const img = document.getElementById(`user-img-${i}`);
                if (!img || img.style.display === "none") {
                    allFilled = false;
                    break;
                }
            }

            if (!allFilled) {
                window.alert("Silakan upload foto untuk semua slot.");
                return;
            }

            const loadingSpinner = document.getElementById("loadingSpinner");
            const loadingTitle = document.getElementById("loadingTitle");
            const progressContainer =
                document.getElementById("progressContainer");
            const loadingOverlay = document.getElementById("loadingOverlay");
            if (loadingSpinner) loadingSpinner.style.display = "block";
            if (loadingTitle) loadingTitle.innerText = "Menyatukan Foto...";
            if (progressContainer) progressContainer.style.display = "none";
            if (loadingOverlay) loadingOverlay.style.display = "flex";

            await new Promise((resolve) => window.setTimeout(resolve, 100));

            try {
                const frameImg = document.getElementById("frameBg");
                if (!frameImg) {
                    throw new Error("Frame image not found");
                }

                const targetLongSide = 2800;
                const aspect = frameImg.naturalWidth / frameImg.naturalHeight;
                let originalW;
                let originalH;

                if (frameImg.naturalWidth > frameImg.naturalHeight) {
                    originalW = targetLongSide;
                    originalH = originalW / aspect;
                } else {
                    originalH = targetLongSide;
                    originalW = originalH * aspect;
                }

                // Use OffscreenCanvas for faster background rendering if available
                const canvasClass =
                    typeof OffscreenCanvas !== "undefined"
                        ? OffscreenCanvas
                        : HTMLCanvasElement;
                const canvas =
                    canvasClass === OffscreenCanvas
                        ? new OffscreenCanvas(originalW, originalH)
                        : document.createElement("canvas");

                canvas.width = originalW;
                canvas.height = originalH;
                const ctx = canvas.getContext("2d");
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = "high";
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, originalW, originalH);

                layoutConfig.forEach((slot, i) => {
                    const index = i + 1;
                    const userImg = document.getElementById(
                        `user-img-${index}`,
                    );
                    if (!userImg) {
                        return;
                    }

                    ctx.save();
                    const slotX = (slot.left / 100) * originalW;
                    const slotY = (slot.top / 100) * originalH;
                    const slotW = (slot.width / 100) * originalW;
                    const slotH = (slot.height / 100) * originalH;

                    ctx.translate(slotX + slotW / 2, slotY + slotH / 2);
                    ctx.rotate((slot.rotate * Math.PI) / 180);
                    ctx.beginPath();
                    ctx.rect(-slotW / 2, -slotH / 2, slotW, slotH);
                    ctx.clip();

                    const tx = parseFloat(userImg.dataset.tx) || 0;
                    const ty = parseFloat(userImg.dataset.ty) || 0;
                    const rot = parseFloat(userImg.dataset.rot) || 0;
                    const scale = parseFloat(userImg.dataset.scale) || 1;
                    const flipX = parseFloat(userImg.dataset.flipX) || 1;
                    const brightness =
                        parseFloat(userImg.dataset.brightness) || 100;

                    ctx.filter = `brightness(${brightness}%)`;
                    const scaleRatio = originalW / editorWidth;
                    ctx.translate(tx * scaleRatio, ty * scaleRatio);
                    ctx.rotate((rot * Math.PI) / 180);
                    ctx.scale(flipX, 1);

                    const drawW =
                        parseFloat(userImg.style.width) * scaleRatio * scale;
                    const drawH =
                        parseFloat(userImg.style.height) * scaleRatio * scale;
                    ctx.drawImage(
                        userImg,
                        -slotW / 2,
                        -slotH / 2,
                        drawW,
                        drawH,
                    );

                    ctx.filter = "none";
                    ctx.restore();
                });

                ctx.drawImage(frameImg, 0, 0, originalW, originalH);

                if (loadingSpinner) loadingSpinner.style.display = "none";
                if (loadingTitle) loadingTitle.innerText = "Mengunggah...";
                if (progressContainer)
                    progressContainer.style.display = "block";

                // Use OffscreenCanvas.convertToBlob or regular canvas.toBlob
                const blobPromise =
                    canvas instanceof OffscreenCanvas
                        ? canvas.convertToBlob({
                              type: "image/jpeg",
                              quality: 0.92,
                          })
                        : new Promise((resolve) => {
                              canvas.toBlob(
                                  (blob) => resolve(blob),
                                  "image/jpeg",
                                  0.92,
                              );
                          });

                const blob = await blobPromise;
                const formData = new FormData(uploadForm);
                formData.append("final_photo_file", blob, "result.jpg");
                formData.set("final_photo", "binary_mode");

                // Use optimized upload with better error handling
                currentXhr = new XMLHttpRequest();
                currentXhr.open("POST", uploadForm.action, true);
                currentXhr.setRequestHeader(
                    "X-Requested-With",
                    "XMLHttpRequest",
                );
                currentXhr.timeout = 60000;

                currentXhr.upload.onprogress = (event) => {
                    if (!event.lengthComputable) {
                        return;
                    }
                    const pct = Math.floor((event.loaded / event.total) * 100);
                    const progressBar = document.getElementById("progressBar");
                    const progressText =
                        document.getElementById("progressText");
                    if (progressBar) progressBar.style.width = `${pct}%`;
                    if (progressText) progressText.innerText = `${pct}%`;
                };

                currentXhr.onload = () => {
                    if (currentXhr.status >= 200 && currentXhr.status < 300) {
                        const response = JSON.parse(currentXhr.responseText);
                        if (response.redirect_url) {
                            window.location.href = response.redirect_url;
                        } else {
                            window.location.reload();
                        }
                    } else {
                        window.alert("Gagal mengunggah foto.");
                        if (loadingOverlay)
                            loadingOverlay.style.display = "none";
                    }
                };

                currentXhr.onerror = () => {
                    window.alert("Koneksi terputus. Silakan coba lagi.");
                    if (loadingOverlay) loadingOverlay.style.display = "none";
                };

                currentXhr.ontimeout = () => {
                    window.alert("Upload timeout. Silakan coba lagi.");
                    if (loadingOverlay) loadingOverlay.style.display = "none";
                };

                currentXhr.send(formData);
            } catch (_error) {
                window.alert("Terjadi kesalahan proses gambar.");
                if (loadingOverlay) loadingOverlay.style.display = "none";
            }
        };

        initEditor();

        let lastWidth = window.innerWidth;
        const resizeHandler = () => {
            if (window.innerWidth === lastWidth) {
                return;
            }
            lastWidth = window.innerWidth;
            window.setTimeout(() => {
                initEditor();
            }, 300);
        };
        window.addEventListener("resize", resizeHandler);

        return () => {
            window.removeEventListener("resize", resizeHandler);
            delete window.updateScale;
            delete window.updateRotation;
            delete window.rotateActiveSlot;
            delete window.flipActiveSlot;
            delete window.updateBrightness;
            delete window.deleteActiveSlot;
            delete window.cancelUpload;
            delete window.generateAndSubmit;

            if (hammerManager) {
                hammerManager.destroy();
            }
            if (activeMoveable) {
                activeMoveable.destroy();
            }
        };
    }, [frameImgUrl, layoutConfig]);

    return null;
}
