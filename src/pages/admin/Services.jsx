import { useState, useMemo, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchServices,
  createService,
  updateService,
  deleteService,
} from '../../api/admin'
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  Clock,
  DollarSign,
  Filter,
  Scissors,
} from 'lucide-react'

// ==================== Constants ====================

const CATEGORY_COLORS = [
  'bg-rose-100 text-rose-700 border-rose-200',
  'bg-blue-100 text-blue-700 border-blue-200',
  'bg-emerald-100 text-emerald-700 border-emerald-200',
  'bg-amber-100 text-amber-700 border-amber-200',
  'bg-purple-100 text-purple-700 border-purple-200',
  'bg-teal-100 text-teal-700 border-teal-200',
  'bg-indigo-100 text-indigo-700 border-indigo-200',
  'bg-orange-100 text-orange-700 border-orange-200',
]

function getCategoryColor(category) {
  let hash = 0
  for (let i = 0; i < (category || '').length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash)
  }
  return CATEGORY_COLORS[Math.abs(hash) % CATEGORY_COLORS.length]
}

// ==================== Sub-components ====================

/**
 * Category badge with hash-based color.
 */
const CategoryBadge = ({ category }) => {
  const colorClass = getCategoryColor(category)
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${colorClass}`}
    >
      {category}
    </span>
  )
}

/**
 * Toggle switch for active status (reused pattern from Users.jsx).
 */
const StatusToggle = ({ isActive, isLoading, onToggle }) => (
  <button
    onClick={onToggle}
    disabled={isLoading}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
      isActive ? 'bg-green-500' : 'bg-red-400'
    }`}
    title={isActive ? '上架中 — 點擊下架' : '已下架 — 點擊上架'}
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

/**
 * Skeleton loader for table rows.
 */
const TableSkeleton = () => (
  <div className="animate-pulse">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 border-b border-gray-100">
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-40" />
          <div className="h-3 bg-gray-100 rounded w-24" />
        </div>
        <div className="h-6 bg-gray-200 rounded-full w-16" />
        <div className="h-4 bg-gray-200 rounded w-20" />
        <div className="h-4 bg-gray-200 rounded w-16" />
        <div className="h-6 bg-gray-200 rounded w-11" />
        <div className="h-8 bg-gray-200 rounded w-20" />
      </div>
    ))}
  </div>
)

// ==================== Modal Form ====================

const EMPTY_FORM = {
  name: '',
  category: '',
  price: '',
  duration_min: '',
  description: '',
  image_url: '',
  is_active: true,
  sort_order: 0,
}

const ServiceModal = ({ isOpen, mode, initialData, categories, onClose, onSubmit, isSubmitting }) => {
  const [form, setForm] = useState(EMPTY_FORM)

  // Sync form data when modal opens or initialData changes
  useEffect(() => {
    if (isOpen && mode === 'edit' && initialData) {
      setForm({
        name: initialData.name || '',
        category: initialData.category || '',
        price: initialData.price ?? '',
        duration_min: initialData.duration_min ?? '',
        description: initialData.description || '',
        image_url: initialData.image_url || '',
        is_active: initialData.is_active ?? true,
        sort_order: initialData.sort_order ?? 0,
      })
    } else if (isOpen && mode === 'create') {
      setForm(EMPTY_FORM)
    }
  }, [isOpen, mode, initialData])

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      price: Number(form.price),
      duration_min: Number(form.duration_min),
      sort_order: Number(form.sort_order),
    }
    onSubmit(payload)
  }

  const title = mode === 'create' ? '新增服務' : '編輯服務'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-serif font-bold text-secondary">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              服務名稱 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              maxLength={255}
              placeholder="例：臉部深層清潔"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              分類 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              maxLength={100}
              list="category-suggestions"
              placeholder="例：臉部護理"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            {categories.length > 0 && (
              <datalist id="category-suggestions">
                {categories.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            )}
          </div>

          {/* Price + Duration row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                價格 (NT$) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  required
                  min={0}
                  placeholder="0"
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                時長 (分鐘) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  name="duration_min"
                  value={form.duration_min}
                  onChange={handleChange}
                  required
                  min={1}
                  placeholder="60"
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="服務內容說明（選填）"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">圖片網址</label>
            <input
              type="url"
              name="image_url"
              value={form.image_url}
              onChange={handleChange}
              maxLength={500}
              placeholder="https://example.com/image.jpg（選填）"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Sort Order + Active row */}
          <div className="grid grid-cols-2 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">排序順序</label>
              <input
                type="number"
                name="sort_order"
                value={form.sort_order}
                onChange={handleChange}
                min={0}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div className="flex items-center gap-3 pb-1">
              <label className="text-sm font-medium text-gray-700">上架狀態</label>
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, is_active: !prev.is_active }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                  form.is_active ? 'bg-green-500' : 'bg-red-400'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${
                    form.is_active ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-xs text-gray-500">{form.is_active ? '上架' : '下架'}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {mode === 'create' ? '新增' : '儲存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ==================== Main Services Page ====================

const Services = () => {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [mutatingIds, setMutatingIds] = useState({})

  // Modal state
  const [modal, setModal] = useState({ isOpen: false, mode: 'create', editingService: null })

  // ---- Data Fetching ----
  const {
    data: services = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['admin-services'],
    queryFn: fetchServices,
  })

  // ---- Mutations ----
  const createMutation = useMutation({
    mutationFn: (data) => createService(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] })
      setModal({ isOpen: false, mode: 'create', editingService: null })
    },
    onError: (err) => {
      window.alert(err.response?.data?.detail || '新增服務失敗')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] })
      setModal({ isOpen: false, mode: 'create', editingService: null })
    },
    onError: (err) => {
      window.alert(err.response?.data?.detail || '更新服務失敗')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteService(id),
    onMutate: (id) => {
      setMutatingIds((prev) => ({ ...prev, [id]: 'delete' }))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] })
    },
    onError: (err) => {
      window.alert(err.response?.data?.detail || '刪除服務失敗')
    },
    onSettled: (_, __, id) => {
      setMutatingIds((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    },
  })

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, is_active }) => updateService(id, { is_active }),
    onMutate: ({ id }) => {
      setMutatingIds((prev) => ({ ...prev, [id]: 'status' }))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] })
    },
    onError: (err) => {
      window.alert(err.response?.data?.detail || '狀態切換失敗')
    },
    onSettled: (_, __, { id }) => {
      setMutatingIds((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    },
  })

  // ---- Derived Data ----
  const uniqueCategories = useMemo(() => {
    const cats = [...new Set(services.map((s) => s.category).filter(Boolean))]
    return cats.sort()
  }, [services])

  const filteredServices = useMemo(() => {
    let result = services
    if (categoryFilter) {
      result = result.filter((s) => s.category === categoryFilter)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (s) =>
          s.name?.toLowerCase().includes(q) ||
          s.category?.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q)
      )
    }
    return result
  }, [services, searchQuery, categoryFilter])

  // ---- Handlers ----
  const openCreateModal = () => {
    setModal({ isOpen: true, mode: 'create', editingService: null })
  }

  const openEditModal = (service) => {
    setModal({ isOpen: true, mode: 'edit', editingService: service })
  }

  const closeModal = () => {
    setModal({ isOpen: false, mode: 'create', editingService: null })
  }

  const handleModalSubmit = (payload) => {
    if (modal.mode === 'create') {
      createMutation.mutate(payload)
    } else {
      updateMutation.mutate({ id: modal.editingService.id, data: payload })
    }
  }

  const handleDelete = (service) => {
    if (window.confirm(`確定要刪除「${service.name}」嗎？此操作無法復原。`)) {
      deleteMutation.mutate(service.id)
    }
  }

  const handleStatusToggle = (service) => {
    const action = service.is_active ? '下架' : '上架'
    if (window.confirm(`確定要${action}「${service.name}」嗎？`)) {
      toggleStatusMutation.mutate({ id: service.id, is_active: !service.is_active })
    }
  }

  const formatPrice = (price) => {
    return `NT$ ${price.toLocaleString()}`
  }

  // ---- Render ----
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-secondary">服務項目管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理所有服務項目的內容與排序</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors shadow-sm"
        >
          <Plus size={18} />
          新增服務
        </button>
      </div>

      {/* Search + Filter bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="搜尋服務名稱、分類或描述..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="pl-9 pr-8 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white appearance-none cursor-pointer"
          >
            <option value="">全部分類</option>
            {uniqueCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Stats */}
        {!isLoading && (
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="bg-gray-100 px-2.5 py-1 rounded-full">
              共 {services.length} 項服務
            </span>
            {(searchQuery || categoryFilter) && (
              <span className="bg-primary-50 text-primary-700 px-2.5 py-1 rounded-full">
                篩選結果：{filteredServices.length} 項
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
              {error?.response?.data?.detail || error?.message || '無法取得服務列表'}
            </p>
            <button
              onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-services'] })}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600 transition-colors"
            >
              重試
            </button>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <Scissors size={48} className="text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery || categoryFilter ? '找不到符合的服務' : '目前沒有服務項目'}
            </h3>
            <p className="text-sm text-gray-500 mb-2">
              {searchQuery || categoryFilter
                ? '請嘗試不同的搜尋關鍵字或分類'
                : '點擊「新增服務」按鈕開始建立'}
            </p>
            {!searchQuery && !categoryFilter && (
              <button
                onClick={openCreateModal}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600 transition-colors"
              >
                <Plus size={16} />
                新增第一個服務
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="col-span-4">服務名稱</div>
              <div className="col-span-2">分類</div>
              <div className="col-span-1 text-right">價格</div>
              <div className="col-span-1 text-center">時長</div>
              <div className="col-span-1 text-center">狀態</div>
              <div className="col-span-3 text-right">操作</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-100">
              {filteredServices.map((service) => {
                const isMutating = mutatingIds[service.id]
                return (
                  <div
                    key={service.id}
                    className={`grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-4 md:px-6 py-4 items-center transition-colors hover:bg-gray-50 ${
                      !service.is_active ? 'opacity-60' : ''
                    }`}
                  >
                    {/* Service Name + Description */}
                    <div className="md:col-span-4 min-w-0">
                      <div className="flex items-center gap-2">
                        {service.image_url && (
                          <img
                            src={service.image_url}
                            alt={service.name}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-gray-200"
                            onError={(e) => { e.target.style.display = 'none' }}
                          />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {service.name}
                          </p>
                          {service.description && (
                            <p className="text-xs text-gray-400 truncate mt-0.5">
                              {service.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Category */}
                    <div className="md:col-span-2 flex items-center">
                      <CategoryBadge category={service.category} />
                    </div>

                    {/* Price */}
                    <div className="md:col-span-1 text-right">
                      <span className="text-sm font-medium text-gray-900">
                        {formatPrice(service.price)}
                      </span>
                    </div>

                    {/* Duration */}
                    <div className="md:col-span-1 text-center">
                      <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                        <Clock size={14} className="text-gray-400" />
                        {service.duration_min}分
                      </span>
                    </div>

                    {/* Status Toggle */}
                    <div className="md:col-span-1 flex items-center md:justify-center gap-2">
                      <StatusToggle
                        isActive={service.is_active}
                        isLoading={isMutating === 'status'}
                        onToggle={() => handleStatusToggle(service)}
                      />
                    </div>

                    {/* Actions */}
                    <div className="md:col-span-3 flex items-center md:justify-end gap-2">
                      <button
                        onClick={() => openEditModal(service)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
                      >
                        <Pencil size={14} />
                        編輯
                      </button>
                      <button
                        onClick={() => handleDelete(service)}
                        disabled={isMutating === 'delete'}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-red-200 rounded-lg hover:bg-red-50 text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isMutating === 'delete' ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                        刪除
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Footer Info */}
      {!isLoading && !isError && filteredServices.length > 0 && (
        <p className="text-xs text-gray-400 mt-4 text-center">
          下架的服務不會顯示在前台頁面。排序順序數字越小排越前面。
        </p>
      )}

      {/* Service Create/Edit Modal */}
      <ServiceModal
        isOpen={modal.isOpen}
        mode={modal.mode}
        initialData={modal.editingService}
        categories={uniqueCategories}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  )
}

export default Services
