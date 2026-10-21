"use client"

import * as React from "react"
import { Progress as ProgressPrimitive } from "@base-ui/react/progress"
import { cn } from "cn"

function Progress({
  className,
  children,
  value,
  min = 0,
  max = 100,
  variant = "default",
  segments = 10,
  ...props
}: ProgressPrimitive.Root.Props & {
  variant?: "default" | "dashed"
  /** Pieces of a dashed track. */
  segments?: number
}) {
  const filled =
    typeof value === "number" && max > min
      ? Math.min(
          segments,
          Math.max(0, Math.round(((value - min) / (max - min)) * segments))
        )
      : 0

  return (
    <ProgressPrimitive.Root
      value={value}
      min={min}
      max={max}
      data-slot="progress"
      data-variant={variant}
      className={cn("flex flex-wrap gap-3", className)}
      {...props}
    >
      {children}
      {variant === "dashed" ? (
        <ProgressTrack className="flex gap-1 bg-transparent">
          {Array.from({ length: segments }, (_, index) => (
            <span
              key={index}
              data-slot="progress-segment"
              data-filled={index < filled || undefined}
              className="h-full flex-1 rounded-2xl bg-fill-2 transition-colors data-filled:bg-primary"
            />
          ))}
        </ProgressTrack>
      ) : (
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      )}
    </ProgressPrimitive.Root>
  )
}

function ProgressTrack({ className, ...props }: ProgressPrimitive.Track.Props) {
  return (
    <ProgressPrimitive.Track
      className={cn(
        "relative flex h-1 w-full items-center overflow-x-hidden rounded-2xl bg-fill-2",
        className
      )}
      data-slot="progress-track"
      {...props}
    />
  )
}

function ProgressIndicator({
  className,
  ...props
}: ProgressPrimitive.Indicator.Props) {
  return (
    <ProgressPrimitive.Indicator
      data-slot="progress-indicator"
      className={cn("h-full bg-primary transition-all", className)}
      {...props}
    />
  )
}

function ProgressCircle({
  className,
  children,
  value,
  min = 0,
  max = 100,
  thickness = 0.2,
  ...props
}: ProgressPrimitive.Root.Props & {
  /** Ring width as a fraction of the radius. */
  thickness?: number
}) {
  const percent =
    typeof value === "number" && max > min
      ? Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))
      : null
  const strokeWidth = 16 * thickness
  const radius = 16 - strokeWidth / 2
  const circumference = 2 * Math.PI * radius

  return (
    <ProgressPrimitive.Root
      value={value}
      min={min}
      max={max}
      data-slot="progress-circle"
      className={cn(
        "relative inline-flex size-10 shrink-0 items-center justify-center text-fill-2",
        className
      )}
      {...props}
    >
      <svg
        viewBox="0 0 32 32"
        className="absolute inset-0 size-full"
        aria-hidden="true"
      >
        <circle
          data-slot="progress-circle-track"
          cx="16"
          cy="16"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
        />
        {percent !== null && percent > 0 && (
          <circle
            data-slot="progress-circle-indicator"
            cx="16"
            cy="16"
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - percent / 100)}
            transform="rotate(-90 16 16)"
            className="stroke-primary transition-[stroke-dashoffset]"
          />
        )}
      </svg>
      {children != null && (
        <span
          data-slot="progress-circle-label"
          className="relative text-foreground"
        >
          {children}
        </span>
      )}
    </ProgressPrimitive.Root>
  )
}

function ProgressLabel({ className, ...props }: ProgressPrimitive.Label.Props) {
  return (
    <ProgressPrimitive.Label
      className={cn("text-sm font-medium", className)}
      data-slot="progress-label"
      {...props}
    />
  )
}

function ProgressFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="progress-footer"
      className={cn(
        "order-last flex w-full items-center justify-between gap-3 text-sm text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function ProgressValue({ className, ...props }: ProgressPrimitive.Value.Props) {
  return (
    <ProgressPrimitive.Value
      className={cn(
        "ml-auto text-sm text-muted-foreground tabular-nums",
        className
      )}
      data-slot="progress-value"
      {...props}
    />
  )
}

export {
  Progress,
  ProgressCircle,
  ProgressFooter,
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
  ProgressValue,
}
