/**
 * Upload Optimizer - Chunked, parallel, resumable uploads with progress tracking
 */

export class UploadOptimizer {
    /**
     * Chunked upload with parallel streams
     * @param {File} file - File to upload
     * @param {string} uploadUrl - API endpoint for upload
     * @param {Function} onProgress - Progress callback
     * @param {Object} options - Upload options
     */
    static async uploadChunked(
        file,
        uploadUrl,
        onProgress = () => {},
        options = {},
    ) {
        const {
            chunkSize = 1024 * 1024, // 1MB
            parallelChunks = 3,
            maxRetries = 3,
            timeout = 30000,
        } = options;

        const totalChunks = Math.ceil(file.size / chunkSize);
        const uploadId = this.generateUploadId();
        const chunks = [];
        let uploadedBytes = 0;
        let completedChunks = 0;

        // Create chunk info
        for (let i = 0; i < totalChunks; i++) {
            const start = i * chunkSize;
            const end = Math.min(start + chunkSize, file.size);
            chunks.push({
                index: i,
                start,
                end,
                blob: file.slice(start, end),
                retries: 0,
                status: "pending",
            });
        }

        try {
            // Upload chunks in parallel
            await this.uploadChunksParallel(
                chunks,
                uploadUrl,
                uploadId,
                file.name,
                totalChunks,
                timeout,
                maxRetries,
                (bytesUploaded) => {
                    uploadedBytes = bytesUploaded;
                    onProgress({
                        loaded: uploadedBytes,
                        total: file.size,
                        percent: Math.round((uploadedBytes / file.size) * 100),
                        completedChunks,
                        totalChunks,
                    });
                },
            );

            // Complete upload
            const response = await fetch(
                `${uploadUrl}?uploadId=${uploadId}&complete=1`,
                {
                    method: "POST",
                    headers: {
                        "X-Requested-With": "XMLHttpRequest",
                    },
                },
            );

            if (!response.ok) {
                throw new Error("Upload completion failed");
            }

            return await response.json();
        } catch (error) {
            console.error("Upload failed:", error);
            throw error;
        }
    }

    /**
     * Upload chunks in parallel with queue
     */
    static async uploadChunksParallel(
        chunks,
        uploadUrl,
        uploadId,
        fileName,
        totalChunks,
        timeout,
        maxRetries,
        onProgress,
    ) {
        const queue = [...chunks];
        const uploading = new Set();
        const completed = new Map();

        while (queue.length > 0 || uploading.size > 0) {
            // Fill upload slots
            while (uploading.size < 3 && queue.length > 0) {
                const chunk = queue.shift();
                const promise = this.uploadChunk(
                    chunk,
                    uploadUrl,
                    uploadId,
                    fileName,
                    totalChunks,
                    timeout,
                    maxRetries,
                )
                    .then((result) => {
                        completed.set(chunk.index, result);
                        chunk.status = "completed";
                        uploading.delete(promise);

                        // Calculate uploaded bytes
                        let uploadedBytes = 0;
                        for (let i = 0; i < totalChunks; i++) {
                            if (completed.has(i)) {
                                uploadedBytes += chunks[i].blob.size;
                            }
                        }

                        onProgress(uploadedBytes);
                    })
                    .catch((error) => {
                        if (chunk.retries < maxRetries) {
                            chunk.retries++;
                            queue.push(chunk);
                        } else {
                            throw error;
                        }
                        uploading.delete(promise);
                    });

                uploading.add(promise);
            }

            // Wait for any to complete
            if (uploading.size > 0) {
                await Promise.race(uploading);
            }
        }

        return completed;
    }

    /**
     * Upload single chunk
     */
    static async uploadChunk(
        chunk,
        uploadUrl,
        uploadId,
        fileName,
        totalChunks,
        timeout,
        maxRetries,
    ) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            xhr.open("POST", uploadUrl);
            xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            xhr.setRequestHeader("X-Upload-Id", uploadId);
            xhr.setRequestHeader("X-Chunk-Index", chunk.index);
            xhr.setRequestHeader("X-Total-Chunks", totalChunks);
            xhr.setRequestHeader("X-File-Name", encodeURIComponent(fileName));

            xhr.onload = () => {
                clearTimeout(timeoutId);
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    reject(new Error(`HTTP ${xhr.status}`));
                }
            };

            xhr.onerror = () => {
                clearTimeout(timeoutId);
                reject(new Error("Upload failed"));
            };

            xhr.ontimeout = () => {
                clearTimeout(timeoutId);
                reject(new Error("Upload timeout"));
            };

            xhr.send(chunk.blob);
        });
    }

    /**
     * Simple direct upload (for small files)
     */
    static async uploadDirect(file, uploadUrl, onProgress = () => {}) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const formData = new FormData();
            formData.append("file", file);

            xhr.upload.addEventListener("progress", (e) => {
                if (e.lengthComputable) {
                    onProgress({
                        loaded: e.loaded,
                        total: e.total,
                        percent: Math.round((e.loaded / e.total) * 100),
                    });
                }
            });

            xhr.addEventListener("load", () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    reject(new Error(`HTTP ${xhr.status}`));
                }
            });

            xhr.addEventListener("error", () => {
                reject(new Error("Upload failed"));
            });

            xhr.open("POST", uploadUrl);
            xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            xhr.send(formData);
        });
    }

    /**
     * Compress image before upload
     */
    static async compressImage(file, options = {}) {
        const { maxWidth = 2800, maxHeight = 4000, quality = 0.85 } = options;

        return new Promise((resolve) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    let width = img.width;
                    let height = img.height;

                    // Calculate new dimensions
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
                            const compressedFile = new File([blob], file.name, {
                                type: "image/jpeg",
                                lastModified: file.lastModified,
                            });

                            // Compression ratio
                            const ratio = Math.round(
                                (blob.size / file.size) * 100,
                            );

                            resolve({
                                file: compressedFile,
                                originalSize: file.size,
                                compressedSize: blob.size,
                                ratio,
                            });
                        },
                        "image/jpeg",
                        quality,
                    );
                };

                img.src = e.target.result;
            };

            reader.readAsDataURL(file);
        });
    }

    /**
     * Generate unique upload ID
     */
    static generateUploadId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}

export default UploadOptimizer;
