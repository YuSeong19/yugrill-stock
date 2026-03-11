import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'generateSW',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.firebaseio\.com\/.*/i,
            handler: 'NetworkFirst',
            options: { cacheName: 'firebase-realtime', networkTimeoutSeconds: 10 },
          },
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
      includeAssets: ['icon-*.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'YuGrill Stock',
        short_name: 'YuGrill',
        description: 'ระบบจัดการสต๊อคร้าน YuGrill',
        theme_color: '#e8a020',
        background_color: '#1c1c1c',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        lang: 'th',
        icons: [
          { src: 'icon-72x72.png',   sizes: '72x72',   type: 'image/png', purpose: 'any maskable' },
          { src: 'icon-96x96.png',   sizes: '96x96',   type: 'image/png', purpose: 'any maskable' },
          { src: 'icon-128x128.png', sizes: '128x128', type: 'image/png', purpose: 'any maskable' },
          { src: 'icon-144x144.png', sizes: '144x144', type: 'image/png', purpose: 'any maskable' },
          { src: 'icon-152x152.png', sizes: '152x152', type: 'image/png', purpose: 'any maskable' },
          { src: 'icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: 'icon-384x384.png', sizes: '384x384', type: 'image/png', purpose: 'any maskable' },
          { src: 'icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
        shortcuts: [
          { name: 'สต๊อค', short_name: 'สต๊อค', url: '/?page=stock', icons: [{ src: 'icon-96x96.png', sizes: '96x96' }] },
          { name: 'ประวัติ', short_name: 'ประวัติ', url: '/?page=log', icons: [{ src: 'icon-96x96.png', sizes: '96x96' }] },
        ],
      },
    }),
  ],
})
