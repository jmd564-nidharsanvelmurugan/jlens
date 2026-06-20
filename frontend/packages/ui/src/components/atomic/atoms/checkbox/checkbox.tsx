import { Checkbox as ShadcnCheckbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface AtomicCheckboxProps {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  label?: string
  description?: string
  disabled?: boolean
  required?: boolean
  error?: string
  className?: string
  size?: "sm" | "md" | "lg"
}

export function AtomicCheckbox({
  checked,
  onCheckedChange,
  label,
  description,
  disabled = false,
  required = false,
  error,
  className,
  size = "md",
}: AtomicCheckboxProps) {
  const sizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }

  const checkboxId = `checkbox-${Math.random().toString(36).substr(2, 9)}`

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center space-x-2">
        <ShadcnCheckbox
          id={checkboxId}
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          className={cn(sizes[size], error && "border-red-500")}
        />
        {label && (
          <div className="grid gap-1.5 leading-none">
            <Label
              htmlFor={checkboxId}
              className={cn(
                disabled && "opacity-50",
                required && "after:content-['*'] after:ml-0.5 after:text-red-500",
              )}
            >
              {label}
            </Label>
            {description && (
              <p className={cn("text-sm text-muted-foreground", disabled && "opacity-50")}>{description}</p>
            )}
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
