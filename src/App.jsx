import { lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useSiteSettings } from './contexts/SiteSettingsContext'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import PageTransition from './components/PageTransition'

// Layouts
import PublicLayout from './layouts/PublicLayout'

// Pages (Lazy-loaded)
const Home = lazy(() => import('./pages/Home'))
const News = lazy(() => import('./pages/News'))
const NewsDetail = lazy(() => import('./pages/NewsDetail'))
const Auth = lazy(() => import('./pages/Auth'))
const AuthCallback = lazy(() => import('./pages/AuthCallback'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Staff = lazy(() => import('./pages/Staff'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Services = lazy(() => import('./pages/Services'))
const Brands = lazy(() => import('./pages/Brands'))
const About = lazy(() => import('./pages/About'))
const NotFound = lazy(() => import('./pages/NotFound'))

// Admin Layout & Pages
import AdminLayout from './layouts/AdminLayout'
const Dashboard = lazy(() => import('./pages/Admin').then((m) => ({ default: m.Dashboard })))
const NewsManagement = lazy(() => import('./pages/Admin').then((m) => ({ default: m.NewsManagement })))
const ServicesManagement = lazy(() => import('./pages/Admin').then((m) => ({ default: m.ServicesManagement })))
const ProductsManagement = lazy(() => import('./pages/Admin').then((m) => ({ default: m.ProductsManagement })))
const TestimonialsManagement = lazy(() => import('./pages/Admin').then((m) => ({ default: m.TestimonialsManagement })))
const PortfolioManagement = lazy(() => import('./pages/Admin').then((m) => ({ default: m.PortfolioManagement })))
const StaffLogs = lazy(() => import('./pages/Admin').then((m) => ({ default: m.StaffLogs })))
const SettingsPlaceholder = lazy(() => import('./pages/Admin').then((m) => ({ default: m.SettingsPlaceholder })))
const Users = lazy(() => import('./pages/admin/Users'))

function App() {
  const location = useLocation()
  const settings = useSiteSettings()

  return (
    <AuthProvider>
      {/* Global fallback SEO meta — page-level <Helmet> overrides these */}
      <Helmet>
        <title>{settings.meta_title || '嬛霁 SPA | 專業美容護理'}</title>
        <meta
          name="description"
          content={settings.meta_description || '嬛霁 SPA - 專業美容護理服務'}
        />
      </Helmet>

      <AnimatePresence mode="wait">
        <Suspense
          fallback={(
            <div className="min-h-screen flex items-center justify-center text-[#A89070] font-serif tracking-widest">
              Loading...
            </div>
          )}
        >
          <Routes location={location} key={location.pathname}>
            {/* Public Routes with Navbar + Footer */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<PageTransition><Home /></PageTransition>} />
              <Route path="/news" element={<PageTransition><News /></PageTransition>} />
              <Route path="/news/:id" element={<PageTransition><NewsDetail /></PageTransition>} />
              <Route path="/products/:id" element={<PageTransition><ProductDetail /></PageTransition>} />
              <Route path="/services" element={<PageTransition><Services /></PageTransition>} />
              <Route path="/brands" element={<PageTransition><Brands /></PageTransition>} />
              <Route path="/about" element={<PageTransition><About /></PageTransition>} />
            </Route>

            <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
            <Route path="/auth/callback" element={<PageTransition><AuthCallback /></PageTransition>} />
            <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
            <Route path="/register" element={<PageTransition><Register /></PageTransition>} />

            {/* Protected Staff Route */}
            <Route
              path="/staff"
              element={
                <ProtectedRoute allowedRoles={['staff', 'admin']}>
                  <Staff />
                </ProtectedRoute>
              }
            />

            {/* Protected Admin Routes with Layout */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="news" element={<NewsManagement />} />
              <Route path="services" element={<ServicesManagement />} />
              <Route path="products" element={<ProductsManagement />} />
              <Route path="testimonials" element={<TestimonialsManagement />} />
              <Route path="portfolio" element={<PortfolioManagement />} />
              <Route path="staff-logs" element={<StaffLogs />} />
              <Route path="settings" element={<SettingsPlaceholder />} />
            </Route>

            {/* 404 Not Found */}
            <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </AuthProvider>
  )
}

export default App
