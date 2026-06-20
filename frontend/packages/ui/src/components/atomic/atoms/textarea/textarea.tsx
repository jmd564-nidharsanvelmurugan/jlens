import { Textarea as ShadcnTextarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface AtomicTextareaProps {
  value?: string
  onChange?: (value: string) => void
  label?: string
  placeholder?: string
  description?: string
  error?: string
  disabled?: boolean
  required?: boolean
  rows?: number
  maxLength?: number
  showCount?: boolean
  resize?: "none" | "vertical" | "horizontal" | "both"
  className?: string
}

export function AtomicTextarea({
  value,
  onChange,
  label,
  placeholder,
  description,
  error,
  disabled = false,
  required = false,
  rows = 3,
  maxLength,
  showCount = false,
  resize = "vertical",
  className,
}: AtomicTextareaProps) {
  const textareaId = `textarea-${Math.random().toString(36).substr(2, 9)}`
  const currentLength = value?.length || 0

  const resizeClasses = {
    none: "resize-none",
    vertical: "resize-y",
    horizontal: "resize-x",
    both: "resize",
  }

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={textareaId} className={cn(required && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
          {label}
        </Label>
      )}

      <ShadcnTextarea
        id={textareaId}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        className={cn(resizeClasses[resize], error && "border-red-500 focus-visible:ring-red-500", className)}
      />

      <div className="flex justify-between text-sm">
        <div>
          {description && !error && <p className="text-muted-foreground">{description}</p>}
          {error && <p className="text-red-500">{error}</p>}
        </div>

        {showCount && maxLength && (
          <p
            className={cn(
              "text-muted-foreground",
              currentLength > maxLength * 0.9 && "text-yellow-600",
              currentLength >= maxLength && "text-red-500",
            )}
          >
            {currentLength}/{maxLength}
          </p>
        )}
      </div>
    </div>
  )
}
