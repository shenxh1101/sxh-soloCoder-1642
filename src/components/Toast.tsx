import { Info, CheckCircle, AlertTriangle, XCircle, X } from 'lucide-react'
import { useToastStore, addToast, type ToastType } from '@/stores/toastStore'

export { addToast }

const iconMap: Record<ToastType, typeof Info> = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
}

const bgMap: Record<ToastType, string> = {
  info: 'bg-navy-500 text-white',
  success: 'bg-green-600 text-white',
  warning: 'bg-gold-500 text-navy-800',
  error: 'bg-red-500 text-white',
}

function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => {
        const Icon = iconMap[toast.type]
        return (
          <div
            key={toast.id}
            className={`${bgMap[toast.type]} px-4 py-3 rounded-lg shadow-lg text-sm font-medium flex items-center gap-3 min-w-[280px]`}
          >
            <Icon size={16} className="shrink-0" />
            <span className="flex-1">{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="opacity-70 hover:opacity-100 shrink-0">
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}

export { ToastContainer }
export default ToastContainer
