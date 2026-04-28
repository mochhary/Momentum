/**
 * Navigation Prefetcher - Anticipate user navigation and prefetch pages
 */

export class NavigationPrefetcher {
    static prefetchedUrls = new Set();

    /**
     * Prefetch a URL for faster loading
     */
    static prefetch(url) {
        if (this.prefetchedUrls.has(url)) {
            return;
        }

        if (window.PageLoader) {
            window.PageLoader.prefetch(url);
            this.prefetchedUrls.add(url);
        }
    }

    /**
     * Prefetch on hover - anticipate user will click
     */
    static enableHoverPrefetch(selector = "a") {
        document.addEventListener("mouseover", (e) => {
            const link = e.target.closest(selector);
            if (!link) return;

            const href = link.getAttribute("href");
            if (
                href &&
                !href.startsWith("http") &&
                !href.startsWith("//") &&
                !link.hasAttribute("download")
            ) {
                this.prefetch(href);
            }
        });
    }

    /**
     * Prefetch next logical pages based on current page
     */
    static prefetchNextPages() {
        const pathname = window.location.pathname;

        // Define prefetch sequences
        const sequences = {
            "/booth": ["/upload", "/booth/payment"],
            "/upload": ["/booth/print", "/booth"],
            "/admin": ["/admin/frames", "/admin/dashboard"],
            "/admin/dashboard": ["/admin/frames"],
            "/admin/frames": ["/admin/dashboard"],
        };

        const nextPages = sequences[pathname] || [];
        nextPages.forEach((page) => this.prefetch(page));
    }

    /**
     * Prefetch on page idle (after 3 seconds)
     */
    static enableIdlePrefetch(urls = [], delayMs = 3000) {
        let idleTimer = null;
        let isActive = true;

        const resetTimer = () => {
            if (idleTimer) clearTimeout(idleTimer);
            isActive = false;

            idleTimer = setTimeout(() => {
                if (!isActive) {
                    urls.forEach((url) => this.prefetch(url));
                }
            }, delayMs);
        };

        document.addEventListener("mousedown", resetTimer, true);
        document.addEventListener("keypress", resetTimer, true);
        document.addEventListener("scroll", resetTimer, true);
        document.addEventListener("touchstart", resetTimer, true);

        // Start timer
        resetTimer();
    }

    /**
     * Prefetch links on page based on rel="prefetch"
     */
    static autoPrefetch() {
        const links = document.querySelectorAll('link[rel="prefetch"]');
        links.forEach((link) => {
            const href = link.getAttribute("href");
            if (href) {
                this.prefetch(href);
            }
        });

        // Also prefetch data-prefetch attributes
        const elementsWithPrefetch =
            document.querySelectorAll("[data-prefetch]");
        elementsWithPrefetch.forEach((el) => {
            const href = el.getAttribute("data-prefetch");
            if (href) {
                this.prefetch(href);
            }
        });
    }

    /**
     * Enable all prefetch strategies
     */
    static init() {
        this.enableHoverPrefetch();
        this.prefetchNextPages();
        this.autoPrefetch();
        this.enableIdlePrefetch(["/"], 5000);
    }
}

export default NavigationPrefetcher;
