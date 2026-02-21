import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import PageTransition from './components/PageTransition'

// Layouts
import PublicLayout from './layouts/PublicLayout'

// Pages
import Home from './pages/Home'
import News from './pages/News'
import NewsDetail from './pages/NewsDetail'
import Auth from './pages/Auth'
import AuthCallback from './pages/AuthCallback'
import Login from './pages/Login'
import Register from './pages/Register'
import Staff from './pages/Staff'
import ProductDetail from './pages/ProductDetail'
import Services from './pages/Services'
import Brands from './pages/Brands'
import About from './pages/About'
import NotFound from './pages/NotFound'

// Admin Layout & Pages
import AdminLayout from './layouts/AdminLayout'
import {
  Dashboard,
  NewsManagement,
  ServicesManagement,
  ProductsManagement,
  TestimonialsManagement,
  PortfolioManagement,
  StaffLogs,
  SettingsPlaceholder,
} from './pages/Admin'
import Users from './pages/admin/Users'

function App() {
  const location = useLocation()

  return (
    <AuthProvider>
      <AnimatePresence mode="wait">
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
      </AnimatePresence>
    </AuthProvider>
  )
}

export default App
