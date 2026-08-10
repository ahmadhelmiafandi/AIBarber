"use client"

import React, { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"

export interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  debounceMs?: number
  className?: string
}

export function SearchInput({
  value: initialValue,
  onChange,
  placeholder = "Cari data...",
  debounceMs = 350,
  className = "",
}: SearchInputProps) {
  const [searchTerm, setSearchTerm] = useState(initialValue)

  useEffect(() => {
    setSearchTerm(initialValue)
  }, [initialValue])

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== initialValue) {
        onChange(searchTerm)
      }
    }, debounceMs)

    return () => {
      clearTimeout(handler)
    }
  }, [searchTerm, onChange, initialValue, debounceMs])

  const handleClear = () => {
    setSearchTerm("")
    onChange("")
  }

  return (
    <div className={`relative flex items-center w-full max-w-sm ${className}`}>
      <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-9 h-9 text-sm"
      />
      {searchTerm && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2.5 p-1 rounded-full text-muted-foreground hover:text-foreground focus:outline-none"
          title="Hapus pencarian"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
