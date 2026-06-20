import type React from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface TabItem {
  value: string
  label: string
  content: React.ReactNode
  disabled?: boolean
  icon?: React.ReactNode
}

interface AtomicTabsProps {
  items: TabItem[]
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  orientation?: "horizontal" | "vertical"
  variant?: "default" | "pills" | "underline"
  className?: string
  contentClassName?: string
}

export function AtomicTabs({
  items,
  defaultValue,
  value,
  onValueChange,
  orientation = "horizontal",
  variant = "default",
  className,
  contentClassName,
}: AtomicTabsProps) {
  const variants = {
    default: "",
    pills: "[&>div]:bg-muted [&>div]:p-1 [&>div]:rounded-lg",
    underline: "[&>div]:border-b [&>div]:bg-transparent",
  }

  return (
    <Tabs
      defaultValue={defaultValue || items[0]?.value}
      value={value}
      onValueChange={onValueChange}
      orientation={orientation}
      className={cn(orientation === "vertical" && "flex gap-4", className)}
    >
      <TabsList className={cn(variants[variant], orientation === "vertical" && "flex-col h-fit")}>
        {items.map((item) => (
          <TabsTrigger key={item.value} value={item.value} disabled={item.disabled} className="flex items-center gap-2">
            {item.icon}
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {items.map((item) => (
        <TabsContent key={item.value} value={item.value} className={cn("flex-1", contentClassName)}>
          {item.content}
        </TabsContent>
      ))}
    </Tabs>
  )
}
