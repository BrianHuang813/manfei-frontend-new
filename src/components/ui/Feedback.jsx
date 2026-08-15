import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import Modal from './Modal'
import { cn } from '../../utils/cn'

const FeedbackContext = createContext(null)

const TONES = {
  success: { Icon: CheckCircle2, bar: 'bg-emerald-600', icon: 'text-emerald-700' },
  error: { Icon: AlertCircle, bar: 'bg-red-600', icon: 'text-red-700' },
  info: { Icon: Info, bar: 'bg-gold', icon: 'text-gold-dark' },
}

/**
 * Replaces window.alert / window.confirm with in-product surfaces:
 * toast() for outcomes, confirm() for destructive actions.
 */
export function FeedbackProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const [dialog, setDialog] = useState(null)
  const resolverRef = useRef(null)
  const reduceMotion = useReducedMotion()

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback((message, tone = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((current) => [...current, { id, message, tone }])
    window.setTimeout(() => dismiss(id), tone === 'error' ? 7000 : 4000)
  }, [dismiss])

  const confirm = useCallback((options) => {
    const config = typeof options === 'string' ? { message: options } : options
    setDialog({
      title: '請確認',
      confirmLabel: '確定',
      cancelLabel: '取消',
      tone: 'default',
      ...config,
    })
    return new Promise((resolve) => { resolverRef.current = resolve })
  }, [])

  const settle = useCallback((result) => {
    setDialog(null)
    resolverRef.current?.(result)
    resolverRef.current = null
  }, [])

  const value = useMemo(() => ({ toast, confirm }), [toast, confirm])

  return (
    <FeedbackContext.Provider value={value}>
      {children}

      {createPortal(
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-4 sm:right-6 z-[80] flex flex-col gap-2 w-[min(24rem,calc(100vw-2rem))] pointer-events-none"
        >
          <AnimatePresence initial={false}>
            {toasts.map(({ id, message, tone }) => {
              const { Icon, bar, icon } = TONES[tone] || TONES.info
              return (
                <motion.div
                  key={id}
                  layout={!reduceMotion}
                  initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: reduceMotion ? 0.15 : 0.32, ease: [0.16, 1, 0.3, 1] }}
                  className="pointer-events-auto relative flex items-start gap-3 bg-white rounded-xl shadow-lg shadow-secondary/10 border border-gray-200 pl-4 pr-2 py-3 overflow-hidden"
                >
                  <span className={cn('absolute left-0 top-0 bottom-0 w-1', bar)} aria-hidden="true" />
                  <Icon size={18} className={cn('shrink-0 mt-0.5', icon)} />
                  <p className="flex-1 text-sm text-secondary leading-relaxed">{message}</p>
                  <button
                    type="button"
                    onClick={() => dismiss(id)}
                    aria-label="關閉通知"
                    className="shrink-0 p-2 -m-0.5 rounded-lg text-gray-500 hover:text-secondary hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>,
        document.body,
      )}

      <Modal
        isOpen={Boolean(dialog)}
        onClose={() => settle(false)}
        title={dialog?.title || ''}
        size="sm"
        footer={(
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => settle(false)}
              className="px-4 py-2.5 min-h-[44px] text-sm rounded-lg border border-gray-300 text-secondary hover:bg-gray-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              {dialog?.cancelLabel}
            </button>
            <button
              type="button"
              onClick={() => settle(true)}
              className={cn(
                'px-4 py-2.5 min-h-[44px] text-sm rounded-lg text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                dialog?.tone === 'danger'
                  ? 'bg-red-600 hover:bg-red-700 focus-visible:ring-red-600'
                  : 'bg-gold hover:bg-gold-dark focus-visible:ring-gold',
              )}
            >
              {dialog?.confirmLabel}
            </button>
          </div>
        )}
      >
        <div className="px-6 py-5 space-y-2">
          <p className="text-sm text-secondary leading-relaxed">{dialog?.message}</p>
          {dialog?.detail && (
            <p className="text-sm text-gray-600 leading-relaxed">{dialog.detail}</p>
          )}
        </div>
      </Modal>
    </FeedbackContext.Provider>
  )
}

export function useFeedback() {
  const context = useContext(FeedbackContext)
  if (!context) throw new Error('useFeedback must be used inside <FeedbackProvider>')
  return context
}
