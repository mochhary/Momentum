/**
 * Loading State Manager - Coordinate loading indicators across the app
 */

export class LoadingStateManager {
    static activeLoads = new Map();
    static globalLoadingElement = null;

    /**
     * Start loading operation
     */
    static startLoading(operationId, options = {}) {
        const {
            showGlobal = false,
            message = "Loading...",
            timeout = 0,
        } = options;

        if (!this.activeLoads.has(operationId)) {
            this.activeLoads.set(operationId, {
                startTime: Date.now(),
                timeout: timeout ? Date.now() + timeout : null,
            });
        }

        if (showGlobal) {
            this.showGlobalLoader(message);
        }

        // Auto-hide if timeout specified
        if (timeout > 0) {
            setTimeout(() => {
                this.stopLoading(operationId);
            }, timeout);
        }
    }

    /**
     * Stop loading operation
     */
    static stopLoading(operationId) {
        this.activeLoads.delete(operationId);

        // Hide global loader if no more active loads
        if (this.activeLoads.size === 0) {
            this.hideGlobalLoader();
        }
    }

    /**
     * Show global loading indicator
     */
    static showGlobalLoader(message = "Loading...") {
        if (!this.globalLoadingElement) {
            this.globalLoadingElement = document.createElement("div");
            this.globalLoadingElement.id = "globalLoadingIndicator";
            this.globalLoadingElement.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                height: 3px;
                background: linear-gradient(to right, #3498db, #2ecc71);
                z-index: 10000;
                animation: slideIn 0.3s ease;
            `;

            const style = document.createElement("style");
            style.textContent = `
                @keyframes slideIn {
                    from { width: 0; }
                    to { width: 30%; }
                }
                @keyframes loadProgress {
                    0% { width: 0; }
                    50% { width: 70%; }
                    100% { width: 100%; }
                }
                #globalLoadingIndicator {
                    animation: loadProgress 2s ease-in-out infinite;
                }
            `;
            document.head.appendChild(style);
            document.body.appendChild(this.globalLoadingElement);
        }

        this.globalLoadingElement.style.display = "block";
    }

    /**
     * Hide global loading indicator
     */
    static hideGlobalLoader() {
        if (this.globalLoadingElement) {
            this.globalLoadingElement.style.display = "none";
        }
    }

    /**
     * Track fetch requests automatically
     */
    static trackFetch() {
        const originalFetch = window.fetch;

        window.fetch = function (...args) {
            const operationId = `fetch-${Date.now()}-${Math.random()}`;
            LoadingStateManager.startLoading(operationId, { showGlobal: true });

            return originalFetch.apply(this, args).finally(() => {
                LoadingStateManager.stopLoading(operationId);
            });
        };
    }

    /**
     * Track XMLHttpRequest automatically
     */
    static trackXHR() {
        const originalXHR = window.XMLHttpRequest;

        window.XMLHttpRequest = function () {
            const xhr = new originalXHR();
            const operationId = `xhr-${Date.now()}-${Math.random()}`;

            const originalOpen = xhr.open;
            xhr.open = function (...args) {
                LoadingStateManager.startLoading(operationId, {
                    showGlobal: true,
                });
                return originalOpen.apply(this, args);
            };

            const originalSend = xhr.send;
            xhr.send = function (...args) {
                xhr.addEventListener("loadend", () => {
                    LoadingStateManager.stopLoading(operationId);
                });
                return originalSend.apply(this, args);
            };

            return xhr;
        };

        Object.setPrototypeOf(window.XMLHttpRequest, originalXHR);
        Object.setPrototypeOf(
            window.XMLHttpRequest.prototype,
            originalXHR.prototype,
        );
    }

    /**
     * Enable automatic request tracking
     */
    static enableAutoTracking() {
        this.trackFetch();
        this.trackXHR();
    }

    /**
     * Get loading statistics
     */
    static getStats() {
        let slowestOperation = null;
        let maxDuration = 0;

        this.activeLoads.forEach((info, id) => {
            const duration = Date.now() - info.startTime;
            if (duration > maxDuration) {
                maxDuration = duration;
                slowestOperation = id;
            }
        });

        return {
            activeLoadCount: this.activeLoads.size,
            slowestOperation,
            slowestDuration: maxDuration,
        };
    }
}

export default LoadingStateManager;
