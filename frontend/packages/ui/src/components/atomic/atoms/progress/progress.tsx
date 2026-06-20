import { Progress as ShadcnProgress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface AtomicProgressProps {
  value: number
  max?: number
  size?: "sm" | "md" | "lg"
  variant?: "default" | "success" | "warning" | "error"
  showValue?: boolean
  label?: string
  className?: string
}

export function AtomicProgress({
  value,
  max = 100,
  size = "md",
  variant = "default",
  showValue = false,
  label,
  className,
}: AtomicProgressProps) {
  const sizes = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
  }

  const variants = {
    default: "",
    success: "[&>div]:bg-green-500",
    warning: "[&>div]:bg-yellow-500",
    error: "[&>div]:bg-red-500",
  }

  const percentage = Math.round((value / max) * 100)

  return (
    <div className={cn("space-y-2", className)}>
      {(label || showValue) && (
        <div className="flex justify-between text-sm">
          {label && <span>{label}</span>}
          {showValue && <span>{percentage}%</span>}
        </div>
      )}
      <ShadcnProgress value={percentage} className={cn(sizes[size], variants[variant])} />
    </div>
  )
}
