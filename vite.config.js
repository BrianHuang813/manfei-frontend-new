import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'
import Sitemap from 'vite-plugin-sitemap'

// All public (indexable) routes – exclude auth, admin, staff, and dynamic :id pages
const dynamicRoutes = [
  '/about',
  '/services',
  '/brands',
  '/news',
]

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    ViteImageOptimizer({
      png: { quality: 80 },
      jpeg: { quality: 80 },
      webp: { quality: 80 },
      avif: { quality: 70 },
    }),
    Sitemap({
      hostname: 'https://www.manfeispa.com',
      dynamicRoutes,
      exclude: ['/auth', '/auth/callback', '/login', '/register', '/staff', '/admin'],
      robots: [
        {
          userAgent: '*',
          allow: '/',
          disallow: ['/admin', '/staff', '/auth'],
          sitemap: 'https://www.manfeispa.com/sitemap.xml',
        },
      ],
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('framer-motion')) return 'vendor-framer'
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) return 'vendor-react'
            return 'vendor'
          }
        },
      },
    },
  },
})
