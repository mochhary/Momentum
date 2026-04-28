/**
 * Skeleton Screen Utility - Show loading placeholders while content loads
 */

export class SkeletonLoader {
    /**
     * Create a skeleton screen div
     */
    static createSkeleton(width = "100%", height = "20px", animated = true) {
        const div = document.createElement("div");
        div.className = "skeleton-loader";
        div.style.width = width;
        div.style.height = height;
        div.style.backgroundColor = "#e0e0e0";
        div.style.borderRadius = "4px";
        div.style.display = "inline-block";

        if (animated) {
            div.style.animation = "skeletonLoading 1.5s ease-in-out infinite";
            this.injectSkeletonCSS();
        }

        return div;
    }

    /**
     * Inject skeleton CSS animation
     */
    static injectSkeletonCSS() {
        if (document.getElementById("skeletonCss")) {
            return;
        }

        const style = document.createElement("style");
        style.id = "skeletonCss";
        style.textContent = `
            @keyframes skeletonLoading {
                0% {
                    background-color: #e0e0e0;
                }
                50% {
                    background-color: #f0f0f0;
                }
                100% {
                    background-color: #e0e0e0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Show skeleton in container, hide original content
     */
    static showSkeleton(containerId, skeletonCount = 3, itemHeight = "100px") {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.style.opacity = "0.6";
        container.style.pointerEvents = "none";

        for (let i = 0; i < skeletonCount; i++) {
            const skeleton = this.createSkeleton("100%", itemHeight);
            skeleton.style.marginBottom = "10px";
            container.appendChild(skeleton);
        }
    }

    /**
     * Hide skeleton and restore content
     */
    static hideSkeleton(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        document
            .querySelectorAll(`#${containerId} .skeleton-loader`)
            .forEach((el) => {
                el.remove();
            });

        container.style.opacity = "1";
        container.style.pointerEvents = "auto";
    }

    /**
     * Create table skeleton
     */
    static createTableSkeleton(rows = 5, cols = 4) {
        const table = document.createElement("table");
        table.style.width = "100%";

        for (let i = 0; i < rows; i++) {
            const tr = document.createElement("tr");
            for (let j = 0; j < cols; j++) {
                const td = document.createElement("td");
                td.style.padding = "10px";
                td.appendChild(this.createSkeleton("100%", "30px"));
                tr.appendChild(td);
            }
            table.appendChild(tr);
        }

        return table;
    }

    /**
     * Add loading state to button
     */
    static addLoadingState(buttonId, loadingText = "Loading...") {
        const btn = document.getElementById(buttonId);
        if (!btn) return;

        btn.disabled = true;
        btn.dataset.originalText = btn.textContent;
        btn.textContent = loadingText;
        btn.classList.add("loading");
    }

    /**
     * Remove loading state from button
     */
    static removeLoadingState(buttonId) {
        const btn = document.getElementById(buttonId);
        if (!btn) return;

        btn.disabled = false;
        btn.textContent = btn.dataset.originalText || "Submit";
        btn.classList.remove("loading");
    }
}

export default SkeletonLoader;
