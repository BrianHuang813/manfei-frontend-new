import { useId } from 'react'
import { cn } from '../../utils/cn'

/**
 * Associates a visible label with its control.
 *
 * Render-prop form so it works with every control shape already in use
 * (input, select, textarea, ReactQuill, ImageUploader):
 *
 *   <Field label="產品名稱" required>
 *     {(id) => <input id={id} ... />}
 *   </Field>
 */
export default function Field({ label, required, hint, error, className, children }) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-600 ml-0.5" aria-hidden="true">*</span>}
      </label>

      {children(id, { 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined })}

      {hint && !error && (
        <p id={hintId} className="mt-1 text-xs text-gray-600">{hint}</p>
      )}
      {error && (
        <p id={errorId} className="mt-1 text-xs text-red-700">{error}</p>
      )}
    </div>
  )
}

/** Shared control styling so every field in the admin panel matches. */
export const controlClass = cn(
  'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-secondary',
  'placeholder:text-gray-500',
  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
  'disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed',
)
