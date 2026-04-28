/**
 * AJAX Page Loader - Replaces full page reloads with fast AJAX transitions
 * Maintains smooth UX without losing state
 */

const pageCache = new Map();
const CACHE_DURATION = 60000; // 1 minute

export class PageLoader {
    static isLoading = false;
    static currentUrl = window.location.pathname;

    /**
     * Load a page via AJAX without full reload
     */
    static async loadPage(url, options = {}) {
        if (this.isLoading) return false;
        this.isLoading = true;

        const showSpinner = options.showSpinner !== false;

        try {
            // Show spinner
            if (showSpinner) {
                this.showLoadingSpinner();
            }

            // Check cache
            const cached = this.getFromCache(url);
            if (cached) {
                this.renderPage(cached, url);
                this.isLoading = false;
                return true;
            }

            // Fetch page
            const response = await fetch(url, {
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const html = await response.text();

            // Cache result
            this.saveToCache(url, html);

            // Render page
            this.renderPage(html, url);
            return true;
        } catch (error) {
            console.error("Page load failed:", error);
            // Fallback to full reload
            window.location.href = url;
            return false;
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Prefetch a page for faster loading
     */
    static prefetch(url) {
        if (pageCache.has(url)) return;

        fetch(url, {
            headers: { "X-Requested-With": "XMLHttpRequest" },
        })
            .then((r) => r.text())
            .then((html) => this.saveToCache(url, html))
            .catch(() => {}); // Silent fail for prefetch
    }

    /**
     * Render fetched page HTML
     */
    static renderPage(html, url) {
        try {
            const parser = new DOMParser();
            const newDoc = parser.parseFromString(html, "text/html");

            // Update main content
            const newContent = newDoc.querySelector(
                "main, [role='main'], .container",
            );
            const currentContent = document.querySelector(
                "main, [role='main'], .container",
            );

            if (newContent && currentContent) {
                // Add fade-out
                currentContent.style.opacity = "0.5";
                currentContent.style.transition = "opacity 0.2s";

                // Replace content
                setTimeout(() => {
                    currentContent.innerHTML = newContent.innerHTML;
                    currentContent.style.opacity = "1";

                    // Update title
                    const newTitle = newDoc.querySelector("title");
                    if (newTitle) {
                        document.title = newTitle.textContent;
                    }

                    // Update meta tags
                    this.updateMetaTags(newDoc);

                    // Update URL
                    window.history.pushState(
                        { url, timestamp: Date.now() },
                        "",
                        url,
                    );

                    this.currentUrl = url;

                    // Scroll to top
                    window.scrollTo({ top: 0, behavior: "smooth" });

                    // Re-mount islands
                    this.remountIslands();

                    // Remove spinner
                    this.hideLoadingSpinner();
                }, 200);
            }
        } catch (error) {
            console.error("Render failed:", error);
            window.location.href = url;
        }
    }

    /**
     * Update meta tags from new page
     */
    static updateMetaTags(newDoc) {
        const newMeta = newDoc.querySelectorAll("meta");
        newMeta.forEach((meta) => {
            const name =
                meta.getAttribute("name") || meta.getAttribute("property");
            const existing = document.querySelector(
                `meta[name="${name}"], meta[property="${name}"]`,
            );
            if (existing) {
                existing.setAttribute("content", meta.getAttribute("content"));
            }
        });
    }

    /**
     * Re-mount React islands after page load
     */
    static remountIslands() {
        if (window.mountIslands) {
            window.mountIslands();
        }
    }

    /**
     * Get page from cache
     */
    static getFromCache(url) {
        const cached = pageCache.get(url);
        if (!cached) return null;

        // Check if expired
        if (Date.now() - cached.timestamp > CACHE_DURATION) {
            pageCache.delete(url);
            return null;
        }

        return cached.html;
    }

    /**
     * Save page to cache
     */
    static saveToCache(url, html) {
        pageCache.set(url, {
            html,
            timestamp: Date.now(),
        });
    }

    /**
     * Clear cache
     */
    static clearCache() {
        pageCache.clear();
    }

    /**
     * Show loading spinner
     */
    static showLoadingSpinner() {
        let spinner = document.getElementById("pageLoadSpinner");
        if (!spinner) {
            spinner = document.createElement("div");
            spinner.id = "pageLoadSpinner";
            spinner.innerHTML = `
                <div style="
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    z-index: 9999;
                    pointer-events: none;
                ">
                    <div style="
                        width: 40px;
                        height: 40px;
                        border: 3px solid #f3f3f3;
                        border-top: 3px solid #3498db;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                    "></div>
                </div>
                <style>
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            `;
            document.body.appendChild(spinner);
        }
        spinner.style.display = "block";
    }

    /**
     * Hide loading spinner
     */
    static hideLoadingSpinner() {
        const spinner = document.getElementById("pageLoadSpinner");
        if (spinner) {
            spinner.style.display = "none";
        }
    }

    /**
     * Setup navigation hijacking
     */
    static init() {
        // Hijack all internal links
        document.addEventListener("click", (e) => {
            const link = e.target.closest("a");
            if (
                !link ||
                link.target === "_blank" ||
                link.hasAttribute("download")
            ) {
                return;
            }

            const href = link.getAttribute("href");
            if (!href || href.startsWith("http") || href.startsWith("//")) {
                return;
            }

            e.preventDefault();
            this.loadPage(href);
        });

        // Handle browser back/forward
        window.addEventListener("popstate", (e) => {
            if (e.state && e.state.url) {
                this.loadPage(e.state.url, { showSpinner: true });
            }
        });
    }
}

export default PageLoader;
