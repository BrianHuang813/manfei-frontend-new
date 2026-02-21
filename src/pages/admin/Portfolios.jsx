import { useState, useMemo, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchPortfolios,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
  fetchServices,
} from '../../api/admin'
import ImageUploader from '../../components/ImageUploader'
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  Filter,
  ImageIcon,
} from 'lucide-react'

// ==================== Constants ====================

const CATEGORY_COLORS = [
  'bg-rose-100 text-rose-700 border-rose-200',
  'bg-blue-100 text-blue-700 border-blue-200',
  'bg-emerald-100 text-emerald-700 border-emerald-200',
  'bg-amber-100 text-amber-700 border-amber-200',
  'bg-purple-100 text-purple-700 border-purple-200',
  'bg-teal-100 text-teal-700 border-teal-200',
]

function getCategoryColor(category) {
  let hash = 0
  for (let i = 0; i < (category || '').length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash)
  }
  return CATEGORY_COLORS[Math.abs(hash) % CATEGORY_COLORS.length]
}

// ==================== Sub-components ====================

const CategoryBadge = ({ category }) => {
  const colorClass = getCategoryColor(category)
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
      {category}
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
    title={isActive ? '已顯示 — 點擊隱藏' : '已隱藏 — 點擊顯示'}
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

// ==================== Empty Form ====================

const EMPTY_FORM = {
  title: '',
  description: '',
  image_url: '',
  category: '',
  service_id: null,
  is_active: true,
  display_order: 0,
  sort_order: 0,
}

// ==================== Portfolio Modal ====================

const PortfolioModal = ({ isOpen, mode, initialData, onClose, onSubmit, isPending, services }) => {
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setForm({
        title: initialData.title || '',
        description: initialData.description || '',
        image_url: initialData.image_url || '',
        category: initialData.category || '',
        service_id: initialData.service_id || null,
        is_active: initialData.is_active ?? true,
        display_order: initialData.display_order || 0,
        sort_order: initialData.sort_order || 0,
      })
    } else {
      setForm(EMPTY_FORM)
    }
  }, [mode, initialData, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    const submitData = {
      ...form,
      service_id: form.service_id || null,
      image_url: form.image_url || '',
    }
    onSubmit(submitData)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl flex items-center justify-between z-10">
          <h3 className="text-lg font-semibold text-gray-900">
            {mode === 'create' ? '新增作品' : '編輯作品'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">作品標題 *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="輸入作品標題"
            />
          </div>

          {/* Category & Service */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">分類 *</label>
              <input
                type="text"
                required
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="例如：痘痘改善、抗老"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">關聯服務（選填）</label>
              <select
                value={form.service_id || ''}
                onChange={(e) =>
                  setForm({ ...form, service_id: e.target.value ? parseInt(e.target.value) : null })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">不關聯</option>
                {(services || []).map((svc) => (
                  <option key={svc.id} value={svc.id}>
                    {svc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Image */}
          <ImageUploader
            value={form.image_url || null}
            onChange={(url) => setForm({ ...form, image_url: url || '' })}
            label="作品圖片 *"
            helpText="建議比例 4:3（例如 1200x900px）"
          />

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="輸入作品描述"
            />
          </div>

          {/* Active & Display Order */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">顯示狀態</label>
              <StatusToggle
                isActive={form.is_active}
                isLoading={false}
                onToggle={() => setForm({ ...form, is_active: !form.is_active })}
              />
              <span className="text-xs text-gray-500">{form.is_active ? '顯示中' : '已隱藏'}</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">顯示順序</label>
              <input
                type="number"
                value={form.display_order}
                onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isPending && <Loader2 size={16} className="animate-spin" />}
              {mode === 'create' ? '新增' : '儲存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ==================== Main Component ====================

const Portfolios = () => {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [modal, setModal] = useState({ isOpen: false, mode: 'create', editingItem: null })
  const [mutatingIds, setMutatingIds] = useState(new Set())

  // Queries
  const { data: portfolios = [], isLoading, isError, error } = useQuery({
    queryKey: ['admin-portfolios'],
    queryFn: fetchPortfolios,
  })

  const { data: services = [] } = useQuery({
    queryKey: ['admin-services'],
    queryFn: fetchServices,
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => createPortfolio(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-portfolios'] })
      closeModal()
    },
    onError: (err) => window.alert(err.response?.data?.detail || '操作失敗'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updatePortfolio(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-portfolios'] })
      closeModal()
    },
    onError: (err) => window.alert(err.response?.data?.detail || '操作失敗'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => deletePortfolio(id),
    onMutate: (id) => setMutatingIds((prev) => new Set(prev).add(id)),
    onSettled: (_, __, id) =>
      setMutatingIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-portfolios'] }),
    onError: (err) => window.alert(err.response?.data?.detail || '刪除失敗'),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) => updatePortfolio(id, { is_active }),
    onMutate: ({ id }) => setMutatingIds((prev) => new Set(prev).add(id)),
    onSettled: (_, __, { id }) =>
      setMutatingIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-portfolios'] }),
    onError: (err) => window.alert(err.response?.data?.detail || '操作失敗'),
  })

  // Filter / Search
  const categories = useMemo(
    () => [...new Set(portfolios.map((p) => p.category).filter(Boolean))],
    [portfolios]
  )

  const filtered = useMemo(() => {
    let items = portfolios
    if (search) {
      const q = search.toLowerCase()
      items = items.filter((p) => p.title.toLowerCase().includes(q))
    }
    if (filterCategory) {
      items = items.filter((p) => p.category === filterCategory)
    }
    return items
  }, [portfolios, search, filterCategory])

  // Modal handlers
  const openCreate = () => setModal({ isOpen: true, mode: 'create', editingItem: null })
  const openEdit = (item) => setModal({ isOpen: true, mode: 'edit', editingItem: item })
  const closeModal = () => setModal({ isOpen: false, mode: 'create', editingItem: null })

  const handleSubmit = (formData) => {
    if (modal.mode === 'create') {
      createMutation.mutate(formData)
    } else {
      updateMutation.mutate({ id: modal.editingItem.id, data: formData })
    }
  }

  const handleDelete = (item) => {
    if (window.confirm(`確定要刪除「${item.title}」嗎？此操作無法復原。`)) {
      deleteMutation.mutate(item.id)
    }
  }

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-serif font-bold text-secondary flex items-center gap-2">
            <ImageIcon size={28} />
            作品集管理
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            共 {portfolios.length} 件作品
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium shadow-sm"
        >
          <Plus size={18} />
          新增作品
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜尋作品標題..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
          />
        </div>
        <div className="relative">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="pl-9 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm appearance-none bg-white"
          >
            <option value="">所有分類</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="aspect-[4/3] bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <ImageIcon size={48} className="mb-3 opacity-50" />
            <p className="text-lg font-medium">尚無作品</p>
            <p className="text-sm mt-1">點擊「新增作品」開始建立</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => {
            const isMutating = mutatingIds.has(item.id)
            return (
              <div
                key={item.id}
                className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow ${
                  isMutating ? 'opacity-60' : ''
                }`}
              >
                {/* Image with 4:3 aspect ratio */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon size={40} className="text-gray-300" />
                    </div>
                  )}
                  {/* Status badge overlay */}
                  {!item.is_active && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                      已隱藏
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{item.title}</h3>
                      <div className="flex items-center gap-2 mt-1.5">
                        <CategoryBadge category={item.category} />
                        {item.service_name && (
                          <span className="text-xs text-gray-500 truncate">
                            {item.service_name}
                          </span>
                        )}
                      </div>
                    </div>
                    <StatusToggle
                      isActive={item.is_active}
                      isLoading={isMutating}
                      onToggle={() =>
                        toggleMutation.mutate({ id: item.id, is_active: !item.is_active })
                      }
                    />
                  </div>

                  {item.description && (
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">{item.description}</p>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end gap-1 mt-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => openEdit(item)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="編輯"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      disabled={isMutating}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="刪除"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      <PortfolioModal
        isOpen={modal.isOpen}
        mode={modal.mode}
        initialData={modal.editingItem}
        onClose={closeModal}
        onSubmit={handleSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
        services={services}
      />
    </div>
  )
}

export default Portfolios
