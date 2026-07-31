"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
  HTMLButtonElement,
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> & {
    checked?: boolean
    onCheckedChange?: (checked: boolean) => void
    defaultChecked?: boolean
  }
>(({ className, checked: controlledChecked, onCheckedChange, defaultChecked = false, ...props }, ref) => {
  const [uncontrolled, setUncontrolled] = React.useState(defaultChecked)
  const checked = controlledChecked ?? uncontrolled

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      ref={ref}
      className={cn(
        "peer h-4 w-4 shrink-0 rounded-[4px] border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        checked && "bg-primary text-primary-foreground",
        className
      )}
      onClick={() => {
        const next = !checked
        setUncontrolled(next)
        onCheckedChange?.(next)
      }}
      {...props}
    >
      {checked && (
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </button>
  )
})
Checkbox.displayName = "Checkbox"

export { Checkbox }
