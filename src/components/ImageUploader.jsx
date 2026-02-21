import { useState, useRef, useCallback } from 'react'
import { Upload, X, Loader2, ImageIcon } from 'lucide-react'
import { uploadImage } from '../api/admin'

/**
 * ImageUploader component with drag & drop support.
 * Uploads to Cloudinary via POST /api/admin/upload.
 *
 * @param {string} value - Current image URL (if any)
 * @param {function} onChange - Callback when image URL changes (url or null)
 * @param {string} label - Label text (e.g., "封面圖片")
 * @param {string} helpText - Hint text (e.g., "建議比例 4:3 (例如 1200x900px)")
 * @param {string} className - Additional wrapper class
 */
const ImageUploader = ({ value, onChange, label, helpText, className = '' }) => {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const handleFile = useCallback(
    async (file) => {
      if (!file) return

      // Validate on client side
      const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      if (!allowed.includes(file.type)) {
        setError('不支援的圖片格式，請上傳 JPG、PNG、WebP 或 GIF')
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        setError('圖片大小不可超過 10MB')
        return
      }

      setError(null)
      setIsUploading(true)

      try {
        const url = await uploadImage(file)
        onChange(url)
      } catch (err) {
        const detail =
          err.response?.data?.detail || err.message || '上傳失敗，請稍後再試'
        setError(detail)
      } finally {
        setIsUploading(false)
      }
    },
    [onChange]
  )

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      setIsDragOver(false)
      const file = e.dataTransfer.files?.[0]
      handleFile(file)
    },
    [handleFile]
  )

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleInputChange = useCallback(
    (e) => {
      const file = e.target.files?.[0]
      handleFile(file)
      // Reset input so the same file can be selected again
      e.target.value = ''
    },
    [handleFile]
  )

  const handleRemove = useCallback(() => {
    onChange(null)
    setError(null)
  }, [onChange])

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}

      {/* Preview or Upload Area */}
      {value ? (
        /* Image Preview */
        <div className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
          <img
            src={value}
            alt="已上傳圖片"
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              type="button"
              onClick={handleRemove}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
            >
              <X size={16} />
              移除圖片
            </button>
          </div>
        </div>
      ) : (
        /* Drop Zone */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
            isDragOver
              ? 'border-primary-400 bg-primary-50'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
          } ${isUploading ? 'pointer-events-none' : ''}`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 text-gray-500">
              <Loader2 size={32} className="animate-spin text-primary-500" />
              <span className="text-sm font-medium">上傳中...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-500">
              {isDragOver ? (
                <ImageIcon size={32} className="text-primary-500" />
              ) : (
                <Upload size={32} />
              )}
              <span className="text-sm font-medium">
                {isDragOver ? '放開以上傳圖片' : '點擊或拖曳上傳圖片'}
              </span>
              <span className="text-xs text-gray-400">
                支援 JPG、PNG、WebP、GIF（最大 10MB）
              </span>
            </div>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Help text */}
      {helpText && (
        <p className="mt-1.5 text-xs text-gray-400 flex items-center gap-1">
          <ImageIcon size={12} />
          {helpText}
        </p>
      )}

      {/* Error message */}
      {error && (
        <p className="mt-1.5 text-xs text-red-500">{error}</p>
      )}
    </div>
  )
}

export default ImageUploader
