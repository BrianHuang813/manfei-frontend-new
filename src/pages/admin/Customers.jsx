import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchCustomers,
  fetchCustomerDetail,
  updateCustomerTier,
  updateUserStatus,
  createTransaction,
  deleteTransaction,
} from '../../api/admin'
import {
  Search,
  Crown,
  Star,
  ChevronDown,
  ChevronRight,
  X,
  Plus,
  Trash2,
  DollarSign,
  ShoppingBag,
  AlertCircle,
  Loader2,
  CheckCircle,
} from 'lucide-react'

// ==================== Config ====================

const TIER_CONFIG = {
  regular: {
    label: '一般會員',
    className: 'bg-gray-100 text-gray-700 border-gray-200',
    dotColor: 'bg-gray-400',
    icon: Star,
  },
  vip: {
    label: 'VIP',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    dotColor: 'bg-amber-500',
    icon: Crown,
  },
}

// ==================== Sub-components ====================

const Avatar = ({ name, isActive }) => {
  const initial = name ? name.charAt(0).toUpperCase() : '?'
  const colors = [
    'bg-primary-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500',
    'bg-rose-500', 'bg-indigo-500', 'bg-teal-500', 'bg-orange-500',
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
      <span
        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
          isActive ? 'bg-green-400' : 'bg-red-400'
        }`}
      />
    </div>
  )
}

const TierBadge = ({ tier }) => {
  const config = TIER_CONFIG[tier] || TIER_CONFIG.regular
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
      {config.label}
    </span>
  )
}

const StatusToggle = ({ isActive, isLoading, onToggle }) => (
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

const TierSelector = ({ currentTier, userId, onTierChange, isLoading }) => {
  const [open, setOpen] = useState(false)

  const handleSelect = (tier) => {
    if (tier === currentTier) { setOpen(false); return }
    const label = TIER_CONFIG[tier]?.label || tier
    if (window.confirm(`確定要將此顧客的等級變更為「${label}」嗎？`)) {
      onTierChange(userId, tier)
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
        變更等級
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
            {Object.entries(TIER_CONFIG).map(([value, config]) => {
              const Icon = config.icon
              const isSelected = value === currentTier
              return (
                <button
                  key={value}
                  onClick={() => handleSelect(value)}
                  className={`flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors ${
                    isSelected
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={14} />
                  <span>{config.label}</span>
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

// ==================== Customer Detail Modal ====================

const CustomerDetailModal = ({ userId, onClose }) => {
  const queryClient = useQueryClient()
  const [newTxn, setNewTxn] = useState({ service_name: '', amount: '' })
  const [showAddForm, setShowAddForm] = useState(false)

  const { data: customer, isLoading, isError } = useQuery({
    queryKey: ['admin-customer-detail', userId],
    queryFn: () => fetchCustomerDetail(userId),
    enabled: !!userId,
  })

  const addTxnMutation = useMutation({
    mutationFn: (txnData) => createTransaction(userId, txnData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-customer-detail', userId] })
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] })
      setNewTxn({ service_name: '', amount: '' })
      setShowAddForm(false)
    },
    onError: (err) => {
      window.alert(err.response?.data?.detail || '新增失敗')
    },
  })

  const deleteTxnMutation = useMutation({
    mutationFn: (txnId) => deleteTransaction(userId, txnId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-customer-detail', userId] })
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] })
    },
    onError: (err) => {
      window.alert(err.response?.data?.detail || '刪除失敗')
    },
  })

  const handleAddTxn = (e) => {
    e.preventDefault()
    if (!newTxn.service_name.trim() || !newTxn.amount) return
    addTxnMutation.mutate({
      service_name: newTxn.service_name.trim(),
      amount: parseInt(newTxn.amount, 10),
    })
  }

  const handleDeleteTxn = (txnId) => {
    if (window.confirm('確定要刪除此消費記錄嗎？')) {
      deleteTxnMutation.mutate(txnId)
    }
  }

  const tier = TIER_CONFIG[customer?.tier] || TIER_CONFIG.regular

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 px-4 pointer-events-none">
        <div
          className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-2xl max-h-[85vh] overflow-y-auto pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
            <h3 className="text-lg font-bold text-gray-900">顧客詳情</h3>
            <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
              <X size={20} />
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={32} className="animate-spin text-primary-500" />
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center py-16 text-red-500">
              <AlertCircle size={32} className="mr-2" />
              無法載入顧客資料
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="flex items-center gap-4">
                <Avatar name={customer.display_name} isActive={customer.is_active} />
                <div>
                  <h4 className="text-lg font-bold text-gray-900">{customer.display_name}</h4>
                  <p className="text-xs text-gray-400 font-mono">{customer.line_user_id}</p>
                </div>
                <div className="ml-auto">
                  <TierBadge tier={customer.tier} />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-xl font-bold text-gray-900">${customer.total_spent?.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">累計消費</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-xl font-bold text-gray-900">{customer.transaction_count}</p>
                  <p className="text-xs text-gray-500 mt-1">消費次數</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-xl font-bold text-gray-900">{tier.label}</p>
                  <p className="text-xs text-gray-500 mt-1">會員等級</p>
                </div>
              </div>

              {/* Info rows */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1.5 border-b border-gray-50">
                  <span className="text-gray-500">加入日期</span>
                  <span className="text-gray-900">
                    {new Date(customer.created_at).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-500">帳號狀態</span>
                  <span className={customer.is_active ? 'text-green-600' : 'text-red-500'}>
                    {customer.is_active ? '啟用中' : '已停用'}
                  </span>
                </div>
              </div>

              {/* Transaction History */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-gray-900">消費紀錄</h4>
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    <Plus size={14} />
                    新增紀錄
                  </button>
                </div>

                {/* Add Transaction Form */}
                {showAddForm && (
                  <form onSubmit={handleAddTxn} className="bg-primary-50 rounded-xl p-4 mb-4 space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">服務/項目名稱</label>
                      <input
                        type="text"
                        value={newTxn.service_name}
                        onChange={(e) => setNewTxn((p) => ({ ...p, service_name: e.target.value }))}
                        placeholder="例：深層護膚療程"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">金額 (NT$)</label>
                      <input
                        type="number"
                        min="0"
                        value={newTxn.amount}
                        onChange={(e) => setNewTxn((p) => ({ ...p, amount: e.target.value }))}
                        placeholder="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        required
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        disabled={addTxnMutation.isPending}
                        className="inline-flex items-center gap-1 px-4 py-2 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600 transition-colors disabled:opacity-50"
                      >
                        {addTxnMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                        確認新增
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        取消
                      </button>
                    </div>
                  </form>
                )}

                {/* Transaction List */}
                {customer.transactions?.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <ShoppingBag size={28} className="mx-auto mb-2" />
                    <p className="text-sm">尚無消費紀錄</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {customer.transactions?.map((txn) => (
                      <div key={txn.id} className="flex items-center justify-between py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{txn.service_name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(txn.created_at).toLocaleDateString('zh-TW', {
                              year: 'numeric', month: 'short', day: 'numeric',
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-gray-900">
                            ${txn.amount?.toLocaleString()}
                          </span>
                          <button
                            onClick={() => handleDeleteTxn(txn.id)}
                            disabled={deleteTxnMutation.isPending}
                            className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                            title="刪除"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ==================== Skeleton ====================

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
        <div className="h-6 bg-gray-200 rounded w-20" />
        <div className="h-6 bg-gray-200 rounded w-11" />
      </div>
    ))}
  </div>
)

// ==================== Main Customers Page ====================

const Customers = () => {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCustomerId, setSelectedCustomerId] = useState(null)
  const [mutatingUsers, setMutatingUsers] = useState({})

  const {
    data: customers = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: fetchCustomers,
  })

  // Tier mutation
  const tierMutation = useMutation({
    mutationFn: ({ userId, tier }) => updateCustomerTier(userId, tier),
    onMutate: ({ userId }) => {
      setMutatingUsers((prev) => ({ ...prev, [userId]: 'tier' }))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] })
    },
    onError: (err) => {
      window.alert(err.response?.data?.detail || '等級更新失敗')
    },
    onSettled: (_, __, { userId }) => {
      setMutatingUsers((prev) => { const n = { ...prev }; delete n[userId]; return n })
    },
  })

  // Status mutation
  const statusMutation = useMutation({
    mutationFn: ({ userId, isActive }) => updateUserStatus(userId, isActive),
    onMutate: ({ userId }) => {
      setMutatingUsers((prev) => ({ ...prev, [userId]: 'status' }))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] })
    },
    onError: (err) => {
      window.alert(err.response?.data?.detail || '狀態更新失敗')
    },
    onSettled: (_, __, { userId }) => {
      setMutatingUsers((prev) => { const n = { ...prev }; delete n[userId]; return n })
    },
  })

  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers
    const q = searchQuery.toLowerCase()
    return customers.filter(
      (c) =>
        c.display_name?.toLowerCase().includes(q) ||
        c.line_user_id?.toLowerCase().includes(q) ||
        (TIER_CONFIG[c.tier]?.label || '').includes(q)
    )
  }, [customers, searchQuery])

  const handleTierChange = (userId, tier) => {
    tierMutation.mutate({ userId, tier })
  }

  const handleStatusToggle = (userId, currentStatus) => {
    const action = currentStatus ? '停用' : '啟用'
    if (window.confirm(`確定要${action}此帳號嗎？`)) {
      statusMutation.mutate({ userId, isActive: !currentStatus })
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-secondary">顧客管理</h1>
        <p className="text-sm text-gray-500 mt-1">
          管理顧客會員等級、查看消費紀錄
        </p>
      </div>

      {/* Search + Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜尋顧客姓名或 LINE ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
          />
        </div>
        {!isLoading && (
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="bg-gray-100 px-2.5 py-1 rounded-full">
              共 {customers.length} 位顧客
            </span>
            {searchQuery && (
              <span className="bg-primary-50 text-primary-700 px-2.5 py-1 rounded-full">
                篩選結果：{filteredCustomers.length} 位
              </span>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {isLoading ? (
          <TableSkeleton />
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <AlertCircle size={48} className="text-red-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">載入失敗</h3>
            <p className="text-sm text-gray-500 mb-4">
              {error?.response?.data?.detail || error?.message || '無法取得顧客列表'}
            </p>
            <button
              onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-customers'] })}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600 transition-colors"
            >
              重試
            </button>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <Search size={48} className="text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? '找不到符合的顧客' : '目前沒有顧客'}
            </h3>
            <p className="text-sm text-gray-500">
              {searchQuery ? '請嘗試不同的搜尋關鍵字' : '尚無顧客資料'}
            </p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="col-span-3">顧客</div>
              <div className="col-span-2">會員等級</div>
              <div className="col-span-2 text-right">累計消費</div>
              <div className="col-span-1 text-center">次數</div>
              <div className="col-span-1 text-center">狀態</div>
              <div className="col-span-3 text-right">操作</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-100">
              {filteredCustomers.map((c) => {
                const isUserMutating = mutatingUsers[c.id]
                return (
                  <div
                    key={c.id}
                    className={`relative grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-4 md:px-6 py-4 items-center transition-colors hover:bg-gray-50 ${
                      !c.is_active ? 'opacity-60' : ''
                    }`}
                  >
                    {/* Customer Info */}
                    <div className="md:col-span-3 flex items-center gap-3">
                      <Avatar name={c.display_name} isActive={c.is_active} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{c.display_name}</p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">{c.line_user_id}</p>
                      </div>
                    </div>

                    {/* Tier Badge */}
                    <div className="md:col-span-2 flex items-center">
                      <TierBadge tier={c.tier} />
                    </div>

                    {/* Total Spent */}
                    <div className="md:col-span-2 flex items-center md:justify-end">
                      <span className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                        <DollarSign size={14} className="text-emerald-500" />
                        {c.total_spent?.toLocaleString()}
                      </span>
                    </div>

                    {/* Transaction Count */}
                    <div className="md:col-span-1 flex items-center md:justify-center">
                      <span className="text-sm text-gray-600">{c.transaction_count}</span>
                    </div>

                    {/* Status */}
                    <div className="md:col-span-1 flex items-center md:justify-center">
                      <StatusToggle
                        isActive={c.is_active}
                        isLoading={isUserMutating === 'status'}
                        onToggle={() => handleStatusToggle(c.id, c.is_active)}
                      />
                    </div>

                    {/* Actions */}
                    <div className="md:col-span-3 flex items-center md:justify-end gap-2">
                      <TierSelector
                        currentTier={c.tier}
                        userId={c.id}
                        onTierChange={handleTierChange}
                        isLoading={isUserMutating === 'tier'}
                      />
                      <button
                        onClick={() => setSelectedCustomerId(c.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        詳情
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Detail Modal */}
      {selectedCustomerId && (
        <CustomerDetailModal
          userId={selectedCustomerId}
          onClose={() => setSelectedCustomerId(null)}
        />
      )}
    </div>
  )
}

export default Customers
