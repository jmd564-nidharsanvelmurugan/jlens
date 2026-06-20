import type React from "react"
import { cn } from "@/lib/utils"

interface AppLayoutProps {
  children: React.ReactNode
  header?: React.ReactNode
  sidebar?: React.ReactNode
  footer?: React.ReactNode
  className?: string
  sidebarWidth?: "sm" | "md" | "lg"
  layout?: "default" | "sidebar" | "centered"
}

export function AppLayout({
  children,
  header,
  sidebar,
  footer,
  className,
  sidebarWidth = "md",
  layout = "default",
}: AppLayoutProps) {
  const sidebarWidths = {
    sm: "w-64",
    md: "w-80",
    lg: "w-96",
  }

  if (layout === "sidebar" && sidebar) {
    return (
      <div className={cn("min-h-screen flex", className)}>
        <aside className={cn("border-r bg-muted/10", sidebarWidths[sidebarWidth])}>{sidebar}</aside>
        <div className="flex-1 flex flex-col">
          {header && (
            <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              {header}
            </header>
          )}
          <main className="flex-1 p-6">{children}</main>
          {footer && <footer className="border-t bg-muted/10">{footer}</footer>}
        </div>
      </div>
    )
  }

  if (layout === "centered") {
    return (
      <div className={cn("min-h-screen flex flex-col", className)}>
        {header && (
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            {header}
          </header>
        )}
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-2xl">{children}</div>
        </main>
        {footer && <footer className="border-t bg-muted/10">{footer}</footer>}
      </div>
    )
  }

  return (
    <div className={cn("min-h-screen flex flex-col", className)}>
      {header && (
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          {header}
        </header>
      )}
      <main className="flex-1 p-6">{children}</main>
      {footer && <footer className="border-t bg-muted/10">{footer}</footer>}
    </div>
  )
}
