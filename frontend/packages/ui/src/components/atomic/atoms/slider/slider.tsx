import { Slider as ShadcnSlider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface AtomicSliderProps {
  value: number[]
  onValueChange?: (value: number[]) => void
  min?: number
  max?: number
  step?: number
  label?: string
  showValue?: boolean
  disabled?: boolean
  className?: string
  orientation?: "horizontal" | "vertical"
}

export function AtomicSlider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  showValue = false,
  disabled = false,
  className,
  orientation = "horizontal",
}: AtomicSliderProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {(label || showValue) && (
        <div className="flex justify-between">
          {label && <Label>{label}</Label>}
          {showValue && <span className="text-sm text-muted-foreground">{value[0]}</span>}
        </div>
      )}
      <ShadcnSlider
        value={value}
        onValueChange={onValueChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        orientation={orientation}
        className="w-full"
      />
    </div>
  )
}
