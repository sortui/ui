import { cn } from "cn"

function Kbd({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"kbd"> & { size?: "default" | "sm" }) {
  return (
    <kbd
      data-slot="kbd"
      data-size={size}
      className={cn(
        "pointer-events-none inline-flex h-5 w-fit min-w-5 items-center justify-center gap-1 rounded-xs bg-fill-2 px-1 font-sans text-2xs font-medium text-muted-foreground select-none in-data-[slot=badge]:h-4 in-data-[slot=badge]:min-w-4 in-data-[slot=badge]:px-0.5 in-data-[slot=tooltip-content]:h-4 in-data-[slot=tooltip-content]:min-w-4 in-data-[slot=tooltip-content]:bg-background/20 in-data-[slot=tooltip-content]:px-0.5 in-data-[slot=tooltip-content]:text-background data-[size=sm]:h-4 data-[size=sm]:min-w-4 data-[size=sm]:px-0.5 dark:in-data-[slot=tooltip-content]:bg-background/10 [&_svg:not([class*='size-'])]:size-3",
        className
      )}
      {...props}
    />
  )
}

function KbdGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <kbd
      data-slot="kbd-group"
      className={cn("inline-flex items-center gap-0.5", className)}
      {...props}
    />
  )
}

export { Kbd, KbdGroup }
