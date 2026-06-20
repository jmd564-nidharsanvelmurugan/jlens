import type React from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AtomicButton } from "@/components/atomic/atoms/button/button"
import { X } from "lucide-react"

interface AtomicDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
  confirmLoading?: boolean
  size?: "sm" | "md" | "lg" | "xl" | "full"
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  className?: string
}

export function AtomicDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  confirmText,
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  confirmLoading = false,
  size = "md",
  showCloseButton = true,
  closeOnOverlayClick = true,
  className,
}: AtomicDialogProps) {
  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-full m-4",
  }

  const handleCancel = () => {
    onCancel?.()
    onOpenChange(false)
  }

  const handleConfirm = () => {
    onConfirm?.()
  }

  return (
    <Dialog open={open} onOpenChange={closeOnOverlayClick ? onOpenChange : undefined}>
      <DialogContent className={`${sizes[size]} ${className}`}>
        {showCloseButton && (
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {(title || description) && (
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}

        <div className="py-4">{children}</div>

        {(footer || confirmText || onCancel) && (
          <DialogFooter>
            {footer || (
              <div className="flex gap-2">
                {onCancel && <AtomicButton variant="outline" text={cancelText} onClick={handleCancel} />}
                {confirmText && <AtomicButton text={confirmText} onClick={handleConfirm} loading={confirmLoading} />}
              </div>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
