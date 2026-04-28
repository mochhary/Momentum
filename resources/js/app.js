import "./bootstrap";
import "./hydrate";
import PageLoader from "./utils/pageLoader.js";
import NavigationPrefetcher from "./utils/navigationPrefetcher.js";
import LoadingStateManager from "./utils/loadingStateManager.js";
import SkeletonLoader from "./utils/skeletonLoader.js";
import UploadOptimizer from "./utils/uploadOptimizer.js";
import ImageProcessor from "./utils/imageProcessor.js";

// Initialize performance utilities
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPerformanceTools);
} else {
    initPerformanceTools();
}

function initPerformanceTools() {
    // Enable AJAX page navigation
    PageLoader.init();
    window.PageLoader = PageLoader;
    window.pageLoaderAvailable = true;

    // Enable navigation prefetching
    NavigationPrefetcher.init();
    window.NavigationPrefetcher = NavigationPrefetcher;

    // Enable loading state tracking
    LoadingStateManager.enableAutoTracking();
    window.LoadingStateManager = LoadingStateManager;

    // Make utilities globally available
    window.SkeletonLoader = SkeletonLoader;
    window.UploadOptimizer = UploadOptimizer;
    window.ImageProcessor = ImageProcessor;

    // Log performance ready
    console.log("✓ Performance optimizations loaded");
}
