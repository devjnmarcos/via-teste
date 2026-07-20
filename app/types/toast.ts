export type ToastTone = 'success' | 'error' | 'info'

export interface ToastItem {
  id: string
  tone: ToastTone
  title: string
  description?: string
  duration: number
}

export type ToastInput = {
  tone: ToastTone
  title: string
  description?: string
  duration?: number
  id?: string
}
