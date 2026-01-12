// https://vite.dev/config/
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
    plugins: [react()],
    build: {
        outDir: path.resolve(__dirname, "../backend/dist"),
        emptyOutDir: true,
    },
    server: {
        proxy: {
            "/api": {
                target: "http://localhost:3001",
                changeOrigin: true,
            },
            "/auth": {
                target: "http://localhost:3001",
                changeOrigin: true,
            },
        },
    },
});
