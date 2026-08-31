import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
    plugins: [
        vue(),
        tailwindcss(),
        VitePWA({
            registerType: 'autoUpdate',
            workbox: {
                globPatterns: ['**/*.{js,css,html,svg,woff2,mjs}'],
                maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,

            },
            manifest: {
                name: 'PDF 工具箱 - i41 浏览器端 PDF 工具',
                short_name: 'PDF 工具箱',
                description: '免费、隐私优先的浏览器端 PDF 工具箱，文件无需上传。',
                theme_color: '#1e3a5f',
                background_color: '#f9fafb',
                display: 'standalone',
                start_url: './',
                scope: './',
                icons: [
                    { src: './icons/icon-192.png', sizes: '192x192', type: 'image/png' },
                    { src: './icons/icon-512.png', sizes: '512x512', type: 'image/png' },
                    { src: './icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
                ],
            },
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'resources/js'),
        },
    },
    base: './',
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    'pdf-lib': ['pdf-lib'],
                    'pdfjs': ['pdfjs-dist'],
                    'vendor': ['jszip', 'file-saver'],
                },
            },
        },
    },
});
