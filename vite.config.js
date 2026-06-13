import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true
      },
      includeAssets: ['favicon.svg', 'icon-192x192.png', 'icon-512x512.png'],
      manifest: {
        name: 'Rhythmix',
        short_name: 'Rhythmix',
        description: 'Premium mood-based music player powered by Cloudinary',
        theme_color: '#07070a',
        background_color: '#07070a',
        display: 'standalone',
        orientation: 'portrait-primary',
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  server: {
    host: true,
    watch: {
      ignored: ['**/backend/**']
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      }
    }
  }
})
