import type React from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface AtomicAlertProps {
  variant?: "default" | "destructive" | "success" | "warning" | "info"
  title?: string
  description: string
  icon?: React.ReactNode
  dismissible?: boolean
  onDismiss?: () => void
  className?: string
}

export function AtomicAlert({
  variant = "default",
  title,
  description,
  icon,
  dismissible = false,
  onDismiss,
  className,
}: AtomicAlertProps) {
  const icons = {
    default: <Info className="h-4 w-4" />,
    destructive: <XCircle className="h-4 w-4" />,
    success: <CheckCircle className="h-4 w-4" />,
    warning: <AlertCircle className="h-4 w-4" />,
    info: <Info className="h-4 w-4" />,
  }

  const variants = {
    default: "",
    destructive: "border-red-500/50 text-red-600 [&>svg]:text-red-600",
    success: "border-green-500/50 text-green-600 [&>svg]:text-green-600",
    warning: "border-yellow-500/50 text-yellow-600 [&>svg]:text-yellow-600",
    info: "border-blue-500/50 text-blue-600 [&>svg]:text-blue-600",
  }

  return (
    <Alert className={cn(variants[variant], className)} variant={variant === "destructive" ? "destructive" : "default"}>
      {icon || icons[variant]}
      <div className="flex-1">
        {title && <AlertTitle>{title}</AlertTitle>}
        <AlertDescription>{description}</AlertDescription>
      </div>
      {dismissible && (
        <button onClick={onDismiss} className="ml-auto hover:bg-muted rounded-sm p-1">
          <XCircle className="h-4 w-4" />
        </button>
      )}
    </Alert>
  )
}
