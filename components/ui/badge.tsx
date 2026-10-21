import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const badgeVariants = cva(
  "group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full py-0.5 text-2xs font-medium whitespace-nowrap outline-1 -outline-offset-1 outline-transparent transition-all outline-solid focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-ring aria-invalid:ring-destructive/20 aria-invalid:outline-destructive dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary: "bg-fill-2 text-foreground",
        destructive:
          "bg-destructive/10 text-destructive-foreground focus-visible:ring-destructive/20 focus-visible:outline-destructive/50 [a]:hover:bg-destructive/15",
        outline:
          "bg-control text-foreground outline-1 -outline-offset-1 outline-border [a]:hover:bg-fill-2",
        ghost: "text-foreground hover:bg-fill-2",
        link: "text-primary underline underline-offset-4",
      },
      size: {
        default:
          "h-5 min-w-5 px-2 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5",
        lg: "h-6 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&>svg]:size-4!",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  size = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant, size }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
      size,
    },
  })
}

export { Badge, badgeVariants }
