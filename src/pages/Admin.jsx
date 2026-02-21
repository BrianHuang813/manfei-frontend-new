import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import ServicesManagement from './admin/Services'
import NewsManagement from './admin/News'
import ProductsManagement from './admin/Products'
import TestimonialsManagement from './admin/Reviews'
import PortfolioManagement from './admin/Portfolios'
import StaffLogs from './admin/WorkLogs'

// Placeholder components for Admin sections
const Dashboard = () => (
  <div>
    <h2 className="text-2xl font-serif font-bold text-secondary">管理儀表板</h2>
    <p className="mt-4 text-gray-600">概覽統計資訊</p>
    {/* Development Note */}
    <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 className="font-semibold text-blue-900 mb-2">📝 開發說明</h3>
      <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
        <li>需要實現各內容類型的 CRUD 介面（表格 + 表單）</li>
        <li>整合 React-Quill 富文本編輯器</li>
        <li>整合 Cloudinary 上傳組件（嚴格寬高比裁切）</li>
        <li>實現拖曳排序功能</li>
        <li>員工記錄需要篩選和日期範圍查詢</li>
      </ul>
    </div>
  </div>
)

const SettingsPlaceholder = () => <div><h2 className="text-2xl font-serif font-bold text-secondary">設定</h2><p className="mt-4 text-gray-600">🚧 設定功能建設中...</p></div>

// Re-export sub-page components for use in App.jsx routing
export {
  Dashboard,
  NewsManagement,
  ServicesManagement,
  ProductsManagement,
  TestimonialsManagement,
  PortfolioManagement,
  StaffLogs,
  SettingsPlaceholder,
}

// Default export kept for backwards compatibility
export default Dashboard
