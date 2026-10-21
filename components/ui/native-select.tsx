import * as React from "react"
import { cn } from "cn"
import { ChevronDownIcon } from "lucide-react"

type NativeSelectProps = Omit<React.ComponentProps<"select">, "size"> & {
  size?: "sm" | "default" | "lg" | "xl"
}

function NativeSelect({
  className,
  size = "default",
  ...props
}: NativeSelectProps) {
  return (
    <div
      className={cn(
        "group/native-select relative w-fit has-[select:disabled]:opacity-50",
        className
      )}
      data-slot="native-select-wrapper"
      data-size={size}
    >
      <select
        data-slot="native-select"
        data-size={size}
        className="h-8 w-full min-w-0 appearance-none rounded-lg bg-field pr-8.5 pl-2.5 text-xs outline-1 -outline-offset-1 outline-field-border transition-[color,box-shadow,outline-color] duration-200 outline-solid select-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-ring disabled:pointer-events-none disabled:cursor-not-allowed aria-invalid:ring-2 aria-invalid:ring-destructive/20 aria-invalid:outline-destructive data-[size=lg]:h-9 data-[size=lg]:pr-9.5 data-[size=lg]:pl-3 data-[size=sm]:h-7 data-[size=sm]:pr-8 data-[size=xl]:h-10 data-[size=xl]:pr-10 data-[size=xl]:pl-3 dark:aria-invalid:ring-destructive/40 dark:aria-invalid:outline-destructive/50"
        {...props}
      />
      <ChevronDownIcon
        className="pointer-events-none absolute top-1/2 right-2 size-4 -translate-y-1/2 text-muted-foreground select-none group-data-[size=lg]/native-select:right-2.5 group-data-[size=sm]/native-select:right-1.5 group-data-[size=xl]/native-select:right-3"
        aria-hidden="true"
        data-slot="native-select-icon"
      />
    </div>
  )
}

function NativeSelectOption({
  className,
  ...props
}: React.ComponentProps<"option">) {
  return (
    <option
      data-slot="native-select-option"
      className={cn("bg-[Canvas] text-[CanvasText]", className)}
      {...props}
    />
  )
}

function NativeSelectOptGroup({
  className,
  ...props
}: React.ComponentProps<"optgroup">) {
  return (
    <optgroup
      data-slot="native-select-optgroup"
      className={cn("bg-[Canvas] text-[CanvasText]", className)}
      {...props}
    />
  )
}

export { NativeSelect, NativeSelectOptGroup, NativeSelectOption }
