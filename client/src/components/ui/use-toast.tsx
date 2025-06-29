// Adapted from: https://ui.shadcn.com/docs/components/toast
import * as React from "react"

import { 
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  type ToastProps,
} from "@/components/ui/toast"

const TOAST_TIMEOUT = 5000

type ToastActionElement = React.ReactElement

export const useToast = () => {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const toast = React.useCallback(
    ({ ...props }: ToastProps) => {
      const id = Math.random().toString(36).slice(2)
      const newToast = { ...props, id }

      setToasts((prevToasts) => [...prevToasts, newToast])

      return () => {
        setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
      }
    },
    []
  )

  const dismiss = React.useCallback((toastId?: string) => {
    setToasts((prevToasts) =>
      toastId
        ? prevToasts.filter((toast) => toast.id !== toastId)
        : []
    )
  }, [])

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setToasts((prevToasts) => {
        if (prevToasts.length > 0) {
          return prevToasts.slice(1)
        }
        return prevToasts
      })
    }, TOAST_TIMEOUT)

    return () => clearTimeout(timer)
  }, [toasts])

  return {
    toast,
    dismiss,
    toasts,
  }
}

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, children, ...props }) => (
        <Toast key={id} {...props} onClick={() => dismiss(id)}>
          <div className="flex gap-1 flex-col">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
            {children && <ToastDescription>{children}</ToastDescription>}
          </div>
          <ToastClose onClick={() => dismiss(id)} />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}
