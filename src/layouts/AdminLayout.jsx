import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  LayoutDashboard,
  Users,
  Newspaper,
  Scissors,
  Package,
  Star,
  Image,
  ClipboardList,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react'

const navigation = [
  { name: '儀表板', path: '/admin', icon: LayoutDashboard },
  { name: '人員管理', path: '/admin/users', icon: Users },
  { name: '最新消息', path: '/admin/news', icon: Newspaper },
  { name: '服務項目', path: '/admin/services', icon: Scissors },
  { name: '產品', path: '/admin/products', icon: Package },
  { name: '客戶評價', path: '/admin/testimonials', icon: Star },
  { name: '作品集', path: '/admin/portfolio', icon: Image },
  { name: '員工記錄', path: '/admin/staff-logs', icon: ClipboardList },
  { name: '設定', path: '/admin/settings', icon: Settings },
]

const AdminLayout = () => {
  const { logout, user } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin'
    return location.pathname.startsWith(path)
  }

  const SidebarContent = () => (
    <>
      {/* Brand Header */}
      <div className="p-6 border-b border-secondary-600">
        <h1 className="text-xl font-serif font-bold text-white">嫚霏 SPA</h1>
        <p className="text-sm text-secondary-300 mt-1">管理後台</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon
          const active = isActive(item.path)
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
                active
                  ? 'bg-primary-500/20 text-primary-200 border-l-4 border-primary-400'
                  : 'text-secondary-200 hover:bg-secondary-600 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-secondary-600">
        {user && (
          <p className="text-xs text-secondary-400 mb-3 truncate px-2">
            {user.display_name || `ID: ${user.id}`}
          </p>
        )}
        <button
          onClick={() => {
            setSidebarOpen(false)
            logout()
          }}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-colors"
        >
          <LogOut size={20} />
          <span>登出</span>
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-secondary text-white z-50">
        <SidebarContent />
      </aside>

      {/* Sidebar - Mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-secondary text-white transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Close button */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 text-secondary-300 hover:text-white"
        >
          <X size={24} />
        </button>
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 min-h-screen">
        {/* Mobile Top Bar */}
        <header className="lg:hidden sticky top-0 z-30 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-secondary hover:text-secondary-700 transition-colors"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-serif font-bold text-secondary">
              ManFei SPA
            </h1>
            <div className="w-6" /> {/* Spacer for centering */}
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
