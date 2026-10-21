import * as React from "react"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

function BubbleGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="bubble-group"
      className={cn("flex min-w-0 flex-col gap-2", className)}
      {...props}
    />
  )
}

const bubbleVariants = cva(
  "group/bubble relative flex w-fit max-w-[min(80%,--spacing(80))] min-w-0 flex-col gap-1 group-data-[align=end]/message:self-end data-[align=end]:self-end data-[variant=ghost]:max-w-full",
  {
    variants: {
      variant: {
        default:
          "*:data-[slot=bubble-content]:bg-card *:data-[slot=bubble-content]:bg-linear-to-b *:data-[slot=bubble-content]:from-white/5 *:data-[slot=bubble-content]:to-transparent *:data-[slot=bubble-content]:text-card-foreground *:data-[slot=bubble-content]:shadow-(--shadow-secondary-control) *:data-[slot=bubble-content]:inset-ring-1 *:data-[slot=bubble-content]:inset-ring-border [&>[data-slot=bubble-content]:is(button,a):hover]:bg-control-hover",
        secondary:
          "*:data-[slot=bubble-content]:bg-fill-1 *:data-[slot=bubble-content]:text-secondary-foreground [&>[data-slot=bubble-content]:is(button,a):hover]:bg-fill-2",
        muted:
          "*:data-[slot=bubble-content]:bg-fill-2 [&>[data-slot=bubble-content]:is(button,a):hover]:bg-fill-3",
        tinted:
          "*:data-[slot=bubble-content]:bg-primary/20 *:data-[slot=bubble-content]:text-foreground [&>[data-slot=bubble-content]:is(button,a):hover]:bg-primary/25",
        outline:
          "*:data-[slot=bubble-content]:border *:data-[slot=bubble-content]:border-border *:data-[slot=bubble-content]:bg-background *:data-[slot=bubble-content]:px-2.75 *:data-[slot=bubble-content]:py-1.75 [&>[data-slot=bubble-content]:is(button,a):hover]:bg-fill-2 [&>[data-slot=bubble-content]:is(button,a):hover]:text-foreground",
        ghost:
          "border-none *:data-[slot=bubble-content]:rounded-none *:data-[slot=bubble-content]:border-0 *:data-[slot=bubble-content]:bg-transparent *:data-[slot=bubble-content]:p-0 [&>[data-slot=bubble-content]:is(button,a):hover]:bg-fill-2 [&>[data-slot=bubble-content]:is(button,a):hover]:text-foreground",
        destructive:
          "*:data-[slot=bubble-content]:bg-card *:data-[slot=bubble-content]:bg-linear-to-b *:data-[slot=bubble-content]:from-white/5 *:data-[slot=bubble-content]:to-transparent *:data-[slot=bubble-content]:text-destructive-foreground *:data-[slot=bubble-content]:shadow-(--shadow-secondary-control) *:data-[slot=bubble-content]:inset-ring-1 *:data-[slot=bubble-content]:inset-ring-destructive/30 [&>[data-slot=bubble-content]:is(button,a):hover]:bg-control-hover",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Bubble({
  variant = "default",
  align = "start",
  className,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof bubbleVariants> & {
    align?: "start" | "end"
  }) {
  return (
    <div
      data-slot="bubble"
      data-variant={variant}
      data-align={align}
      className={cn(bubbleVariants({ variant }), className)}
      {...props}
    />
  )
}

function BubbleContent({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div">) {
  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn(
          "w-fit max-w-full min-w-0 overflow-hidden rounded-xl px-3 py-2 text-xs wrap-break-word group-data-[align=end]/bubble:self-end [button]:text-left [button,a]:transition-colors [button,a]:outline-none [button,a]:focus-visible:ring-3 [button,a]:focus-visible:ring-ring/30",
          className
        ),
      },
      props
    ),
    render,
    state: {
      slot: "bubble-content",
    },
  })
}

const bubbleReactionsVariants = cva(
  "absolute z-10 flex w-fit shrink-0 items-center justify-center gap-1 rounded-2xl bg-muted bg-linear-to-b from-white/10 to-transparent px-[6.5px] py-[0.5px] text-sm shadow-[0_0_0_2px_var(--background),0_0_1px_oklch(0_0_0/3%),0_1px_2px_oklch(0_0_0/5%)] outline-[0.5px] -outline-offset-[0.5px] outline-border outline-solid has-[button]:p-0",
  {
    variants: {
      side: {
        top: "bottom-full translate-y-1.5",
        bottom: "top-full -translate-y-1.5",
      },
      align: {
        start: "left-2.5",
        end: "right-2.5",
      },
    },
    defaultVariants: {
      side: "bottom",
      align: "end",
    },
  }
)

function BubbleReactions({
  side = "bottom",
  align = "end",
  className,
  ...props
}: React.ComponentProps<"div"> & {
  align?: "start" | "end"
  side?: "top" | "bottom"
}) {
  return (
    <div
      data-slot="bubble-reactions"
      data-align={align}
      data-side={side}
      className={cn(bubbleReactionsVariants({ side, align }), className)}
      {...props}
    />
  )
}

export { BubbleGroup, Bubble, BubbleContent, BubbleReactions }
