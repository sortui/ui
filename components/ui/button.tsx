import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center text-xs font-medium whitespace-nowrap outline-1 -outline-offset-1 outline-transparent transition-all outline-solid select-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-ring active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:ring-2 aria-invalid:ring-destructive/20 aria-invalid:outline-destructive dark:aria-invalid:ring-destructive/40 dark:aria-invalid:outline-destructive/50 [&_[data-badge]]:inline-flex [&_[data-badge]]:h-5 [&_[data-badge]]:min-w-5 [&_[data-badge]]:shrink-0 [&_[data-badge]]:items-center [&_[data-badge]]:justify-center [&_[data-badge]]:rounded-xs [&_[data-badge]]:px-1 [&_[data-badge]]:text-2xs [&_[data-badge]]:font-medium [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary bg-linear-to-b from-white/20 to-transparent to-[67.7%] text-primary-foreground shadow-(--shadow-primary-control) outline-primary-border hover:from-white/35 disabled:bg-muted-foreground disabled:from-white/35 disabled:shadow-(--shadow-primary-control-disabled) disabled:outline-primary-border-disabled [&_[data-badge]]:bg-primary-foreground/20",
        outline:
          "bg-control bg-linear-to-b from-white/10 to-transparent to-[67.7%] text-foreground shadow-(--shadow-secondary-control) outline-control-border hover:bg-control-hover hover:from-white/8 disabled:bg-control-hover disabled:from-white/8 aria-expanded:bg-control-hover aria-expanded:from-white/8 [&_[data-badge]]:bg-fill-2",
        secondary:
          "bg-fill-2 text-foreground hover:bg-fill-3 disabled:bg-fill-2 aria-expanded:bg-fill-3 [&_[data-badge]]:bg-fill-2",
        ghost:
          "text-foreground hover:bg-fill-2 aria-expanded:bg-fill-2 [&_[data-badge]]:bg-fill-2",
        destructive:
          "text-destructive-foreground outline-destructive/50 hover:bg-fill-1 focus-visible:ring-destructive/20 focus-visible:outline-destructive disabled:bg-fill-1 aria-expanded:bg-fill-1 [&_[data-badge]]:bg-destructive/10",
        link: "text-primary underline-offset-4 hover:underline [&_[data-badge]]:bg-primary/10",
      },
      size: {
        default:
          "h-8 gap-1.5 rounded-lg px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-md px-2 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_[data-badge]]:h-4 [&_[data-badge]]:min-w-4 [&_[data-badge]]:px-0.5 [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-7 gap-1.5 rounded-md px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        lg: "h-9 gap-1.5 rounded-lg px-3 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        xl: "h-10 gap-2 rounded-lg px-3.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        icon: "size-8 rounded-lg",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-7 rounded-md",
        "icon-lg": "size-9 rounded-lg",
        "icon-xl": "size-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
