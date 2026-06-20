import React from "react"

import { FormField } from "@/components/atomic/molecules/form-field/form-field"
import { AtomicButton } from "@/components/atomic/atoms/button/button"
import { AtomicCard } from "@/components/atomic/atoms/card/card"
import { cn } from "@/lib/utils"

interface FormFieldConfig {
  name: string
  type: "input" | "select" | "textarea"
  label?: string
  placeholder?: string
  options?: { value: string; label: string }[]
  required?: boolean
  validation?: (value: string) => string | undefined
}

interface AtomicFormProps {
  title?: string
  description?: string
  fields: FormFieldConfig[]
  submitText?: string
  cancelText?: string
  loading?: boolean
  onSubmit?: (data: Record<string, string>) => void
  onCancel?: () => void
  className?: string
  showCard?: boolean
}

export function AtomicForm({
  title,
  description,
  fields,
  submitText = "Submit",
  cancelText = "Cancel",
  loading = false,
  onSubmit,
  onCancel,
  className,
  showCard = true,
}: AtomicFormProps) {
  const [formData, setFormData] = React.useState<Record<string, string>>({})
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const handleFieldChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    fields.forEach((field) => {
      const value = formData[field.name] || ""

      if (field.required && !value.trim()) {
        newErrors[field.name] = `${field.label || field.name} is required`
      } else if (field.validation) {
        const error = field.validation(value)
        if (error) {
          newErrors[field.name] = error
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit?.(formData)
    }
  }

  const formContent = (
    <form onSubmit={handleSubmit} className={cn("space-y-4", className)}>
      {fields.map((field) => (
        <FormField
          key={field.name}
          type={field.type}
          label={field.label}
          placeholder={field.placeholder}
          options={field.options}
          required={field.required}
          error={errors[field.name]}
          value={formData[field.name] || ""}
          onChange={(value) => handleFieldChange(field.name, value)}
        />
      ))}

      <div className="flex gap-2 pt-4">
        <AtomicButton type="submit" text={submitText} loading={loading} className="flex-1" />
        {onCancel && <AtomicButton type="button" variant="outline" text={cancelText} onClick={onCancel} />}
      </div>
    </form>
  )

  if (showCard) {
    return <AtomicCard title={title} description={description} content={formContent} />
  }

  return formContent
}
