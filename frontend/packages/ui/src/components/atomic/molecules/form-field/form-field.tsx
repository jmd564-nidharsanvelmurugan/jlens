import { AtomicInput } from "@/components/atomic/atoms/input/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface FormFieldProps {
  type: "input" | "select" | "textarea"
  label?: string
  placeholder?: string
  options?: { value: string; label: string }[]
  error?: string
  helperText?: string
  required?: boolean
  className?: string
  value?: string
  onChange?: (value: string) => void
}

export function FormField({
  type,
  label,
  placeholder,
  options = [],
  error,
  helperText,
  required = false,
  className,
  value,
  onChange,
}: FormFieldProps) {
  const fieldId = `field-${Math.random().toString(36).substr(2, 9)}`

  if (type === "input") {
    return (
      <AtomicInput
        label={label}
        placeholder={placeholder}
        error={error}
        helperText={helperText}
        required={required}
        className={className}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
    )
  }

  if (type === "select") {
    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={fieldId} className={cn(required && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
            {label}
          </Label>
        )}
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className={cn(error && "border-red-500", className)}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {helperText && !error && <p className="text-sm text-muted-foreground">{helperText}</p>}
      </div>
    )
  }

  if (type === "textarea") {
    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={fieldId} className={cn(required && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
            {label}
          </Label>
        )}
        <Textarea
          id={fieldId}
          placeholder={placeholder}
          className={cn(error && "border-red-500", className)}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        {helperText && !error && <p className="text-sm text-muted-foreground">{helperText}</p>}
      </div>
    )
  }

  return null
}
