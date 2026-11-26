/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const alias = (path: string) => fileURLToPath(new URL(path, import.meta.url))

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Jimy',
        short_name: 'Jimy',
        description: 'Tu compañero de gym: registrá tus series y mirá tu evolución.',
        lang: 'es-AR',
        theme_color: '#0E1020',
        background_color: '#0E1020',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@domain': alias('./src/domain'),
      '@application': alias('./src/application'),
      '@infrastructure': alias('./src/infrastructure'),
      '@presentation': alias('./src/presentation'),
      '@composition': alias('./src/composition'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: false,
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
