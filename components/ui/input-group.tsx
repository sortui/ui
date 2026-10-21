"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

function InputGroup({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & { size?: "default" | "lg" | "xl" }) {
  return (
    <div
      data-slot="input-group"
      data-size={size}
      role="group"
      className={cn(
        "group/input-group relative flex h-(--ig-h) w-full min-w-0 items-center rounded-(--ig-radius) bg-field outline-1 -outline-offset-1 outline-field-border transition-[color,box-shadow,outline-color] duration-200 outline-solid [--ig-block:--spacing(1.5)] [--ig-body:--spacing(2.5)] [--ig-h:--spacing(8)] [--ig-radius:var(--radius-lg)] has-[[data-slot=input-group-control]:focus-visible]:ring-2 has-[[data-slot=input-group-control]:focus-visible]:ring-ring/30 has-[[data-slot=input-group-control]:focus-visible]:outline-ring in-data-[slot=combobox-content]:has-[[data-slot=input-group-control]:focus-visible]:ring-0 in-data-[slot=combobox-content]:has-[[data-slot=input-group-control]:focus-visible]:outline-field-border has-[[data-slot][aria-invalid=true]]:ring-2 has-[[data-slot][aria-invalid=true]]:ring-destructive/20 has-[[data-slot][aria-invalid=true]]:outline-destructive has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-wrap has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-wrap has-[>textarea]:h-auto data-[size=lg]:[--ig-block:--spacing(2)] data-[size=lg]:[--ig-body:--spacing(3)] data-[size=lg]:[--ig-h:--spacing(9)] data-[size=xl]:[--ig-block:--spacing(2)] data-[size=xl]:[--ig-body:--spacing(3)] data-[size=xl]:[--ig-h:--spacing(10)] dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40 dark:has-[[data-slot][aria-invalid=true]]:outline-destructive/50 has-[>[data-align=inline-end]>svg:only-child]:[&>[data-slot=input-group-control]]:pr-2 has-[>[data-align=inline-start]>svg:only-child]:[&>[data-slot=input-group-control]]:pl-2",
        className
      )}
      {...props}
    />
  )
}

const inputGroupAddonVariants = cva(
  "flex h-auto cursor-text items-center justify-center gap-2 text-xs font-medium text-muted-foreground select-none [--ig-item:--spacing(4)] [--ig-pad:calc((var(--ig-h)-var(--ig-item))/2)] group-data-[disabled=true]/input-group:opacity-50 has-[>[data-size=icon-sm]]:[--ig-item:--spacing(7)] has-[>[data-size=icon-xs]]:[--ig-item:--spacing(6)] has-[>[data-size=sm]]:[--ig-item:--spacing(7)] has-[>[data-size=text]]:[--ig-item:--spacing(5)] has-[>[data-size=xs]]:[--ig-item:--spacing(6)] has-[>button.h-10:not([data-size])]:[--ig-item:--spacing(10)] has-[>button.h-7:not([data-size])]:[--ig-item:--spacing(7)] has-[>button.h-8:not([data-size])]:[--ig-item:--spacing(8)] has-[>button.h-9:not([data-size])]:[--ig-item:--spacing(9)] has-[>button.size-10:not([data-size])]:[--ig-item:--spacing(10)] has-[>button.size-7:not([data-size])]:[--ig-item:--spacing(7)] has-[>button.size-8:not([data-size])]:[--ig-item:--spacing(8)] has-[>button.size-9:not([data-size])]:[--ig-item:--spacing(9)] has-[>button:not([data-size])]:[--ig-item:--spacing(6)] has-[>kbd]:[--ig-item:--spacing(5)] [&:not(:has(>:not([data-slot=input-group-text])))]:[--ig-pad:max(calc((var(--ig-h)-var(--ig-item))/2),--spacing(2.5))] [&>svg:not([class*='size-'])]:size-4",
  {
    variants: {
      align: {
        "inline-start":
          "order-first pl-(--ig-pad) has-[>svg:only-child]:pl-(--ig-body)",
        "inline-end":
          "order-last pr-(--ig-pad) has-[>svg:only-child]:pr-(--ig-body)",
        "block-start":
          "order-first w-full flex-none justify-start px-(--ig-body) pt-(--ig-block) pb-0",
        "block-end":
          "order-last w-full flex-none justify-start px-(--ig-body) pt-0 pb-(--ig-block)",
      },
      divider: {
        true: "border-border",
        false: "",
      },
    },
    compoundVariants: [
      {
        align: "inline-start",
        divider: true,
        class: "min-h-(--ig-h) border-r pr-[calc(var(--ig-pad)-1px)]",
      },
      {
        align: "inline-end",
        divider: true,
        class: "min-h-(--ig-h) border-l pl-[calc(var(--ig-pad)-1px)]",
      },
      {
        align: "block-start",
        divider: true,
        class: "border-b pb-[calc(var(--ig-block)-1px)]",
      },
      {
        align: "block-end",
        divider: true,
        class: "border-t pt-[calc(var(--ig-block)-1px)]",
      },
    ],
    defaultVariants: {
      align: "inline-start",
      divider: false,
    },
  }
)

function InputGroupAddon({
  className,
  align = "inline-start",
  divider = false,
  style,
  ref: refProp,
  onClick,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof inputGroupAddonVariants> & {
    style?: React.CSSProperties & { "--ig-item"?: string | number }
  }) {
  const ref = React.useRef<HTMLDivElement>(null)
  const setRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      ref.current = node
      if (typeof refProp === "function") return refProp(node)
      if (refProp) refProp.current = node
    },
    [refProp]
  )
  const customItem = style?.["--ig-item"]

  React.useEffect(() => {
    const el = ref.current
    if (
      !el ||
      customItem !== undefined ||
      align === "block-start" ||
      align === "block-end"
    )
      return
    const measure = () => {
      let max = 0
      for (const child of el.children) {
        if (child.matches("[data-slot=input-group-text]")) continue
        const h =
          child instanceof HTMLElement
            ? child.offsetHeight
            : child.clientHeight || child.getBoundingClientRect().height
        if (h > max) max = h
      }
      if (max > 0) el.style.setProperty("--ig-item", `${max}px`)
      else el.style.removeProperty("--ig-item")
    }
    if (typeof ResizeObserver === "undefined") {
      measure()
      return
    }
    const resize = new ResizeObserver(measure)
    const observeChildren = () => {
      resize.disconnect()
      for (const child of el.children) resize.observe(child)
      measure()
    }
    const mutation = new MutationObserver(observeChildren)
    mutation.observe(el, { childList: true })
    observeChildren()
    return () => {
      resize.disconnect()
      mutation.disconnect()
    }
  }, [align, customItem])

  return (
    <div
      ref={setRef}
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      data-divider={divider || undefined}
      style={style}
      className={cn(inputGroupAddonVariants({ align, divider }), className)}
      onClick={(e) => {
        onClick?.(e)
        if (
          e.defaultPrevented ||
          (e.target as Element).closest(
            "a, button, input, select, textarea, [role=checkbox], [role=switch]"
          )
        ) {
          return
        }
        const group = e.currentTarget.parentElement
        if (!group) return
        const control =
          group.querySelector<HTMLElement>("[data-slot=input-group-control]") ??
          group.querySelector<HTMLElement>(
            "input:not([type=hidden],[aria-hidden=true]), textarea"
          )
        control?.focus()
      }}
      {...props}
    />
  )
}

const inputGroupButtonVariants = cva("flex items-center", {
  variants: {
    size: {
      xs: "h-6 gap-1 rounded-md px-2 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg:not([class*='size-'])]:size-3.5",
      sm: "h-7 gap-1.5 rounded-md px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
      "icon-xs":
        "size-6 rounded-md p-0 has-data-[icon=inline-end]:pr-0 has-data-[icon=inline-start]:pl-0 has-[>svg]:p-0 [&>svg:not([class*='size-'])]:size-3.5",
      "icon-sm":
        "size-7 rounded-md p-0 has-data-[icon=inline-end]:pr-0 has-data-[icon=inline-start]:pl-0 has-[>svg]:p-0",
      text: "h-auto gap-1 rounded-xs p-0 text-xs hover:bg-transparent hover:opacity-70 disabled:text-foreground has-data-[icon=inline-end]:pr-0 has-data-[icon=inline-start]:pl-0 aria-expanded:bg-transparent [&>svg:not([class*='size-'])]:size-3.5",
    },
  },
  defaultVariants: {
    size: "xs",
  },
})

function InputGroupButton({
  className,
  type = "button",
  variant = "ghost",
  size = "xs",
  ...props
}: Omit<React.ComponentProps<typeof Button>, "size" | "type"> &
  VariantProps<typeof inputGroupButtonVariants> & {
    type?: "button" | "submit" | "reset"
  }) {
  return (
    <Button
      type={type}
      data-size={size}
      variant={variant}
      className={cn(inputGroupButtonVariants({ size }), className)}
      {...props}
    />
  )
}

function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="input-group-text"
      className={cn(
        "flex items-center gap-2 text-xs text-muted-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function InputGroupInput({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <Input
      data-slot="input-group-control"
      className={cn(
        "flex-1 rounded-none bg-transparent px-(--ig-body) shadow-none ring-0 outline-0 group-data-[size=lg]/input-group:h-9 group-data-[size=xl]/input-group:h-10 focus-visible:ring-0 aria-invalid:ring-0 dark:bg-transparent",
        className
      )}
      {...props}
    />
  )
}

function InputGroupTextarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <Textarea
      data-slot="input-group-control"
      className={cn(
        "flex-1 resize-none rounded-none bg-transparent px-(--ig-body) py-2.5 shadow-none ring-0 outline-0 focus-visible:ring-0 aria-invalid:ring-0 dark:bg-transparent",
        className
      )}
      {...props}
    />
  )
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
}
