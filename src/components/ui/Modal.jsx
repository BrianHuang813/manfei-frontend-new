import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '../../utils/cn'

// Open modals, innermost last. Only the top of the stack answers Escape, so a
// dialog opened from inside another dialog closes itself first.
const stack = []

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

/**
 * Accessible dialog primitive.
 * Owns dialog semantics, focus movement, focus containment, Escape, and body
 * scroll lock so call sites only describe their content.
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  size = 'lg',
  children,
  footer,
}) {
  const panelRef = useRef(null)
  const restoreRef = useRef(null)
  const titleId = useId()

  // Move focus in on open, restore it to the trigger on close.
  useEffect(() => {
    if (!isOpen) return
    restoreRef.current = document.activeElement

    const panel = panelRef.current
    const first = panel?.querySelector(FOCUSABLE)
    ;(first || panel)?.focus()

    return () => {
      const target = restoreRef.current
      if (target && typeof target.focus === 'function') target.focus()
    }
  }, [isOpen])

  // Escape to close, Tab contained inside the panel.
  useEffect(() => {
    if (!isOpen) return

    const token = {}
    stack.push(token)

    const onKeyDown = (e) => {
      if (stack[stack.length - 1] !== token) return

      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
        return
      }
      if (e.key !== 'Tab') return

      const nodes = Array.from(panelRef.current?.querySelectorAll(FOCUSABLE) || [])
        .filter((el) => el.offsetParent !== null)
      if (nodes.length === 0) {
        e.preventDefault()
        return
      }

      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      const at = stack.indexOf(token)
      if (at !== -1) stack.splice(at, 1)
    }
  }, [isOpen, onClose])

  // Lock background scroll while open.
  useEffect(() => {
    if (!isOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [isOpen])

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-secondary/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          'relative w-full bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col outline-none',
          size === 'sm' && 'max-w-md',
          size === 'md' && 'max-w-lg',
          size === 'lg' && 'max-w-2xl',
          size === 'xl' && 'max-w-4xl',
        )}
      >
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-gray-200 shrink-0">
          <h2 id={titleId} className="font-serif text-lg text-secondary tracking-wide">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉"
            className="-mr-2 p-2.5 rounded-lg text-gray-500 hover:text-secondary hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-modal">{children}</div>

        {footer && (
          <div className="px-6 py-4 border-t border-gray-200 shrink-0">{footer}</div>
        )}
      </div>
    </div>,
    document.body,
  )
}
