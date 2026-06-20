" "

import type React from "react"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

interface AccordionItem {
  value: string
  title: React.ReactNode
  content: React.ReactNode
}

interface AccordionProps {
  items: AccordionItem[]
  className?: string
}

export function SimpleAccordion({ items, className = "" }: AccordionProps) {
  const [openItems, setOpenItems] = useState<string[]>([])

  const toggleItem = (value: string) => {
    setOpenItems((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]))
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((item) => (
        <div key={item.value} className="border border-slate-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleItem(item.value)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors duration-200"
          >
            <div className="flex-1">{item.title}</div>
            <ChevronDown
              className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${
                openItems.includes(item.value) ? "rotate-180" : ""
              }`}
            />
          </button>
          {openItems.includes(item.value) && <div className="p-4 pt-0 border-t border-slate-100">{item.content}</div>}
        </div>
      ))}
    </div>
  )
}
