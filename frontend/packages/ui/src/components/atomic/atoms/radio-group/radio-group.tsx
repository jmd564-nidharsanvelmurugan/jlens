import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface RadioOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

interface AtomicRadioGroupProps {
  value?: string
  onValueChange?: (value: string) => void
  options: RadioOption[]
  label?: string
  description?: string
  orientation?: "horizontal" | "vertical"
  disabled?: boolean
  required?: boolean
  error?: string
  className?: string
}

export function AtomicRadioGroup({
  value,
  onValueChange,
  options,
  label,
  description,
  orientation = "vertical",
  disabled = false,
  required = false,
  error,
  className,
}: AtomicRadioGroupProps) {
  const groupId = `radio-group-${Math.random().toString(36).substr(2, 9)}`

  return (
    <div className={cn("space-y-3", className)}>
      {label && (
        <Label className={cn("text-sm font-medium", required && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
          {label}
        </Label>
      )}
      {description && <p className="text-sm text-muted-foreground">{description}</p>}

      <RadioGroup
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        className={cn(orientation === "horizontal" && "flex flex-wrap gap-4")}
      >
        {options.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <RadioGroupItem
              value={option.value}
              id={`${groupId}-${option.value}`}
              disabled={option.disabled || disabled}
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor={`${groupId}-${option.value}`}
                className={cn((option.disabled || disabled) && "opacity-50")}
              >
                {option.label}
              </Label>
              {option.description && (
                <p className={cn("text-sm text-muted-foreground", (option.disabled || disabled) && "opacity-50")}>
                  {option.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </RadioGroup>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
