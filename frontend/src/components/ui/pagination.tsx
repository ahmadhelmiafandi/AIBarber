"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectOption } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

export interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems?: number
  pageSize?: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  pageSizeOptions?: number[]
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
}: PaginationProps) {
  const safeTotalPages = Math.max(1, totalPages)
  const page = Math.min(Math.max(1, currentPage), safeTotalPages)

  const startItem = totalItems ? Math.min((page - 1) * pageSize + 1, totalItems) : 0
  const endItem = totalItems ? Math.min(page * pageSize, totalItems) : 0

  // Calculate page numbers to display with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (safeTotalPages <= maxVisible) {
      for (let i = 1; i <= safeTotalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (page > 3) pages.push("...")
      
      const start = Math.max(2, page - 1)
      const end = Math.min(safeTotalPages - 1, page + 1)
      
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i)
      }
      
      if (page < safeTotalPages - 2) pages.push("...")
      if (!pages.includes(safeTotalPages)) pages.push(safeTotalPages)
    }

    return pages
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-2 text-sm">
      {/* Total item count display */}
      <div className="flex items-center gap-4 text-muted-foreground text-xs sm:text-sm">
        {totalItems !== undefined && (
          <span>
            Menampilkan <strong className="font-semibold text-foreground">{startItem}</strong> -{" "}
            <strong className="font-semibold text-foreground">{endItem}</strong> dari{" "}
            <strong className="font-semibold text-foreground">{totalItems}</strong> data
          </span>
        )}

        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span>Baris per halaman:</span>
            <Select
              value={String(pageSize)}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-8 w-16 text-xs"
            >
              {pageSizeOptions.map((opt) => (
                <SelectOption key={opt} value={String(opt)}>
                  {opt}
                </SelectOption>
              ))}
            </Select>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(1)}
          disabled={page <= 1}
          title="Halaman Pertama"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          title="Sebelumnya"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-1 mx-1">
          {getPageNumbers().map((p, idx) =>
            typeof p === "number" ? (
              <Button
                key={idx}
                variant={p === page ? "default" : "outline"}
                size="sm"
                className={`h-8 min-w-8 px-2 text-xs ${p === page ? "font-bold" : ""}`}
                onClick={() => onPageChange(p)}
              >
                {p}
              </Button>
            ) : (
              <span key={idx} className="px-1 text-muted-foreground">
                {p}
              </span>
            )
          )}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= safeTotalPages}
          title="Selanjutnya"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(safeTotalPages)}
          disabled={page >= safeTotalPages}
          title="Halaman Terakhir"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
