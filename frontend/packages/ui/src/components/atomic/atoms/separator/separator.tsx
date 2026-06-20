import { Separator as ShadcnSeparator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface AtomicSeparatorProps {
  orientation?: "horizontal" | "vertical"
  className?: string
  decorative?: boolean
  text?: string
  textPosition?: "left" | "center" | "right"
}

export function AtomicSeparator({
  orientation = "horizontal",
  className,
  decorative = true,
  text,
  textPosition = "center",
}: AtomicSeparatorProps) {
  if (text) {
    const textPositions = {
      left: "justify-start",
      center: "justify-center",
      right: "justify-end",
    }

    return (
      <div className={cn("relative flex items-center", className)}>
        <ShadcnSeparator className="flex-1" />
        <div className={cn("flex px-3", textPositions[textPosition])}>
          <span className="text-sm text-muted-foreground bg-background px-2">{text}</span>
        </div>
        <ShadcnSeparator className="flex-1" />
      </div>
    )
  }

  return <ShadcnSeparator orientation={orientation} decorative={decorative} className={className} />
}
