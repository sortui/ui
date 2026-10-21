import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const inputVariants = cva(
  "w-full min-w-0 rounded-lg bg-field py-1 text-xs outline-1 -outline-offset-1 outline-field-border transition-[color,box-shadow,outline-color] duration-200 outline-solid file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-xs file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:text-destructive-foreground aria-invalid:ring-2 aria-invalid:ring-destructive/20 aria-invalid:outline-destructive dark:aria-invalid:ring-destructive/40 dark:aria-invalid:outline-destructive/50",
  {
    variants: {
      size: {
        default: "h-8 px-2.5",
        lg: "h-9 px-3",
        xl: "h-10 px-3",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

type InputSize = NonNullable<VariantProps<typeof inputVariants>["size"]>

function Input({
  className,
  type,
  size,
  ...props
}: Omit<React.ComponentProps<"input">, "size"> & {
  size?: number | InputSize
}) {
  const variant = typeof size === "string" ? size : "default"
  return (
    <InputPrimitive
      type={type}
      size={typeof size === "number" ? size : undefined}
      data-slot="input"
      data-size={variant}
      className={cn(inputVariants({ size: variant }), className)}
      {...props}
    />
  )
}

export { Input }
