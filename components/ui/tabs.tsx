"use client"

import * as React from "react"
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      orientation={orientation}
      className={cn(
        "group/tabs flex gap-2 data-horizontal:flex-col",
        className
      )}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  "group/tabs-list relative isolate inline-flex w-fit items-center justify-center rounded-lg p-0.5 text-muted-foreground data-[variant=line]:rounded-none data-horizontal:h-8 data-horizontal:has-data-[layout=stacked]:h-auto data-horizontal:data-[size=lg]:h-9 data-vertical:h-fit data-vertical:flex-col",
  {
    variants: {
      variant: {
        default: "bg-fill-2",
        secondary: "bg-transparent",
        primary: "bg-transparent",
        line: "bg-transparent",
      },
      size: {
        default: "",
        lg: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const tabsIndicatorVariants = cva("absolute -z-10", {
  variants: {
    variant: {
      default:
        "top-(--active-tab-top) left-(--active-tab-left) h-(--active-tab-height) w-(--active-tab-width) rounded-md bg-raised bg-linear-to-b from-white/10 to-transparent shadow-xs inset-shadow-[0_0.5px_0_oklch(1_0_0/25%)] transition-[top,left,width,height] duration-200 ease-out motion-reduce:transition-none",
      secondary:
        "top-(--active-tab-top) left-(--active-tab-left) h-(--active-tab-height) w-(--active-tab-width) rounded-md bg-fill-2 transition-[top,left,width,height] duration-200 ease-out motion-reduce:transition-none",
      primary:
        "top-(--active-tab-top) left-(--active-tab-left) h-(--active-tab-height) w-(--active-tab-width) rounded-md bg-primary transition-[top,left,width,height] duration-200 ease-out motion-reduce:transition-none",
      line: "bg-foreground [--tab-line-x:--spacing(2)] [--tab-line-y:--spacing(1)] group-has-data-[layout=stacked]/tabs-list:[--tab-line-x:--spacing(2.5)] group-has-data-[layout=stacked]/tabs-list:[--tab-line-y:--spacing(2)] group-data-[size=lg]/tabs-list:[--tab-line-x:--spacing(2.5)] group-data-[size=lg]/tabs-list:[--tab-line-y:--spacing(1.5)] data-horizontal:bottom-0 data-horizontal:left-[calc(var(--active-tab-left)+var(--tab-line-x))] data-horizontal:h-0.5 data-horizontal:w-[calc(var(--active-tab-width)-2*var(--tab-line-x))] data-vertical:top-[calc(var(--active-tab-top)+var(--tab-line-y))] data-vertical:right-0 data-vertical:h-[calc(var(--active-tab-height)-2*var(--tab-line-y))] data-vertical:w-0.5",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

function TabsList({
  className,
  variant = "default",
  size = "default",
  children,
  ...props
}: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      data-size={size}
      className={cn(tabsListVariants({ variant, size }), className)}
      {...props}
    >
      {children}
      <TabsPrimitive.Indicator
        data-slot="tabs-indicator"
        renderBeforeHydration
        className={tabsIndicatorVariants({ variant })}
      />
    </TabsPrimitive.List>
  )
}

const tabsTriggerVariants = cva(
  "group/tabs-trigger relative inline-flex rounded-md border border-transparent! text-xs font-medium whitespace-nowrap text-muted-foreground transition-all hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-1 focus-visible:outline-ring aria-disabled:pointer-events-none aria-disabled:opacity-50 data-vertical:w-full [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      layout: {
        inline:
          "h-7 items-center justify-center gap-1 px-1.75 group-data-[size=lg]/tabs-list:h-8 group-data-[size=lg]/tabs-list:gap-1.5 group-data-[size=lg]/tabs-list:px-2.25 data-vertical:justify-start",
        stacked:
          "flex-col items-start justify-start gap-2 px-2.25 py-1.75 text-left",
      },
      align: {
        start: "",
        center: "",
      },
    },
    compoundVariants: [
      {
        layout: "stacked",
        align: "center",
        class: "items-center text-center",
      },
    ],
    defaultVariants: {
      layout: "inline",
      align: "start",
    },
  }
)

function TabsTrigger({
  className,
  layout = "inline",
  align = "start",
  ...props
}: TabsPrimitive.Tab.Props & VariantProps<typeof tabsTriggerVariants>) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      data-layout={layout}
      className={cn(
        tabsTriggerVariants({ layout, align }),
        "group-data-[variant=line]/tabs-list:rounded-none data-active:text-foreground group-data-[variant=primary]/tabs-list:data-active:text-primary-foreground",
        className
      )}
      {...props}
    />
  )
}

/** A secondary line in a trigger: an eyebrow above the label or a description under it. */
function TabsTriggerDescription({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="tabs-trigger-description"
      className={cn(
        "text-2xs font-normal text-muted-foreground group-data-[variant=primary]/tabs-list:group-data-active/tabs-trigger:text-primary-foreground/70",
        className
      )}
      {...props}
    />
  )
}

/** A count after the label. */
function TabsTriggerCount({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="tabs-trigger-count"
      className={cn(
        "font-normal text-muted-foreground tabular-nums group-data-[variant=primary]/tabs-list:group-data-active/tabs-trigger:text-primary-foreground/70",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn("flex-1 text-sm outline-none", className)}
      {...props}
    />
  )
}

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsTriggerDescription,
  TabsTriggerCount,
  TabsContent,
  tabsListVariants,
}
