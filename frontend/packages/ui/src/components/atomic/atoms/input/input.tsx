import { Input as ShadcnInput } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { InputProps as ShadcnInputProps } from "@/components/ui/input"

interface AtomicInputProps extends ShadcnInputProps {
  label?: string
  error?: string
  helperText?: string
  required?: boolean
  containerClassName?: string
}


export function AtomicInput({
  label,
  error,
  helperText,
  required = false,
  containerClassName,
  className,
  id,
  ...props
}: AtomicInputProps) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`

  return (
    <div className={cn("space-y-2", containerClassName)}>
      {label && (
        <Label htmlFor={inputId} className={cn(required && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
          {label}
        </Label>
      )}
      <ShadcnInput
        id={inputId}
        className={cn(error && "border-red-500", className)}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      {helperText && !error && <p className="text-sm text-muted-foreground">{helperText}</p>}
    </div>
  )
}
