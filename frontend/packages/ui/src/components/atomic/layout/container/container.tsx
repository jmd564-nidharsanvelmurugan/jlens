import type React from "react"
import { cn } from "@/lib/utils"

type Breakpoint = "base" | "sm" | "md" | "lg" | "xl"

type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>

interface ContainerProps {
  children: React.ReactNode
  size?: ResponsiveValue<"sm" | "md" | "lg" | "xl" | "full">
  padding?: ResponsiveValue<"none" | "sm" | "md" | "lg">
  centered?: boolean
  className?: string
}

const sizeClasses: Record<string, string> = {
  sm: "max-w-2xl",
  md: "max-w-4xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  full: "max-w-full",
}

const paddingClasses: Record<string, string> = {
  none: "",
  sm: "px-4",
  md: "px-6",
  lg: "px-8",
}

const breakpoints = {
  base: "",
  sm: "sm:",
  md: "md:",
  lg: "lg:",
  xl: "xl:",
}

function resolveResponsiveClasses<T extends string>(
  prop: ResponsiveValue<T>,
  classMap: Record<string, string>
) {
  if (typeof prop === "string") return classMap[prop] || ""

  return Object.entries(prop)
    .map(([breakpoint, value]) => {
      if (!value) return ""
      const prefix = breakpoints[breakpoint as Breakpoint] || ""
      return `${prefix}${classMap[value]}`
    })
    .join(" ")
}

export function Container({
  children,
  size = "lg",
  padding = "md",
  centered = true,
  className,
}: ContainerProps) {
  const sizeClass = resolveResponsiveClasses(size, sizeClasses)
  const paddingClass = resolveResponsiveClasses(padding, paddingClasses)

  return (
    <div className={cn("w-full", sizeClass, paddingClass, centered && "mx-auto", className)}>
      {children}
    </div>
  )
}
