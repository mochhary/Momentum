/**
 * Image Processor - Optimize photo rendering, compression, and canvas operations
 */

export class ImageProcessor {
    /**
     * Load image with lazy loading
     */
    static lazyLoadImage(imgElement, actualSrc) {
        if ("IntersectionObserver" in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = actualSrc;
                        img.onload = () => {
                            img.classList.add("loaded");
                        };
                        observer.unobserve(img);
                    }
                });
            });

            observer.observe(imgElement);
        } else {
            // Fallback
            imgElement.src = actualSrc;
        }
    }

    /**
     * Optimize canvas rendering with throttling
     */
    static throttledCanvasRender(renderFn, delayMs = 16) {
        let lastRender = 0;
        let scheduledRender = null;

        return () => {
            const now = Date.now();

            if (scheduledRender) {
                cancelAnimationFrame(scheduledRender);
            }

            if (now - lastRender >= delayMs) {
                renderFn();
                lastRender = now;
            } else {
                scheduledRender = requestAnimationFrame(() => {
                    renderFn();
                    lastRender = Date.now();
                });
            }
        };
    }

    /**
     * Render canvas with optimized resolution during editing
     */
    static optimizedCanvasRender(
        canvas,
        width,
        height,
        renderCallback,
        editMode = true,
    ) {
        const ctx = canvas.getContext("2d", { alpha: false });

        // Use lower resolution in edit mode for faster rendering
        const scale = editMode ? 0.5 : 1;
        const scaledWidth = Math.round(width * scale);
        const scaledHeight = Math.round(height * scale);

        canvas.width = scaledWidth;
        canvas.height = scaledHeight;

        ctx.scale(scale, scale);
        renderCallback(ctx);
    }

    /**
     * Create high-quality canvas at full resolution
     */
    static async createHighQualityCanvas(width, height, renderCallback) {
        return new Promise((resolve) => {
            // Use OffscreenCanvas if available for background processing
            if (typeof OffscreenCanvas !== "undefined") {
                const canvas = new OffscreenCanvas(width, height);
                const ctx = canvas.getContext("2d", { alpha: false });
                renderCallback(ctx);

                canvas
                    .convertToBlob({ type: "image/jpeg", quality: 0.95 })
                    .then((blob) => {
                        resolve(blob);
                    });
            } else {
                // Fallback to regular canvas
                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d", { alpha: false });
                renderCallback(ctx);

                canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.95);
            }
        });
    }

    /**
     * Batch load images with concurrent limit
     */
    static async batchLoadImages(urls, concurrentLimit = 4) {
        const results = [];
        const queue = [...urls.map((url, idx) => ({ url, idx }))];
        const loading = new Set();

        while (queue.length > 0 || loading.size > 0) {
            while (loading.size < concurrentLimit && queue.length > 0) {
                const item = queue.shift();
                const promise = this.loadImageAsBlob(item.url)
                    .then((blob) => {
                        results[item.idx] = blob;
                        loading.delete(promise);
                    })
                    .catch((error) => {
                        console.error(`Failed to load ${item.url}:`, error);
                        results[item.idx] = null;
                        loading.delete(promise);
                    });

                loading.add(promise);
            }

            if (loading.size > 0) {
                await Promise.race(loading);
            }
        }

        return results;
    }

    /**
     * Load image as blob
     */
    static loadImageAsBlob(url) {
        return fetch(url).then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return response.blob();
        });
    }

    /**
     * Generate thumbnail from image
     */
    static async generateThumbnail(file, maxWidth = 200, maxHeight = 200) {
        return new Promise((resolve) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    let width = img.width;
                    let height = img.height;

                    // Maintain aspect ratio
                    if (width > height) {
                        if (width > maxWidth) {
                            height = (height * maxWidth) / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width = (width * maxHeight) / height;
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob(
                        (blob) => {
                            const url = URL.createObjectURL(blob);
                            resolve(url);
                        },
                        "image/jpeg",
                        0.8,
                    );
                };

                img.src = e.target.result;
            };

            reader.readAsDataURL(file);
        });
    }

    /**
     * Debounce render operations
     */
    static debounceRender(renderFn, delayMs = 100) {
        let timeoutId = null;

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            timeoutId = setTimeout(() => {
                renderFn();
                timeoutId = null;
            }, delayMs);
        };
    }

    /**
     * Cache image in IndexedDB for offline access
     */
    static async cacheImageInDB(key, blob) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open("PhotoBoothCache", 1);

            request.onsuccess = (e) => {
                const db = e.target.result;
                const transaction = db.transaction(["images"], "readwrite");
                const store = transaction.objectStore("images");

                store.put({ key, blob, timestamp: Date.now() });

                transaction.oncomplete = () => resolve();
                transaction.onerror = () => reject(transaction.error);
            };

            request.onerror = () => reject(request.error);

            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains("images")) {
                    db.createObjectStore("images", { keyPath: "key" });
                }
            };
        });
    }

    /**
     * Retrieve image from cache
     */
    static async getCachedImage(key) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open("PhotoBoothCache", 1);

            request.onsuccess = (e) => {
                const db = e.target.result;
                const transaction = db.transaction(["images"], "readonly");
                const store = transaction.objectStore("images");
                const getRequest = store.get(key);

                getRequest.onsuccess = () => {
                    resolve(getRequest.result?.blob || null);
                };

                getRequest.onerror = () => reject(getRequest.error);
            };

            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Preload images for faster rendering
     */
    static preloadImages(urls) {
        urls.forEach((url) => {
            const link = document.createElement("link");
            link.rel = "preload";
            link.as = "image";
            link.href = url;
            document.head.appendChild(link);
        });
    }

    /**
     * Create image sprite sheet for faster batch rendering
     */
    static async createSpriteSheet(images, columns = 4) {
        const cols = columns;
        const rows = Math.ceil(images.length / cols);
        const imgWidth = 256;
        const imgHeight = 256;

        const canvas = document.createElement("canvas");
        canvas.width = cols * imgWidth;
        canvas.height = rows * imgHeight;
        const ctx = canvas.getContext("2d");

        for (let i = 0; i < images.length; i++) {
            const row = Math.floor(i / cols);
            const col = i % cols;
            const x = col * imgWidth;
            const y = row * imgHeight;

            ctx.drawImage(images[i], x, y, imgWidth, imgHeight);
        }

        return new Promise((resolve) => {
            canvas.toBlob(
                (blob) => {
                    resolve({
                        blob,
                        layout: {
                            cols,
                            rows,
                            width: imgWidth,
                            height: imgHeight,
                        },
                    });
                },
                "image/jpeg",
                0.9,
            );
        });
    }
}

export default ImageProcessor;
