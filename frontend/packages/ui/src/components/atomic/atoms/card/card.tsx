import type React from "react"
import {
  Card as ShadcnCard,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface AtomicCardProps {
  title?: string
  description?: string
  content?: React.ReactNode
  footer?: React.ReactNode
  children?: React.ReactNode
  className?: string
  headerClassName?: string
  contentClassName?: string
  footerClassName?: string
  onClick?: () => void
  variant?: "default" | "outline" | "ghost"
}

export function AtomicCard({
  title,
  description,
  content,
  footer,
  children,
  className,
  headerClassName,
  contentClassName,
  footerClassName,
  onClick,
  variant = "default",
}: AtomicCardProps) {
  const variantStyles = {
    default: "",
    outline: "border-2",
    ghost: "border-0 shadow-none",
  }

  return (
    <ShadcnCard className={cn(variantStyles[variant], className)} onClick={onClick}>
      {(title || description) && (
        <CardHeader className={headerClassName}>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}

      <CardContent className={contentClassName}>{content || children}</CardContent>

      {footer && <CardFooter className={footerClassName}>{footer}</CardFooter>}
    </ShadcnCard>
  )
}
