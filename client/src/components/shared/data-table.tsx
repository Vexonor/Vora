"use client"

import { cn } from "@/lib/utils"
import { Loader2Icon } from "lucide-react"
import { TableVirtuoso } from "react-virtuoso"
import { PageSizeSelect, TablePagination } from "./table-pagination"

const VIRTUALIZATION_ROW_THRESHOLD = 10
const VIRTUALIZED_TABLE_HEIGHT_PX = 560
const TABLE_CLASS =
  "w-full min-w-3xl text-sm [&_tbody_tr]:border-b [&_tbody_tr]:border-foreground/5 [&_tbody_tr:last-child]:border-0 [&_tbody_tr:hover]:bg-muted/30"

type ColumnAlign = "left" | "center" | "right"

const ALIGN_CLASS: Record<ColumnAlign, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
}

export type DataTableColumn<Row> = {
  header: string
  align?: ColumnAlign
  headerClassName?: string
  cellClassName?: string
  render: (row: Row) => React.ReactNode
}

type Props<Row> = {
  columns: DataTableColumn<Row>[]
  rows: Row[]
  getRowKey: (row: Row) => React.Key
  emptyMessage: string
  currentPage: number
  totalPages: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  isRefreshing?: boolean
}

function VirtualizedTable({ style, children }: { style?: React.CSSProperties; children?: React.ReactNode }) {
  return (
    <table style={style} className={TABLE_CLASS}>
      {children}
    </table>
  )
}

export function DataTable<Row>({
  columns,
  rows,
  getRowKey,
  emptyMessage,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  isRefreshing = false,
}: Props<Row>) {
  const rowNumberOffset = (currentPage - 1) * pageSize

  const headerCells = (
    <>
      <th className="text-left px-6 py-4 font-semibold w-16 bg-white">No.</th>
      {columns.map((column) => (
        <th
          key={column.header}
          className={cn("px-6 py-4 font-semibold bg-white", ALIGN_CLASS[column.align ?? "left"], column.headerClassName)}
        >
          {column.header}
        </th>
      ))}
    </>
  )

  const renderCells = (row: Row, rowIndex: number) => (
    <>
      <td className="px-6 py-4 text-muted-foreground">{rowNumberOffset + rowIndex + 1}.</td>
      {columns.map((column) => (
        <td key={column.header} className={cn("px-6 py-4", ALIGN_CLASS[column.align ?? "left"], column.cellClassName)}>
          {column.render(row)}
        </td>
      ))}
    </>
  )

  return (
    <>
      <div className="bg-white rounded-xl border border-foreground/10 overflow-x-auto">
        {rows.length > VIRTUALIZATION_ROW_THRESHOLD ? (
          <TableVirtuoso
            style={{ height: VIRTUALIZED_TABLE_HEIGHT_PX }}
            data={rows}
            computeItemKey={(_, row) => getRowKey(row)}
            components={{ Table: VirtualizedTable }}
            fixedHeaderContent={() => <tr className="border-b border-foreground/10">{headerCells}</tr>}
            itemContent={(rowIndex, row) => renderCells(row, rowIndex)}
          />
        ) : (
          <table className={TABLE_CLASS}>
            <thead>
              <tr className="border-b border-foreground/10">{headerCells}</tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-6 py-16 text-center text-sm text-muted-foreground">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                rows.map((row, rowIndex) => <tr key={getRowKey(row)}>{renderCells(row, rowIndex)}</tr>)
              )}
            </tbody>
          </table>
        )}
      </div>

      {rows.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <PageSizeSelect pageSize={pageSize} onPageSizeChange={onPageSizeChange} />
            {isRefreshing && <Loader2Icon className="size-4 mt-2 animate-spin text-muted-foreground" />}
          </div>
          <TablePagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
        </div>
      )}
    </>
  )
}
