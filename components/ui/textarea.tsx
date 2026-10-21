import * as React from "react"
import { cn } from "cn"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full resize-none rounded-lg bg-field px-2.5 py-2 text-xs outline-1 -outline-offset-1 outline-field-border transition-[color,box-shadow,outline-color] duration-200 outline-solid placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-2 aria-invalid:ring-destructive/20 aria-invalid:outline-destructive dark:aria-invalid:ring-destructive/40 dark:aria-invalid:outline-destructive/50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
