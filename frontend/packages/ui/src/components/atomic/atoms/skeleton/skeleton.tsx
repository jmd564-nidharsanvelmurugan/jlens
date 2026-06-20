import { Skeleton as ShadcnSkeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface AtomicSkeletonProps {
  variant?: "text" | "circular" | "rectangular" | "avatar" | "button"
  width?: string | number
  height?: string | number
  lines?: number
  className?: string
}

export function AtomicSkeleton({ variant = "rectangular", width, height, lines = 1, className }: AtomicSkeletonProps) {
  const variants = {
    text: "h-4 w-full",
    circular: "h-12 w-12 rounded-full",
    rectangular: "h-4 w-full",
    avatar: "h-10 w-10 rounded-full",
    button: "h-10 w-20",
  }

  if (variant === "text" && lines > 1) {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <ShadcnSkeleton key={i} className={cn(variants.text, i === lines - 1 && "w-3/4")} style={{ width, height }} />
        ))}
      </div>
    )
  }

  return <ShadcnSkeleton className={cn(variants[variant], className)} style={{ width, height }} />
}
