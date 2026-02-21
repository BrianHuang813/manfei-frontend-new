import { useState, useMemo, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
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
  Package,
  DollarSign,
} from 'lucide-react'

// ==================== Constants ====================

const CATEGORY_OPTIONS = ['護膚品', '美髮產品', '身體護理', '精油', '配件', '其他']

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
  if (!category) return null
  const colorClass = getCategoryColor(category)
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
      {category}
    </span>
  )
}

const StatusToggle = ({ isActive, isLoading, onToggle, activeLabel = '上架中', inactiveLabel = '已下架' }) => (
  <button
    onClick={onToggle}
    disabled={isLoading}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
      isActive ? 'bg-green-500' : 'bg-red-400'
    }`}
    title={isActive ? `${activeLabel} — 點擊下架` : `${inactiveLabel} — 點擊上架`}
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
        <div className="h-10 w-10 bg-gray-200 rounded" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-40" />
          <div className="h-3 bg-gray-100 rounded w-24" />
        </div>
        <div className="h-6 bg-gray-200 rounded-full w-16" />
        <div className="h-6 bg-gray-200 rounded w-11" />
      </div>
    ))}
  </div>
)

// ==================== Empty Form ====================

const EMPTY_FORM = {
  name: '',
  description: '',
  price: 0,
  spec: '',
  category: '',
  image_url: null,
  is_stock: true,
  sort_order: 0,
}

// ==================== Product Modal ====================

const ProductModal = ({ isOpen, mode, initialData, onClose, onSubmit, isPending }) => {
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setForm({
        name: initialData.name || '',
        description: initialData.description || '',
        price: initialData.price ?? 0,
        spec: initialData.spec || '',
        category: initialData.category || '',
        image_url: initialData.image_url || null,
        is_stock: initialData.is_stock ?? true,
        sort_order: initialData.sort_order || 0,
      })
    } else {
      setForm(EMPTY_FORM)
    }
  }, [mode, initialData, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl flex items-center justify-between z-10">
          <h3 className="text-lg font-semibold text-gray-900">
            {mode === 'create' ? '新增產品' : '編輯產品'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">產品名稱 *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="輸入產品名稱"
            />
          </div>

          {/* Price & Spec & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">價格 (NT$) *</label>
              <input
                type="number"
                required
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">規格</label>
              <input
                type="text"
                value={form.spec}
                onChange={(e) => setForm({ ...form, spec: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="例如 500ml"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">分類</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">未分類</option>
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="輸入產品描述"
            />
          </div>

          {/* Image */}
          <ImageUploader
            value={form.image_url}
            onChange={(url) => setForm({ ...form, image_url: url })}
            label="產品圖片"
            helpText="建議尺寸 800x800，比例 1:1"
          />

          {/* Stock & Sort */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">庫存狀態</label>
              <StatusToggle
                isActive={form.is_stock}
                isLoading={false}
                onToggle={() => setForm({ ...form, is_stock: !form.is_stock })}
                activeLabel="有庫存"
                inactiveLabel="無庫存"
              />
              <span className="text-xs text-gray-500">{form.is_stock ? '有庫存' : '無庫存'}</span>
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

const Products = () => {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [modal, setModal] = useState({ isOpen: false, mode: 'create', editingItem: null })
  const [mutatingIds, setMutatingIds] = useState(new Set())

  // Queries
  const { data: products = [], isLoading, isError, error } = useQuery({
    queryKey: ['admin-products'],
    queryFn: fetchProducts,
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      closeModal()
    },
    onError: (err) => window.alert(err.response?.data?.detail || '操作失敗'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      closeModal()
    },
    onError: (err) => window.alert(err.response?.data?.detail || '操作失敗'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteProduct(id),
    onMutate: (id) => setMutatingIds((prev) => new Set(prev).add(id)),
    onSettled: (_, __, id) =>
      setMutatingIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-products'] }),
    onError: (err) => window.alert(err.response?.data?.detail || '刪除失敗'),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_stock }) => updateProduct(id, { is_stock }),
    onMutate: ({ id }) => setMutatingIds((prev) => new Set(prev).add(id)),
    onSettled: (_, __, { id }) =>
      setMutatingIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-products'] }),
    onError: (err) => window.alert(err.response?.data?.detail || '操作失敗'),
  })

  // Filter / Search
  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category).filter(Boolean))],
    [products]
  )

  const filtered = useMemo(() => {
    let items = products
    if (search) {
      const q = search.toLowerCase()
      items = items.filter((p) => p.name.toLowerCase().includes(q))
    }
    if (filterCategory) {
      items = items.filter((p) => p.category === filterCategory)
    }
    return items
  }, [products, search, filterCategory])

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
    if (window.confirm(`確定要刪除「${item.name}」嗎？此操作無法復原。`)) {
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
            <Package size={28} />
            產品管理
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            共 {products.length} 筆產品
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium shadow-sm"
        >
          <Plus size={18} />
          新增產品
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜尋產品名稱..."
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

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <TableSkeleton />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Package size={48} className="mb-3 opacity-50" />
            <p className="text-lg font-medium">尚無產品</p>
            <p className="text-sm mt-1">點擊「新增產品」開始建立</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {/* Desktop Header */}
            <div className="hidden md:grid md:grid-cols-12 gap-4 px-4 py-3 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="col-span-1">圖片</div>
              <div className="col-span-3">名稱</div>
              <div className="col-span-2">分類</div>
              <div className="col-span-1">價格</div>
              <div className="col-span-2">規格</div>
              <div className="col-span-1">庫存</div>
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
                      {item.image_url ? (
                        <img src={item.image_url} alt="" className="h-10 w-10 object-cover rounded" />
                      ) : (
                        <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center">
                          <Package size={16} className="text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="col-span-3">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                      {item.description && (
                        <p className="text-xs text-gray-500 truncate">{item.description}</p>
                      )}
                    </div>
                    <div className="col-span-2">
                      <CategoryBadge category={item.category} />
                    </div>
                    <div className="col-span-1">
                      <span className="text-sm font-medium text-gray-900 flex items-center gap-0.5">
                        <DollarSign size={14} className="text-gray-400" />
                        {item.price.toLocaleString()}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm text-gray-600">{item.spec || '-'}</span>
                    </div>
                    <div className="col-span-1">
                      <StatusToggle
                        isActive={item.is_stock}
                        isLoading={isMutating}
                        onToggle={() =>
                          toggleMutation.mutate({ id: item.id, is_stock: !item.is_stock })
                        }
                        activeLabel="有庫存"
                        inactiveLabel="無庫存"
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
                      {item.image_url ? (
                        <img src={item.image_url} alt="" className="h-14 w-14 object-cover rounded flex-shrink-0" />
                      ) : (
                        <div className="h-14 w-14 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                          <Package size={20} className="text-gray-300" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                        <p className="text-sm font-semibold text-primary-600 mt-0.5">
                          NT$ {item.price.toLocaleString()}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {item.category && <CategoryBadge category={item.category} />}
                          {item.spec && <span className="text-xs text-gray-500">{item.spec}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <StatusToggle
                        isActive={item.is_stock}
                        isLoading={isMutating}
                        onToggle={() =>
                          toggleMutation.mutate({ id: item.id, is_stock: !item.is_stock })
                        }
                        activeLabel="有庫存"
                        inactiveLabel="無庫存"
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
      <ProductModal
        isOpen={modal.isOpen}
        mode={modal.mode}
        initialData={modal.editingItem}
        onClose={closeModal}
        onSubmit={handleSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  )
}

export default Products
