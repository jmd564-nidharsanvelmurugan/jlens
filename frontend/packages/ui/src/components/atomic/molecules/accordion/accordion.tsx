import type React from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
 
interface AccordionItemData {
  value: string
  title: string
  content: React.ReactNode
  disabled?: boolean
}
 
interface AtomicAccordionSingleProps {
  type?: "single"
  collapsible?: boolean
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  className?: string
  items: AccordionItemData[]
}
 
interface AtomicAccordionMultipleProps {
  type: "multiple"
  collapsible?: boolean
  defaultValue?: string[]
  value?: string[]
  onValueChange?: (value: string[]) => void
  className?: string
  items: AccordionItemData[]
}
 
type AtomicAccordionProps = AtomicAccordionSingleProps | AtomicAccordionMultipleProps
 
export function AtomicAccordion({
  items,
  type = "single",
  collapsible = true,
  defaultValue,
  value,
  onValueChange,
  className,
}: AtomicAccordionProps) {
  return (
<Accordion
      type={type}
      collapsible={collapsible}
      defaultValue={defaultValue as any} // safe coercion
      value={value as any}               // safe coercion
      onValueChange={onValueChange as any} // safe coercion
      className={className}
>
      {items.map((item) => (
<AccordionItem key={item.value} value={item.value} disabled={item.disabled}>
<AccordionTrigger>{item.title}</AccordionTrigger>
<AccordionContent>{item.content}</AccordionContent>
</AccordionItem>
      ))}
</Accordion>
  )
}