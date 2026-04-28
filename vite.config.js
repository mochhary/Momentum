import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [
        laravel({
            input: ["resources/css/app.css", "resources/js/app.js"],
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    server: {
        watch: {
            ignored: ["**/storage/framework/views/**"],
        },
    },
    build: {
        // Code splitting for better caching
        rollupOptions: {
            output: {
                // Automatic chunking for node_modules
                manualChunks: {
                    // React vendor in separate chunk
                    vendor: ["react", "react-dom"],
                },
            },
        },
        // Use esbuild (default, built-in)
        minify: "esbuild",
        // Enable CSS code splitting
        cssCodeSplit: true,
        // Increase chunk size warning limit
        chunkSizeWarningLimit: 500,
        // Source maps for production debugging
        sourcemap: false,
    },
    // Optimize dependencies
    optimizeDeps: {
        include: ["react", "react-dom"],
    },
});
