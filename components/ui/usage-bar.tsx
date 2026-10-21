"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

type UsageBarContextValue = {
  max: number
  active: string | null
  setActive: (name: string | null) => void
}

const UsageBarContext = React.createContext<UsageBarContextValue | null>(null)

function useUsageBar() {
  const context = React.useContext(UsageBarContext)
  if (!context) {
    throw new Error("useUsageBar must be used within a <UsageBar />")
  }
  return context
}

function UsageBar({
  className,
  max,
  active: activeProp,
  defaultActive = null,
  onActiveChange,
  ...props
}: React.ComponentProps<"div"> & {
  /** The whole the segments are measured against. */
  max: number
  /** The name of the highlighted segment (controlled). */
  active?: string | null
  defaultActive?: string | null
  onActiveChange?: (name: string | null) => void
}) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultActive)
  const active = activeProp === undefined ? uncontrolled : activeProp

  const setActive = React.useCallback(
    (name: string | null) => {
      if (activeProp === undefined) setUncontrolled(name)
      onActiveChange?.(name)
    },
    [activeProp, onActiveChange]
  )

  const value = React.useMemo(
    () => ({ max, active, setActive }),
    [max, active, setActive]
  )

  return (
    <UsageBarContext.Provider value={value}>
      <div
        data-slot="usage-bar"
        className={cn("flex flex-col gap-3 text-sm", className)}
        {...props}
      />
    </UsageBarContext.Provider>
  )
}

function UsageBarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="usage-bar-header"
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-6 gap-y-2",
        className
      )}
      {...props}
    />
  )
}

function UsageBarTrack({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="list"
      data-slot="usage-bar-track"
      className={cn("flex h-7 w-full gap-px", className)}
      {...props}
    />
  )
}

const usageBarSegmentVariants = cva("rounded-[2px]", {
  variants: {
    variant: {
      default:
        "bg-foreground/30 data-active:ring-1 data-active:ring-border data-active:ring-inset focus-visible:ring-1 focus-visible:ring-border focus-visible:ring-inset",
      muted:
        "bg-foreground/10 data-active:ring-1 data-active:ring-border data-active:ring-inset focus-visible:ring-1 focus-visible:ring-border focus-visible:ring-inset",
      primary:
        "bg-chart-4 data-active:ring-1 data-active:ring-border data-active:ring-inset focus-visible:ring-1 focus-visible:ring-border focus-visible:ring-inset",
      striped:
        "bg-foreground/5 bg-[repeating-linear-gradient(-45deg,var(--border)_0_1.5px,transparent_1.5px_8.5px)] data-active:ring-1 data-active:ring-border data-active:ring-inset focus-visible:ring-1 focus-visible:ring-border focus-visible:ring-inset",
      dashed:
        "border border-dashed border-foreground/20 data-active:border-solid data-active:border-border focus-visible:border-solid focus-visible:border-border",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

function UsageBarSegment({
  className,
  style,
  value,
  name,
  variant = "default",
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof usageBarSegmentVariants> & {
    /** The segment's size, in the units of the bar's `max`. */
    value: number
    /** Makes the segment hoverable and focusable, and the target of `active`. */
    name?: string
  }) {
  const { max, active, setActive } = useUsageBar()
  const isActive = name !== undefined && active === name

  return (
    <div
      role="listitem"
      data-slot="usage-bar-segment"
      data-variant={variant}
      data-active={isActive || undefined}
      tabIndex={name === undefined ? undefined : 0}
      aria-label={name}
      className={cn(
        usageBarSegmentVariants({ variant }),
        "relative min-w-px transition-[flex-basis] outline-none after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] data-active:after:bg-foreground/10 focus-visible:after:bg-foreground/10",
        className
      )}
      style={{
        flexBasis: `${max > 0 ? (Math.max(value, 0) / max) * 100 : 0}%`,
        ...style,
      }}
      onPointerEnter={(event) => {
        if (name !== undefined) setActive(name)
        onPointerEnter?.(event)
      }}
      onPointerLeave={(event) => {
        if (isActive) setActive(null)
        onPointerLeave?.(event)
      }}
      onFocus={(event) => {
        if (name !== undefined) setActive(name)
        onFocus?.(event)
      }}
      onBlur={(event) => {
        if (isActive) setActive(null)
        onBlur?.(event)
      }}
      {...props}
    />
  )
}

function UsageBarLegend({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="usage-bar-legend"
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function UsageBarLegendItem({
  className,
  children,
  variant = "default",
  swatchClassName,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof usageBarSegmentVariants> & {
    /** Classes for the swatch — the colour of a segment styled by hand. */
    swatchClassName?: string
  }) {
  return (
    <div
      data-slot="usage-bar-legend-item"
      className={cn("flex items-center gap-1.5", className)}
      {...props}
    >
      <span
        aria-hidden
        data-slot="usage-bar-swatch"
        className={cn(
          usageBarSegmentVariants({ variant }),
          "h-3 w-2 shrink-0",
          variant === "striped" &&
            "bg-[repeating-linear-gradient(-45deg,var(--border)_0_1.5px,transparent_1.5px_4.95px)]",
          swatchClassName
        )}
      />
      {children}
    </div>
  )
}

function UsageBarAxis({
  className,
  ticks,
  format = (value) => value.toLocaleString("en-US"),
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  /** Values to mark; defaults to quarters of `max`. */
  ticks?: number[]
  format?: (value: number) => React.ReactNode
}) {
  const { max } = useUsageBar()
  const values =
    max > 0
      ? (ticks ?? [0, 1, 2, 3, 4].map((quarter) => (max * quarter) / 4))
      : []

  return (
    <div
      aria-hidden
      data-slot="usage-bar-axis"
      className={cn(
        "relative -mt-2 h-6 text-2xs text-muted-foreground tabular-nums",
        className
      )}
      {...props}
    >
      {values.map((value) => {
        const position = (value / max) * 100
        const edge = position <= 0 ? "start" : position >= 100 ? "end" : null
        return (
          <span
            key={value}
            className={cn(
              "absolute inset-y-0 flex flex-col gap-1 whitespace-nowrap",
              edge === "start" && "items-start",
              edge === "end" && "-translate-x-full items-end",
              !edge && "-translate-x-1/2 items-center"
            )}
            style={{ left: `${position}%` }}
          >
            <span className="h-1 w-px bg-border" />
            <span className="leading-4">{format(value)}</span>
          </span>
        )
      })}
    </div>
  )
}

export {
  UsageBar,
  UsageBarHeader,
  UsageBarTrack,
  UsageBarSegment,
  UsageBarLegend,
  UsageBarLegendItem,
  UsageBarAxis,
  useUsageBar,
  usageBarSegmentVariants,
}
