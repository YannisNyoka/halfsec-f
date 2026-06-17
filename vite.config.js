import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      injectManifest: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
  },
      includeAssets: ['favicon.ico', 'halfsec.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Halfsec — Second Hand, First Class',
        short_name: 'Halfsec',
        description: 'Quality second-hand items at half the price.',
        theme_color: '#f5a623',
        background_color: '#0f0f0f',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png',
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        shortcuts: [
          {
            name: 'Shop',
            url: '/shop',
            icons: [{ src: 'pwa-96x96.png', sizes: '96x96' }],
          },
          {
            name: 'My Orders',
            url: '/orders',
            icons: [{ src: 'pwa-96x96.png', sizes: '96x96' }],
          },
        ],
        screenshots: [
          {
            src: 'screenshot-wide.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
          },
        ],
      },
      
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          // Cache API calls for products (stale-while-revalidate)
          {
            urlPattern: /^https:\/\/api\.halfsec\.co\.za\/api\/products/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-products',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Cache product images (cache first)
          {
            urlPattern: /^https:\/\/res\.cloudinary\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cloudinary-images',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Network first for auth/orders (always fresh)
          {
            urlPattern: /^https:\/\/api\.halfsec\.co\.za\/api\/(orders|auth|cart)/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-auth-orders',
              networkTimeoutSeconds: 10,
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  strategies: 'injectManifest',
  srcDir: 'src',
  filename: 'sw.js',
});