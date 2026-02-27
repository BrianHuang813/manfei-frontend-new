import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchDashboardStats, fetchSettings, updateSettings } from '../api/admin'
import ImageUploader from '../components/ImageUploader'
import ServicesManagement from './admin/Services'
import NewsManagement from './admin/News'
import ProductsManagement from './admin/Products'
import TestimonialsManagement from './admin/Reviews'
import PortfolioManagement from './admin/Portfolios'
import StaffLogs from './admin/WorkLogs'
import {
  Newspaper,
  Scissors,
  Package,
  Star,
  Image,
  Users,
  UserCog,
  Heart,
  TrendingUp,
  Clock,
  Loader2,
  AlertCircle,
  Save,
  CheckCircle,
} from 'lucide-react'
import { useState, useEffect } from 'react'

// ==================== Dashboard ====================

const STAT_CARDS = [
  { key: 'news', label: '最新消息', icon: Newspaper, color: 'bg-blue-500', path: '/admin/news' },
  { key: 'services', label: '服務項目', icon: Scissors, color: 'bg-emerald-500', path: '/admin/services' },
  { key: 'products', label: '產品', icon: Package, color: 'bg-amber-500', path: '/admin/products' },
  { key: 'testimonials', label: '客戶評價', icon: Star, color: 'bg-purple-500', path: '/admin/testimonials' },
  { key: 'portfolio', label: '對比圖', icon: Image, color: 'bg-rose-500', path: '/admin/portfolio' },
  { key: 'staff', label: '員工', icon: UserCog, color: 'bg-indigo-500', path: '/admin/users', custom: true },
  { key: 'customers', label: '顧客', icon: Heart, color: 'bg-teal-500', path: '/admin/customers', custom: true },
]

const TYPE_COLORS = {
  news: 'bg-blue-100 text-blue-700',
  service: 'bg-emerald-100 text-emerald-700',
  product: 'bg-amber-100 text-amber-700',
  testimonial: 'bg-purple-100 text-purple-700',
  portfolio: 'bg-rose-100 text-rose-700',
}

const Dashboard = () => {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: fetchDashboardStats,
    refetchInterval: 60000, // refresh every minute
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-serif font-bold text-secondary">管理儀表板</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-16" />
                  <div className="h-6 bg-gray-200 rounded w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-serif font-bold text-secondary">管理儀表板</h2>
        <div className="flex items-center gap-3 p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle size={20} />
          <span>無法載入統計資料</span>
        </div>
      </div>
    )
  }

  const counts = stats?.counts || {}
  const recentActivity = stats?.recent_activity || []

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-serif font-bold text-secondary flex items-center gap-2">
          <TrendingUp size={28} />
          管理儀表板
        </h2>
        <p className="text-sm text-gray-500 mt-1">網站內容總覽與近期活動</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon
          const data = counts[card.key] || {}
          let total, subtitle

          if (card.key === 'staff') {
            // Staff card: admin + staff count
            const userCounts = counts.users || {}
            total = (userCounts.roles?.admin || 0) + (userCounts.roles?.staff || 0)
            subtitle = `管理員 ${userCounts.roles?.admin || 0} / 員工 ${userCounts.roles?.staff || 0}`
          } else if (card.key === 'customers') {
            // Customer card
            const userCounts = counts.users || {}
            total = userCounts.roles?.customer || 0
            subtitle = `全部顧客`
          } else {
            total = data.total
            subtitle = `啟用中 ${data.active || 0} 筆`
          }

          return (
            <a
              key={card.key}
              href={card.path}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform`}>
                  <Icon size={22} />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-0.5">{total ?? 0}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
                </div>
              </div>
            </a>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Clock size={20} className="text-gray-400" />
            近期活動
          </h3>
        </div>
        {recentActivity.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-400 text-sm">
            目前沒有活動紀錄
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentActivity.map((item, idx) => (
              <div key={idx} className="px-6 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[item.type] || 'bg-gray-100 text-gray-600'}`}>
                  {item.type_label}
                </span>
                <span className="text-sm text-gray-700 flex-1 truncate">{item.title}</span>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {item.updated_at ? new Date(item.updated_at).toLocaleString('zh-TW', {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  }) : '-'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ==================== Settings ====================

const SETTING_FIELDS = {
  basic: [
    { key: 'site_name', label: '店名', type: 'text', placeholder: '嫚霏 SPA' },
    { key: 'address', label: '地址', type: 'text', placeholder: '嘉義市西區北港路 8 號' },
    { key: 'phone', label: '電話', type: 'text', placeholder: '05-2273758' },
    { key: 'business_hours', label: '營業時間', type: 'text', placeholder: '週一至週日 09:00 - 17:00' },
    { key: 'line_url', label: 'LINE 官方帳號連結', type: 'url', placeholder: 'https://line.me/...' },
    { key: 'facebook_url', label: 'Facebook 連結', type: 'url', placeholder: 'https://facebook.com/...' },
    { key: 'instagram_url', label: 'Instagram 連結', type: 'url', placeholder: 'https://instagram.com/...' },
  ],
  seo: [
    { key: 'meta_title', label: 'Meta Title', type: 'text', placeholder: '嫚霏 SPA | 專業德系護膚' },
    { key: 'meta_description', label: 'Meta Description', type: 'textarea', placeholder: '網站描述...' },
  ],
}

const SettingsPage = () => {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({})
  const [saveSuccess, setSaveSuccess] = useState(false)

  const { data: settings, isLoading, isError } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: fetchSettings,
  })

  const saveMutation = useMutation({
    mutationFn: (data) => updateSettings(data),
    onSuccess: (newData) => {
      queryClient.setQueryData(['admin-settings'], newData)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    },
    onError: (err) => {
      window.alert(err.response?.data?.detail || '儲存失敗')
    },
  })

  useEffect(() => {
    if (settings) {
      setForm(settings)
    }
  }, [settings])

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = (e) => {
    e.preventDefault()
    saveMutation.mutate(form)
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <h2 className="text-2xl font-serif font-bold text-secondary">網站設定</h2>
        <div className="animate-pulse space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <h2 className="text-2xl font-serif font-bold text-secondary">網站設定</h2>
        <div className="flex items-center gap-3 p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle size={20} />
          <span>無法載入設定資料</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-serif font-bold text-secondary">網站設定</h2>
        <p className="text-sm text-gray-500 mt-1">管理網站基本資訊與 SEO 設定</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">基本資訊</h3>
          <div className="space-y-4">
            {SETTING_FIELDS.basic.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                <input
                  type={field.type}
                  value={form[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* SEO Settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO 設定</h3>
          <div className="space-y-4">
            {SETTING_FIELDS.seo.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                {field.type === 'textarea' ? (
                  <textarea
                    rows={3}
                    value={form[field.key] || ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                ) : (
                  <input
                    type={field.type}
                    value={form[field.key] || ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                )}
              </div>
            ))}

            {/* OG Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">OG Image（社群分享圖）</label>
              <ImageUploader
                value={form.og_image || null}
                onChange={(url) => handleChange('og_image', url || '')}
                label=""
                helpText="建議尺寸 1200x630，比例約 1.9:1"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-3">
          {saveSuccess && (
            <span className="flex items-center gap-1 text-sm text-green-600">
              <CheckCircle size={16} />
              已儲存
            </span>
          )}
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium shadow-sm disabled:opacity-50"
          >
            {saveMutation.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            儲存設定
          </button>
        </div>
      </form>
    </div>
  )
}

// Re-export sub-page components for use in App.jsx routing
export {
  Dashboard,
  NewsManagement,
  ServicesManagement,
  ProductsManagement,
  TestimonialsManagement,
  PortfolioManagement,
  StaffLogs,
  SettingsPage as SettingsPlaceholder,
}

// Default export kept for backwards compatibility
export default Dashboard
