import { BreadcrumbItem } from "@/components/ui/breadcrumb"
import type React from "react"
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ChevronRight, Home } from "lucide-react"

interface AtomicBreadcrumbProps {
  items: { label: string; href?: string; current?: boolean }[]
  separator?: React.ReactNode
  showHome?: boolean
  homeHref?: string
  maxItems?: number
  className?: string
}

export function AtomicBreadcrumb({
  items,
  separator = <ChevronRight className="h-4 w-4" />,
  showHome = false,
  homeHref = "/",
  maxItems,
  className,
}: AtomicBreadcrumbProps) {
  let displayItems = [...items]

  // Add home item if requested
  if (showHome) {
    displayItems.unshift({
      label: "Home",
      href: homeHref,
    })
  }

  // Handle max items with ellipsis
  if (maxItems && displayItems.length > maxItems) {
    const firstItems = displayItems.slice(0, 1)
    const lastItems = displayItems.slice(-2)
    displayItems = [...firstItems, { label: "...", href: undefined }, ...lastItems]
  }

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {displayItems.map((item, index) => (
          <BreadcrumbItem key={index}>
            {item.label === "..." ? (
              <BreadcrumbEllipsis />
            ) : item.current || index === displayItems.length - 1 ? (
              <BreadcrumbPage>{item.label}</BreadcrumbPage>
            ) : (
              <BreadcrumbLink href={item.href}>
                {index === 0 && showHome ? <Home className="h-4 w-4" /> : item.label}
              </BreadcrumbLink>
            )}
            {index < displayItems.length - 1 && <BreadcrumbSeparator>{separator}</BreadcrumbSeparator>}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
