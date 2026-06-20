import { Switch as ShadcnSwitch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface AtomicSwitchProps {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  label?: string
  description?: string
  disabled?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
  labelPosition?: "left" | "right"
}

export function AtomicSwitch({
  checked,
  onCheckedChange,
  label,
  description,
  disabled = false,
  size = "md",
  className,
  labelPosition = "right",
}: AtomicSwitchProps) {
  const sizes = {
    sm: "scale-75",
    md: "scale-100",
    lg: "scale-125",
  }

  const switchElement = (
    <ShadcnSwitch
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      className={cn(sizes[size], className)}
    />
  )

  if (!label) {
    return switchElement
  }

  return (
    <div className="flex items-center space-x-2">
      {labelPosition === "left" && (
        <div className="grid gap-1.5 leading-none">
          <Label className={cn(disabled && "opacity-50")}>{label}</Label>
          {description && (
            <p className={cn("text-sm text-muted-foreground", disabled && "opacity-50")}>{description}</p>
          )}
        </div>
      )}
      {switchElement}
      {labelPosition === "right" && (
        <div className="grid gap-1.5 leading-none">
          <Label className={cn(disabled && "opacity-50")}>{label}</Label>
          {description && (
            <p className={cn("text-sm text-muted-foreground", disabled && "opacity-50")}>{description}</p>
          )}
        </div>
      )}
    </div>
  )
}
