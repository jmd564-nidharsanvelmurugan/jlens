    import type React from "react"
    import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    } from "@/components/ui/dropdown-menu"


    export interface DropdownItemData {
    label: React.ReactNode | string; 
    value: string
    disabled?: boolean
    onSelect?: () => void
    }

    interface AtomicDropdownProps {
    trigger: React.ReactNode
    items: DropdownItemData[]
    className?: string
    }

    export function AtomicDropdown({
    trigger,
    items,
    className,
    }: AtomicDropdownProps) {
    return (
        <DropdownMenu>
        <DropdownMenuTrigger asChild>
            {trigger}
        </DropdownMenuTrigger>
        <DropdownMenuContent className={className}>
            {items.map((item) => (
            <DropdownMenuItem
                className="p-0"
                key={item.value}
                disabled={item.disabled}
                onSelect={(e) => {
                e.preventDefault()
                item.onSelect?.()
                }}
            >
                {item.label}
            </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
        </DropdownMenu>
    )
    }