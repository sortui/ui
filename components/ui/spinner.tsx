import { cn } from "cn"
import { Loader2Icon } from "lucide-react"

function Spinner({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"svg"> & {
  /** `gradient`: a closed ring whose line fades around it, 1.5px at every size. */
  variant?: "default" | "gradient"
}) {
  if (variant === "gradient") {
    return (
      <svg
        data-slot="spinner"
        data-variant="gradient"
        role="status"
        aria-label="Loading"
        viewBox="0 0 24 24"
        className={cn(
          "size-4 shrink-0 animate-spin rounded-full bg-[conic-gradient(color-mix(in_oklab,currentColor_5%,transparent),color-mix(in_oklab,currentColor_50%,transparent))] mask-[radial-gradient(closest-side,transparent_calc(75%-1.25px),#000_calc(75%-0.5px),#000_calc(75%+0.5px),transparent_calc(75%+1.25px))]",
          className
        )}
        {...props}
      />
    )
  }

  return (
    <Loader2Icon
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  )
}

export { Spinner }
