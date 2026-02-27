import { useState, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchWorkLogs,
  fetchUsers,
  fetchServices,
} from '../../api/admin'
import {
  Search,
  Loader2,
  AlertCircle,
  Filter,
  ClipboardList,
  Calendar,
  Clock,
  DollarSign,
  User,
} from 'lucide-react'

// ==================== Sub-components ====================

const TableSkeleton = () => (
  <div className="animate-pulse">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 border-b border-gray-100">
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-36" />
          <div className="h-3 bg-gray-100 rounded w-24" />
        </div>
        <div className="h-4 bg-gray-200 rounded w-20" />
        <div className="h-4 bg-gray-200 rounded w-16" />
      </div>
    ))}
  </div>
)

// Get status label and color
function getStatusStyle(status) {
  // WorkLog doesn't have a status column in current model,
  // but we display based on available data
  return { label: '已完成', color: 'bg-green-100 text-green-700 border-green-200' }
}

// ==================== Main Component ====================

const WorkLogs = () => {
  const [filterUserId, setFilterUserId] = useState('')
  const [filterStartDate, setFilterStartDate] = useState('')
  const [filterEndDate, setFilterEndDate] = useState('')
  const [search, setSearch] = useState('')

  // Build query params
  const queryParams = useMemo(() => {
    const params = {}
    if (filterUserId) params.userId = filterUserId
    if (filterStartDate) params.startDate = filterStartDate
    if (filterEndDate) params.endDate = filterEndDate
    return params
  }, [filterUserId, filterStartDate, filterEndDate])

  // Queries
  const { data: logs = [], isLoading, isError, error } = useQuery({
    queryKey: ['admin-work-logs', queryParams],
    queryFn: () => fetchWorkLogs(queryParams),
  })

  const { data: users = [] } = useQuery({
    queryKey: ['admin-users-list'],
    queryFn: fetchUsers,
  })

  const { data: services = [] } = useQuery({
    queryKey: ['admin-services-list'],
    queryFn: fetchServices,
  })

  // Staff users only
  const staffUsers = useMemo(
    () => users.filter((u) => u.role === 'staff' || u.role === 'admin'),
    [users]
  )

  // Client-side search
  const filtered = useMemo(() => {
    if (!search) return logs
    const q = search.toLowerCase()
    return logs.filter(
      (log) =>
        (log.user_display_name || '').toLowerCase().includes(q) ||
        (log.service_name || '').toLowerCase().includes(q) ||
        (log.custom_task_name || '').toLowerCase().includes(q)
    )
  }, [logs, search])

  // Summary stats
  const stats = useMemo(() => {
    const totalHours = filtered.reduce((sum, log) => sum + (log.hours || 0), 0)
    const uniqueStaff = new Set(filtered.map((log) => log.user_id)).size
    return { totalHours, uniqueStaff, totalLogs: filtered.length }
  }, [filtered])

  if (isError) {
    return (
      <div className="flex items-center gap-3 p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
        <AlertCircle size={20} />
        <span>載入失敗：{error?.message || '未知錯誤'}</span>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-serif font-bold text-secondary flex items-center gap-2">
          <ClipboardList size={28} />
          員工工作記錄
        </h2>
        <p className="text-sm text-gray-500 mt-1">查看所有員工的工作記錄</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <ClipboardList size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalLogs}</p>
            <p className="text-xs text-gray-500">記錄總數</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Clock size={20} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalHours.toFixed(1)}</p>
            <p className="text-xs text-gray-500">總工時</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <User size={20} className="text-purple-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.uniqueStaff}</p>
            <p className="text-xs text-gray-500">員工人數</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜尋員工、服務或任務..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={filterUserId}
              onChange={(e) => setFilterUserId(e.target.value)}
              className="pl-9 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm appearance-none bg-white"
            >
              <option value="">所有員工</option>
              {staffUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.display_name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              placeholder="開始日期"
            />
            <span className="text-gray-400 text-sm">至</span>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              placeholder="結束日期"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <TableSkeleton />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <ClipboardList size={48} className="mb-3 opacity-50" />
            <p className="text-lg font-medium">尚無工作記錄</p>
            <p className="text-sm mt-1">員工開始記錄工作後會顯示在這裡</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {/* Desktop Header */}
            <div className="hidden md:grid md:grid-cols-12 gap-4 px-4 py-3 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="col-span-2">員工</div>
              <div className="col-span-2">日期</div>
              <div className="col-span-4">服務/任務</div>
              <div className="col-span-2">工時</div>
              <div className="col-span-2">建立時間</div>
            </div>

            {filtered.map((log) => (
              <div key={log.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                {/* Desktop Row */}
                <div className="hidden md:grid md:grid-cols-12 gap-4 items-center">
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-900">
                      {log.user_display_name || `使用者 #${log.user_id}`}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <Calendar size={14} />
                      {log.date}
                    </span>
                  </div>
                  <div className="col-span-4">
                    {log.service_name ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-blue-100 text-blue-700 border-blue-200">
                        {log.service_name}
                      </span>
                    ) : log.custom_task_name ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-gray-100 text-gray-700 border-gray-200">
                        {log.custom_task_name}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm font-medium text-gray-900 flex items-center gap-1">
                      <Clock size={14} className="text-gray-400" />
                      {log.hours} 小時
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs text-gray-500">
                      {new Date(log.created_at).toLocaleString('zh-TW', {
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {/* Mobile Card */}
                <div className="md:hidden space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {log.user_display_name || `使用者 #${log.user_id}`}
                    </p>
                    <span className="text-xs text-gray-500">{log.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {log.service_name ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        {log.service_name}
                      </span>
                    ) : log.custom_task_name ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {log.custom_task_name}
                      </span>
                    ) : null}
                    <span className="text-sm text-gray-600 ml-auto flex items-center gap-1">
                      <Clock size={12} />
                      {log.hours} 小時
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default WorkLogs
