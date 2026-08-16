import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'
import Sitemap from 'vite-plugin-sitemap'

// All public (indexable) routes – exclude auth, admin, staff, and dynamic :id pages
const staticRoutes = [
  '/about',
  '/services',
  '/brands',
  '/news',
]

/**
 * Ask the API for the news posts and products that should appear in the
 * sitemap. The build must never fail because the backend is unreachable, so
 * every error path degrades to the static routes alone and says so.
 */
async function fetchDetailRoutes(base) {
  if (!base) {
    console.warn('[sitemap] VITE_API_URL is not set — detail pages omitted.')
    return []
  }

  const get = async (path) => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 10000)
    try {
      const res = await fetch(`${base}${path}`, { signal: controller.signal })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.json()
    } finally {
      clearTimeout(timer)
    }
  }

  try {
    const [news, products] = await Promise.all([
      get('/api/public/news?limit=500'),
      get('/api/public/products'),
    ])
    const routes = [
      ...(Array.isArray(news) ? news : []).map((n) => `/news/${n.id}`),
      ...(Array.isArray(products) ? products : []).map((p) => `/products/${p.id}`),
    ]
    console.log(`[sitemap] added ${routes.length} detail pages.`)
    return routes
  } catch (err) {
    console.warn(`[sitemap] could not reach the API (${err.message}) — detail pages omitted.`)
    return []
  }
}

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  // loadEnv also reads .env files, which process.env alone does not.
  const env = { ...process.env, ...loadEnv(mode, process.cwd(), '') }
  const detailRoutes = await fetchDetailRoutes(env.VITE_API_URL)

  return {
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
      dynamicRoutes: [...staticRoutes, ...detailRoutes],
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
  }
})
