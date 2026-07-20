import type { ToastInput, ToastItem, ToastTone } from '../types/toast'

const DEFAULT_DURATION = 4200

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

/**
 * Sistema de toasts Via — estado compartilhado via `useState`.
 * Dispare com `success` / `error` / `info` de qualquer componente ou página.
 */
export function useToast() {
  const toasts = useState<ToastItem[]>('via-toasts', () => [])
  const timers = useState<Record<string, ReturnType<typeof setTimeout>>>('via-toast-timers', () => ({}))

  function dismiss(id: string) {
    const timer = timers.value[id]
    if (timer) {
      clearTimeout(timer)
      const nextTimers = { ...timers.value }
      delete nextTimers[id]
      timers.value = nextTimers
    }
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  function push(input: ToastInput): string {
    const id = input.id ?? createId()
    const duration = input.duration ?? DEFAULT_DURATION
    const item: ToastItem = {
      id,
      tone: input.tone,
      title: input.title,
      description: input.description,
      duration
    }
    toasts.value = [...toasts.value, item]

    if (import.meta.client && duration > 0) {
      timers.value = {
        ...timers.value,
        [id]: setTimeout(() => dismiss(id), duration)
      }
    }

    return id
  }

  function notify(tone: ToastTone, title: string, description?: string, duration?: number) {
    return push({ tone, title, description, duration })
  }

  function success(title: string, description?: string, duration?: number) {
    return notify('success', title, description, duration)
  }

  function error(title: string, description?: string, duration?: number) {
    return notify('error', title, description, duration)
  }

  function info(title: string, description?: string, duration?: number) {
    return notify('info', title, description, duration)
  }

  function clear() {
    for (const id of Object.keys(timers.value)) {
      clearTimeout(timers.value[id])
    }
    timers.value = {}
    toasts.value = []
  }

  return {
    toasts,
    push,
    success,
    error,
    info,
    dismiss,
    clear
  }
}
