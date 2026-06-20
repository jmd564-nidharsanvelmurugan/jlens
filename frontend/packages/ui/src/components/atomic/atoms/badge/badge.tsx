import type React from "react"

import { Badge as ShadcnBadge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { VariantProps } from "class-variance-authority"
import type { badgeVariants } from "@/components/ui/badge"

interface AtomicBadgeProps extends VariantProps<typeof badgeVariants> {
  text: string
  icon?: React.ReactNode
  iconPosition?: "left" | "right"
  className?: string
  onClick?: () => void
  removable?: boolean
  onRemove?: () => void
}

export function AtomicBadge({
  text,
  icon,
  iconPosition = "left",
  className,
  variant,
  onClick,
  removable = false,
  onRemove,
}: AtomicBadgeProps) {
  return (
    <ShadcnBadge
      variant={variant}
      className={cn(onClick && "cursor-pointer hover:opacity-80", className)}
      onClick={onClick}
    >
      {icon && iconPosition === "left" && <span className="mr-1">{icon}</span>}
      {text}
      {icon && iconPosition === "right" && <span className="ml-1">{icon}</span>}
      {removable && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove?.()
          }}
          className="ml-1 hover:bg-muted rounded-full p-0.5"
        >
          ×
        </button>
      )}
    </ShadcnBadge>
  )
}
