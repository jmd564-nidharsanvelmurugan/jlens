import type React from "react"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface TableColumn {
  key: string
  header: string
  width?: string
  align?: "left" | "center" | "right"
  render?: (value: any, row: any) => React.ReactNode
}

interface AtomicTableProps {
  columns: TableColumn[]
  data: any[]
  caption?: string
  striped?: boolean
  hoverable?: boolean
  bordered?: boolean
  compact?: boolean
  loading?: boolean
  emptyMessage?: string
  className?: string
}

export function AtomicTable({
  columns,
  data,
  caption,
  striped = false,
  hoverable = true,
  bordered = false,
  compact = false,
  loading = false,
  emptyMessage = "No data available",
  className,
}: AtomicTableProps) {
  const alignClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <Table
      className={cn(
        striped && "[&_tr:nth-child(even)]:bg-muted/50",
        hoverable && "[&_tr]:hover:bg-muted/50",
        bordered && "border",
        compact && "[&_td]:py-2 [&_th]:py-2",
        className,
      )}
    >
      {caption && <TableCaption>{caption}</TableCaption>}

      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead
              key={column.key}
              className={cn(alignClasses[column.align || "left"])}
              style={{ width: column.width }}
            >
              {column.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>

      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">
              {emptyMessage}
            </TableCell>
          </TableRow>
        ) : (
          data.map((row, index) => (
            <TableRow key={index}>
              {columns.map((column) => (
                <TableCell key={column.key} className={cn(alignClasses[column.align || "left"])}>
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
