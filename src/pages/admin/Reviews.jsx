import { useState, useMemo, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
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
  Star,
  MessageSquare,
} from 'lucide-react'

// ==================== Sub-components ====================

const StarRating = ({ rating, size = 16 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        size={size}
        className={star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}
      />
    ))}
  </div>
)

const StarSelector = ({ value, onChange }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => onChange(star)}
        className="p-0.5 hover:scale-110 transition-transform"
      >
        <Star
          size={24}
          className={star <= value ? 'fill-amber-400 text-amber-400' : 'text-gray-300 hover:text-amber-300'}
        />
      </button>
    ))}
    <span className="ml-2 text-sm text-gray-500">{value} 顆星</span>
  </div>
)

const StatusToggle = ({ isActive, isLoading, onToggle }) => (
  <button
    onClick={onToggle}
    disabled={isLoading}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
      isActive ? 'bg-green-500' : 'bg-red-400'
    }`}
    title={isActive ? '顯示中 — 點擊隱藏' : '已隱藏 — 點擊顯示'}
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

const TableSkeleton = () => (
  <div className="animate-pulse">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 border-b border-gray-100">
        <div className="h-10 w-10 bg-gray-200 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-32" />
          <div className="h-3 bg-gray-100 rounded w-48" />
        </div>
        <div className="h-4 bg-gray-200 rounded w-20" />
        <div className="h-6 bg-gray-200 rounded w-11" />
      </div>
    ))}
  </div>
)

const AvatarCircle = ({ name, url }) => {
  if (url) {
    return <img src={url} alt={name} className="h-10 w-10 rounded-full object-cover" />
  }
  // Generate color from name
  let hash = 0
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const colors = [
    'bg-rose-500',
    'bg-blue-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-purple-500',
    'bg-teal-500',
  ]
  const bgColor = colors[Math.abs(hash) % colors.length]
  const initial = (name || '?').charAt(0).toUpperCase()

  return (
    <div
      className={`h-10 w-10 rounded-full ${bgColor} flex items-center justify-center text-white font-semibold text-sm`}
    >
      {initial}
    </div>
  )
}

// ==================== Empty Form ====================

const EMPTY_FORM = {
  customer_name: '',
  content: '',
  rating: 5,
  avatar_url: null,
  is_active: true,
  sort_order: 0,
}

// ==================== Review Modal ====================

const ReviewModal = ({ isOpen, mode, initialData, onClose, onSubmit, isPending, nextSortOrder }) => {
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setForm({
        customer_name: initialData.customer_name || '',
        content: initialData.content || '',
        rating: initialData.rating ?? 5,
        avatar_url: initialData.avatar_url || null,
        is_active: initialData.is_active ?? true,
        sort_order: initialData.sort_order ?? 0,
      })
    } else {
      setForm({ ...EMPTY_FORM, sort_order: nextSortOrder || 1 })
    }
  }, [mode, initialData, isOpen, nextSortOrder])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl flex items-center justify-between z-10">
          <h3 className="text-lg font-semibold text-gray-900">
            {mode === 'create' ? '新增評價' : '編輯評價'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Customer Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">客戶名稱 *</label>
            <input
              type="text"
              required
              value={form.customer_name}
              onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="輸入客戶名稱"
            />
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">評分 *</label>
            <StarSelector
              value={form.rating}
              onChange={(rating) => setForm({ ...form, rating })}
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">評論內容 *</label>
            <textarea
              required
              rows={4}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="輸入客戶評論"
            />
          </div>

          {/* Avatar */}
          <ImageUploader
            value={form.avatar_url}
            onChange={(url) => setForm({ ...form, avatar_url: url })}
            label="客戶頭像（選填）"
            helpText="建議尺寸 200x200，正方形"
          />

          {/* Active & Sort */}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">排序</label>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
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

const Reviews = () => {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [filterRating, setFilterRating] = useState('')
  const [modal, setModal] = useState({ isOpen: false, mode: 'create', editingItem: null })
  const [mutatingIds, setMutatingIds] = useState(new Set())

  // Queries
  const { data: reviews = [], isLoading, isError, error } = useQuery({
    queryKey: ['admin-testimonials'],
    queryFn: fetchTestimonials,
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => createTestimonial(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] })
      closeModal()
    },
    onError: (err) => window.alert(err.response?.data?.detail || '操作失敗'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateTestimonial(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] })
      closeModal()
    },
    onError: (err) => window.alert(err.response?.data?.detail || '操作失敗'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteTestimonial(id),
    onMutate: (id) => setMutatingIds((prev) => new Set(prev).add(id)),
    onSettled: (_, __, id) =>
      setMutatingIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] }),
    onError: (err) => window.alert(err.response?.data?.detail || '刪除失敗'),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) => updateTestimonial(id, { is_active }),
    onMutate: ({ id }) => setMutatingIds((prev) => new Set(prev).add(id)),
    onSettled: (_, __, { id }) =>
      setMutatingIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] }),
    onError: (err) => window.alert(err.response?.data?.detail || '操作失敗'),
  })

  // Filter / Search
  const filtered = useMemo(() => {
    let items = reviews
    if (search) {
      const q = search.toLowerCase()
      items = items.filter(
        (r) =>
          r.customer_name.toLowerCase().includes(q) || r.content.toLowerCase().includes(q)
      )
    }
    if (filterRating) {
      items = items.filter((r) => r.rating === parseInt(filterRating))
    }
    return items
  }, [reviews, search, filterRating])

  // Modal handlers
  const openCreate = () => {
    const maxOrder = reviews.length > 0 ? Math.max(...reviews.map(r => r.sort_order || 0)) : 0
    setModal({ isOpen: true, mode: 'create', editingItem: null, nextSortOrder: maxOrder + 1 })
  }
  const openEdit = (item) => setModal({ isOpen: true, mode: 'edit', editingItem: item, nextSortOrder: 0 })
  const closeModal = () => setModal({ isOpen: false, mode: 'create', editingItem: null })

  const handleSubmit = (formData) => {
    if (modal.mode === 'create') {
      createMutation.mutate(formData)
    } else {
      updateMutation.mutate({ id: modal.editingItem.id, data: formData })
    }
  }

  const handleDelete = (item) => {
    if (window.confirm(`確定要刪除「${item.customer_name}」的評價嗎？此操作無法復原。`)) {
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
            <MessageSquare size={28} />
            客戶評價管理
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            共 {reviews.length} 則評價
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium shadow-sm"
        >
          <Plus size={18} />
          新增評價
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜尋客戶名稱或内容..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
          />
        </div>
        <div className="relative">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="pl-9 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm appearance-none bg-white"
          >
            <option value="">所有評分</option>
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>{r} 顆星</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <TableSkeleton />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <MessageSquare size={48} className="mb-3 opacity-50" />
            <p className="text-lg font-medium">尚無評價</p>
            <p className="text-sm mt-1">點擊「新增評價」開始建立</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {/* Desktop Header */}
            <div className="hidden md:grid md:grid-cols-12 gap-4 px-4 py-3 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="col-span-1">頭像</div>
              <div className="col-span-2">客戶</div>
              <div className="col-span-3">評論</div>
              <div className="col-span-2">評分</div>
              <div className="col-span-1">排序</div>
              <div className="col-span-1">狀態</div>
              <div className="col-span-2 text-right">操作</div>
            </div>

            {filtered.map((item) => {
              const isMutating = mutatingIds.has(item.id)
              return (
                <div
                  key={item.id}
                  className={`px-4 py-3 hover:bg-gray-50 transition-colors ${isMutating ? 'opacity-60' : ''}`}
                >
                  {/* Desktop Row */}
                  <div className="hidden md:grid md:grid-cols-12 gap-4 items-center">
                    <div className="col-span-1">
                      <AvatarCircle name={item.customer_name} url={item.avatar_url} />
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-900">{item.customer_name}</p>
                    </div>
                    <div className="col-span-3">
                      <p className="text-sm text-gray-600 line-clamp-2">{item.content}</p>
                    </div>
                    <div className="col-span-2">
                      <StarRating rating={item.rating} />
                    </div>
                    <div className="col-span-1">
                      <span className="text-sm text-gray-500 font-mono">{item.sort_order}</span>
                    </div>
                    <div className="col-span-1">
                      <StatusToggle
                        isActive={item.is_active}
                        isLoading={isMutating}
                        onToggle={() =>
                          toggleMutation.mutate({ id: item.id, is_active: !item.is_active })
                        }
                      />
                    </div>
                    <div className="col-span-2 flex justify-end gap-1">
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

                  {/* Mobile Card */}
                  <div className="md:hidden space-y-3">
                    <div className="flex items-start gap-3">
                      <AvatarCircle name={item.customer_name} url={item.avatar_url} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{item.customer_name}</p>
                        <StarRating rating={item.rating} size={14} />
                        <p className="text-sm text-gray-600 mt-1 line-clamp-3">{item.content}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <StatusToggle
                        isActive={item.is_active}
                        isLoading={isMutating}
                        onToggle={() =>
                          toggleMutation.mutate({ id: item.id, is_active: !item.is_active })
                        }
                      />
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEdit(item)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          disabled={isMutating}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      <ReviewModal
        isOpen={modal.isOpen}
        mode={modal.mode}
        initialData={modal.editingItem}
        onClose={closeModal}
        onSubmit={handleSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
        nextSortOrder={modal.nextSortOrder}
      />
    </div>
  )
}

export default Reviews
