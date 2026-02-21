import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchUsers, updateUserRole, updateUserStatus } from '../../api/admin'
import { useAuth } from '../../contexts/AuthContext'
import { Search, ChevronDown, Shield, UserCog, User as UserIcon, AlertCircle, Loader2 } from 'lucide-react'

// ==================== Sub-components ====================

const ROLE_CONFIG = {
  admin: {
    label: '管理員',
    className: 'bg-purple-100 text-purple-700 border-purple-200',
    dotColor: 'bg-purple-500',
  },
  staff: {
    label: '員工',
    className: 'bg-blue-100 text-blue-700 border-blue-200',
    dotColor: 'bg-blue-500',
  },
  customer: {
    label: '顧客',
    className: 'bg-gray-100 text-gray-600 border-gray-200',
    dotColor: 'bg-gray-400',
  },
}

const ROLE_OPTIONS = [
  { value: 'admin', label: '管理員', icon: Shield },
  { value: 'staff', label: '員工', icon: UserCog },
  { value: 'customer', label: '顧客', icon: UserIcon },
]

/**
 * Avatar placeholder generated from display_name first character.
 */
const Avatar = ({ name, isActive }) => {
  const initial = name ? name.charAt(0).toUpperCase() : '?'

  // Generate a consistent color from name
  const colors = [
    'bg-primary-500',
    'bg-blue-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-orange-500',
  ]
  let hash = 0
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const colorClass = colors[Math.abs(hash) % colors.length]

  return (
    <div className="relative">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${colorClass} ${
          !isActive ? 'opacity-50' : ''
        }`}
      >
        {initial}
      </div>
      {/* Online indicator */}
      <span
        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
          isActive ? 'bg-green-400' : 'bg-red-400'
        }`}
      />
    </div>
  )
}

/**
 * Role badge with color coding.
 */
const RoleBadge = ({ role }) => {
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.customer
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
      {config.label}
    </span>
  )
}

/**
 * Toggle switch for active status.
 */
const StatusToggle = ({ isActive, isLoading, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      disabled={isLoading}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
        isActive ? 'bg-green-500' : 'bg-red-400'
      }`}
      title={isActive ? '啟用中 — 點擊停用' : '已停用 — 點擊啟用'}
    >
      {isLoading ? (
        <span className="absolute inset-0 flex items-center justify-center">
          <Loader2 size={14} className="animate-spin text-white" />
        </span>
      ) : (
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${
            isActive ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      )}
    </button>
  )
}

/**
 * Role dropdown selector.
 */
const RoleSelector = ({ currentRole, userId, onRoleChange, isLoading }) => {
  const [open, setOpen] = useState(false)

  const handleSelect = (role) => {
    if (role === currentRole) {
      setOpen(false)
      return
    }
    const roleLabel = ROLE_CONFIG[role]?.label || role
    if (window.confirm(`確定要將此使用者的角色變更為「${roleLabel}」嗎？`)) {
      onRoleChange(userId, role)
    }
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={isLoading}
        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        變更角色
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          {/* Backdrop for closing */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
            {ROLE_OPTIONS.map((option) => {
              const Icon = option.icon
              const isSelected = option.value === currentRole
              return (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors ${
                    isSelected
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={14} />
                  <span>{option.label}</span>
                  {isSelected && <span className="ml-auto text-primary-500">✓</span>}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

// ==================== Skeleton Loader ====================

const TableSkeleton = () => (
  <div className="animate-pulse">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 border-b border-gray-100">
        <div className="w-10 h-10 bg-gray-200 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-32" />
          <div className="h-3 bg-gray-100 rounded w-24" />
        </div>
        <div className="h-6 bg-gray-200 rounded-full w-16" />
        <div className="h-6 bg-gray-200 rounded w-11" />
        <div className="h-8 bg-gray-200 rounded w-20" />
      </div>
    ))}
  </div>
)

// ==================== Main Users Page ====================

const Users = () => {
  const { user: currentUser } = useAuth()
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [mutatingUsers, setMutatingUsers] = useState({}) // Track per-user loading states

  // Fetch all users
  const {
    data: users = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['admin-users'],
    queryFn: fetchUsers,
  })

  // Role mutation
  const roleMutation = useMutation({
    mutationFn: ({ userId, role }) => updateUserRole(userId, role),
    onMutate: ({ userId }) => {
      setMutatingUsers((prev) => ({ ...prev, [userId]: 'role' }))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: (err) => {
      const message = err.response?.data?.detail || '角色更新失敗'
      window.alert(message)
    },
    onSettled: (_, __, { userId }) => {
      setMutatingUsers((prev) => {
        const next = { ...prev }
        delete next[userId]
        return next
      })
    },
  })

  // Status mutation
  const statusMutation = useMutation({
    mutationFn: ({ userId, isActive }) => updateUserStatus(userId, isActive),
    onMutate: ({ userId }) => {
      setMutatingUsers((prev) => ({ ...prev, [userId]: 'status' }))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: (err) => {
      const message = err.response?.data?.detail || '狀態更新失敗'
      window.alert(message)
    },
    onSettled: (_, __, { userId }) => {
      setMutatingUsers((prev) => {
        const next = { ...prev }
        delete next[userId]
        return next
      })
    },
  })

  // Client-side filter
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users
    const q = searchQuery.toLowerCase()
    return users.filter(
      (u) =>
        u.display_name?.toLowerCase().includes(q) ||
        u.line_user_id?.toLowerCase().includes(q) ||
        (ROLE_CONFIG[u.role]?.label || '').includes(q)
    )
  }, [users, searchQuery])

  const handleRoleChange = (userId, role) => {
    roleMutation.mutate({ userId, role })
  }

  const handleStatusToggle = (userId, currentStatus) => {
    const action = currentStatus ? '停用' : '啟用'
    if (window.confirm(`確定要${action}此帳號嗎？`)) {
      statusMutation.mutate({ userId, isActive: !currentStatus })
    }
  }

  // ---- Render ----
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-secondary">人員管理</h1>
        <p className="text-sm text-gray-500 mt-1">
          管理系統使用者的角色與帳號狀態
        </p>
      </div>

      {/* Search + Stats bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="搜尋姓名或 LINE ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
          />
        </div>

        {/* Stats */}
        {!isLoading && (
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="bg-gray-100 px-2.5 py-1 rounded-full">
              共 {users.length} 位使用者
            </span>
            {searchQuery && (
              <span className="bg-primary-50 text-primary-700 px-2.5 py-1 rounded-full">
                篩選結果：{filteredUsers.length} 位
              </span>
            )}
          </div>
        )}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <TableSkeleton />
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <AlertCircle size={48} className="text-red-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">載入失敗</h3>
            <p className="text-sm text-gray-500 mb-4">
              {error?.response?.data?.detail || error?.message || '無法取得使用者列表'}
            </p>
            <button
              onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-users'] })}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600 transition-colors"
            >
              重試
            </button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <Search size={48} className="text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? '找不到符合的使用者' : '目前沒有使用者'}
            </h3>
            <p className="text-sm text-gray-500">
              {searchQuery ? '請嘗試不同的搜尋關鍵字' : '尚無使用者資料'}
            </p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="col-span-5">使用者</div>
              <div className="col-span-2">角色</div>
              <div className="col-span-2 text-center">狀態</div>
              <div className="col-span-3 text-right">操作</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-100">
              {filteredUsers.map((u) => {
                const isSelf = currentUser && String(u.id) === String(currentUser.id)
                const isUserMutating = mutatingUsers[u.id]
                return (
                  <div
                    key={u.id}
                    className={`grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-4 md:px-6 py-4 items-center transition-colors hover:bg-gray-50 ${
                      !u.is_active ? 'opacity-60' : ''
                    }`}
                  >
                    {/* User Info */}
                    <div className="md:col-span-5 flex items-center gap-3">
                      <Avatar name={u.display_name} isActive={u.is_active} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {u.display_name}
                          </p>
                          {isSelf && (
                            <span className="text-[10px] bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded font-medium">
                              你
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 truncate mt-0.5">
                          {u.line_user_id}
                        </p>
                      </div>
                    </div>

                    {/* Role Badge */}
                    <div className="md:col-span-2 flex items-center">
                      <RoleBadge role={u.role} />
                    </div>

                    {/* Status Toggle */}
                    <div className="md:col-span-2 flex items-center md:justify-center gap-2">
                      <StatusToggle
                        isActive={u.is_active}
                        isLoading={isUserMutating === 'status'}
                        onToggle={() => handleStatusToggle(u.id, u.is_active)}
                      />
                      <span className="text-xs text-gray-500 md:hidden">
                        {u.is_active ? '啟用中' : '已停用'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="md:col-span-3 flex items-center md:justify-end">
                      <RoleSelector
                        currentRole={u.role}
                        userId={u.id}
                        onRoleChange={handleRoleChange}
                        isLoading={isUserMutating === 'role'}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Footer Info */}
      {!isLoading && !isError && filteredUsers.length > 0 && (
        <p className="text-xs text-gray-400 mt-4 text-center">
          使用者資料僅供管理用途。管理員只能變更角色與帳號狀態，無法編輯個人資訊。
        </p>
      )}
    </div>
  )
}

export default Users
