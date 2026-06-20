import type React from "react"

import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { AtomicButton } from "@/components/atomic/atoms/button/button"

interface AtomicSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  side?: "top" | "right" | "bottom" | "left"
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
  className?: string
}

export function AtomicSheet({
  open,
  onOpenChange,
  side = "right",
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
  className,
}: AtomicSheetProps) {
  const sizes = {
    sm: "w-80",
    md: "w-96",
    lg: "w-[500px]",
    xl: "w-[600px]",
    full: "w-full",
  }

  const handleCancel = () => {
    onCancel?.()
    onOpenChange(false)
  }

  const handleConfirm = () => {
    onConfirm?.()
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={side} className={`${sizes[size]} ${className}`}>
        {(title || description) && (
          <SheetHeader>
            {title && <SheetTitle>{title}</SheetTitle>}
            {description && <SheetDescription>{description}</SheetDescription>}
          </SheetHeader>
        )}

        <div className="flex-1 py-4">{children}</div>

        {(footer || confirmText || onCancel) && (
          <SheetFooter>
            {footer || (
              <div className="flex gap-2">
                {onCancel && <AtomicButton variant="outline" text={cancelText} onClick={handleCancel} />}
                {confirmText && <AtomicButton text={confirmText} onClick={handleConfirm} loading={confirmLoading} />}
              </div>
            )}
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
