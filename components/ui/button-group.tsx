import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

import { Separator } from "@/components/ui/separator"

const buttonGroupVariants = cva(
  "flex w-fit items-stretch *:focus-visible:relative *:focus-visible:z-10 has-[>[data-slot=button-group]]:gap-2 [&>[data-slot=input-group]:is([data-slot]~*,:has(~[data-slot]))]:bg-control [&>[data-slot=input-group]:is([data-slot]~*,:has(~[data-slot]))]:shadow-(--shadow-secondary-control) [&>[data-slot=input-group]:is([data-slot]~*,:has(~[data-slot])):not(:has([data-slot=input-group-control]:focus-visible),:has([data-slot][aria-invalid=true]))]:outline-control-border [&>[data-slot=select-trigger]:is([data-slot]~*,:has(~[data-slot]))]:bg-control [&>[data-slot=select-trigger]:is([data-slot]~*,:has(~[data-slot]))]:shadow-(--shadow-secondary-control) [&>[data-slot=select-trigger]:is([data-slot]~*,:has(~[data-slot])):not(:focus-visible,[aria-invalid=true])]:outline-control-border [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1 [&>input:is([data-slot]~*,:has(~[data-slot]))]:bg-control [&>input:is([data-slot]~*,:has(~[data-slot]))]:shadow-(--shadow-secondary-control) [&>input:is([data-slot]~*,:has(~[data-slot])):not(:focus-visible,[aria-invalid=true])]:outline-control-border",
  {
    variants: {
      orientation: {
        horizontal:
          "[&>[data-slot]:has(~[data-slot])]:rounded-r-none [&>[data-slot]:not([data-slot]~*):has(~[data-slot])]:rounded-l-lg! [&>[data-slot]~[data-slot]]:rounded-l-none [&>[data-slot]~[data-slot]:not(:has(~[data-slot]))]:rounded-r-lg! [&>[data-slot]~[data-slot]:not([data-slot=button-group],[data-slot=button-group-separator])]:-ml-px",
        vertical:
          "flex-col [&>[data-slot]:has(~[data-slot])]:rounded-b-none [&>[data-slot]:not([data-slot]~*):has(~[data-slot])]:rounded-t-lg! [&>[data-slot]~[data-slot]]:rounded-t-none [&>[data-slot]~[data-slot]:not(:has(~[data-slot]))]:rounded-b-lg! [&>[data-slot]~[data-slot]:not([data-slot=button-group],[data-slot=button-group-separator])]:-mt-px",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  }
)

function ButtonGroup({
  className,
  orientation,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof buttonGroupVariants>) {
  return (
    <div
      role="group"
      data-slot="button-group"
      data-orientation={orientation}
      className={cn(buttonGroupVariants({ orientation }), className)}
      {...props}
    />
  )
}

function ButtonGroupText({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div">) {
  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn(
          "flex items-center gap-1.5 bg-field px-3 text-xs font-medium [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
          className
        ),
      },
      props
    ),
    render,
    state: {
      slot: "button-group-text",
    },
  })
}

function ButtonGroupSeparator({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="button-group-separator"
      orientation={orientation}
      className={cn(
        "relative self-stretch bg-border data-horizontal:my-0 data-horizontal:w-auto data-vertical:mx-0 data-vertical:h-auto [.bg-primary+&]:bg-background/20",
        className
      )}
      {...props}
    />
  )
}

export {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
  buttonGroupVariants,
}
