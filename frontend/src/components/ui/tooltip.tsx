import * as React from "react"
import { cn } from "@/lib/utils"

const Tooltip = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("group relative inline-flex", className)} {...props} />
))
Tooltip.displayName = "Tooltip"

const TooltipTrigger = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
))
TooltipTrigger.displayName = "TooltipTrigger"

const TooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { side?: "top" | "bottom" | "left" | "right" }
>(({ className, side = "top", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "pointer-events-none absolute z-50 hidden rounded-[10px] bg-primary px-3 py-1.5 text-xs text-primary-foreground shadow-md group-hover:block",
      side === "top" && "bottom-full left-1/2 mb-2 -translate-x-1/2",
      side === "bottom" && "top-full left-1/2 mt-2 -translate-x-1/2",
      side === "left" && "right-full top-1/2 mr-2 -translate-y-1/2",
      side === "right" && "left-full top-1/2 ml-2 -translate-y-1/2",
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = "TooltipContent"

export { Tooltip, TooltipTrigger, TooltipContent }
