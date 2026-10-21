"use client"

import * as React from "react"
import { Slider as SliderPrimitive } from "@base-ui/react/slider"

import { cn } from "@/lib/utils"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import {
  UsageBar,
  UsageBarAxis,
  UsageBarLegendItem,
  UsageBarSegment,
  UsageBarTrack,
} from "@/components/ui/usage-bar"

type Stage = "deep" | "light" | "rem" | "awake"

const stages: { stage: Stage; label: string; className: string }[] = [
  { stage: "deep", label: "Deep", className: "bg-chart-2" },
  { stage: "rem", label: "REM", className: "bg-chart-4" },
  { stage: "light", label: "Light", className: "bg-chart-8" },
  { stage: "awake", label: "Awake", className: "bg-chart-7" },
]

const night: [Stage, number][] = [
  ["light", 18],
  ["deep", 42],
  ["light", 28],
  ["rem", 14],
  ["awake", 4],
  ["light", 36],
  ["deep", 48],
  ["light", 22],
  ["rem", 26],
  ["light", 34],
  ["deep", 28],
  ["awake", 6],
  ["light", 30],
  ["rem", 32],
  ["light", 24],
  ["deep", 16],
  ["rem", 38],
  ["awake", 5],
  ["light", 25],
]

const hours = ["11 PM", "1 AM", "3 AM", "5 AM", "7 AM"]

function duration(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

/** Last night's sleep: the stages on a usage bar, their totals, a smart alarm and its wake window. */
export function SleepWidget({ className }: { className?: string }) {
  const [alarm, setAlarm] = React.useState(false)
  const [wakeWindow, setWakeWindow] = React.useState(30)

  const total = night.reduce((sum, [, minutes]) => sum + minutes, 0)
  const byStage = (stage: Stage) =>
    night
      .filter(([s]) => s === stage)
      .reduce((sum, [, minutes]) => sum + minutes, 0)
  const asleep = total - byStage("awake")
  const stageClass = (stage: Stage) =>
    stages.find((item) => item.stage === stage)?.className

  return (
    <Card className={cn("h-106 w-full max-w-96 gap-6", className)}>
      <CardHeader>
        <CardTitle>Sleep</CardTitle>
        <CardDescription>Last night, 11:12 PM to 7:08 AM</CardDescription>
        <CardAction className="flex items-baseline gap-0.5 whitespace-nowrap">
          <span className="text-2xl leading-7 font-medium">
            {Math.floor(asleep / 60)}
          </span>
          <span className="text-sm text-muted-foreground">h</span>
          <span className="text-2xl leading-7 font-medium">{asleep % 60}</span>
          <span className="text-sm text-muted-foreground">m</span>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <UsageBar max={total} className="gap-3">
          <UsageBarTrack>
            {night.map(([stage, minutes], index) => (
              <UsageBarSegment
                key={index}
                value={minutes}
                className={cn("rounded-[1px]", stageClass(stage))}
              />
            ))}
          </UsageBarTrack>
          <UsageBarAxis
            ticks={hours.map((_, index) => (total * index) / 4)}
            format={(value) => hours[Math.round((value / total) * 4)]}
          />
        </UsageBar>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          {stages.map((item) => (
            <div
              key={item.stage}
              className="flex items-center justify-between gap-2"
            >
              <UsageBarLegendItem
                swatchClassName={item.className}
                className="text-muted-foreground"
              >
                {item.label}
              </UsageBarLegendItem>
              <span className="font-medium tabular-nums">
                {duration(byStage(item.stage))}
              </span>
            </div>
          ))}
        </div>
        <Separator />
        <div className="flex h-40.5 flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="font-medium">Smart alarm</span>
              <span className="text-xs text-muted-foreground">
                Wakes you in a light stage before 7:30 AM
              </span>
            </div>
            <Switch
              checked={alarm}
              onCheckedChange={setAlarm}
              aria-label="Smart alarm"
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Wake window</span>
              <span className="font-medium tabular-nums">{wakeWindow} min</span>
            </div>
            <BarSlider
              label="Wake window"
              value={wakeWindow}
              onValueChange={setWakeWindow}
              min={0}
              max={60}
              step={5}
              format={(value) => `${value} min`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function BarSlider({
  label,
  value,
  onValueChange,
  min,
  max,
  step,
  format,
}: {
  label: string
  value: number
  onValueChange: (value: number) => void
  min: number
  max: number
  step: number
  format: (value: number) => string
}) {
  const [pressed, setPressed] = React.useState(false)
  const [pointerFocus, setPointerFocus] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const ratio = (value - min) / (max - min)

  const valueAt = (clientX: number, row: HTMLElement) => {
    const rect = row.getBoundingClientRect()
    const position = Math.min(
      1,
      Math.max(0, (clientX - rect.left) / rect.width)
    )
    return Math.round((position * (max - min)) / step) * step + min
  }

  return (
    <div
      onPointerDown={(event) => {
        if (event.pointerType === "mouse" && event.button !== 0) return
        event.preventDefault()
        event.currentTarget.setPointerCapture(event.pointerId)
        inputRef.current?.focus({ preventScroll: true })
        setPointerFocus(true)
        setPressed(true)
        onValueChange(valueAt(event.clientX, event.currentTarget))
      }}
      onPointerMove={(event) => {
        if (pressed) onValueChange(valueAt(event.clientX, event.currentTarget))
      }}
      onPointerUp={() => setPressed(false)}
      onPointerCancel={() => setPressed(false)}
      onKeyDownCapture={() => setPointerFocus(false)}
      onBlur={() => setPointerFocus(false)}
      style={{ "--fill": ratio } as React.CSSProperties}
      className={cn(
        "group/bar-slider relative h-8 w-full cursor-ew-resize touch-none overflow-hidden rounded-md bg-fill-2 outline-ring transition-shadow select-none",
        !pointerFocus &&
          "has-focus-visible:ring-3 has-focus-visible:ring-ring/30 has-focus-visible:outline-1 has-focus-visible:-outline-offset-1 has-focus-visible:outline-solid"
      )}
    >
      <SliderPrimitive.Root
        value={[value]}
        onValueChange={(next) =>
          onValueChange(Array.isArray(next) ? next[0] : next)
        }
        min={min}
        max={max}
        step={step}
        className="pointer-events-none absolute inset-0 opacity-0"
      >
        <SliderPrimitive.Control className="size-full">
          <SliderPrimitive.Track className="size-full">
            <SliderPrimitive.Thumb
              inputRef={inputRef}
              aria-label={label}
              getAriaValueText={() => format(value)}
            />
          </SliderPrimitive.Track>
        </SliderPrimitive.Control>
      </SliderPrimitive.Root>
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 w-[calc(var(--fill)*100%)] bg-fill-3",
          !pressed && "transition-[width] duration-150 ease-out"
        )}
      />
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-2 left-[max(--spacing(2),calc(var(--fill)*100%-var(--spacing)*2))] w-0.5 rounded-full bg-foreground/30 transition-[top,bottom,background-color] duration-150 group-hover/bar-slider:inset-y-1.75 group-hover/bar-slider:bg-foreground/50",
          !pointerFocus &&
            "group-has-focus-visible/bar-slider:inset-y-1.75 group-has-focus-visible/bar-slider:bg-foreground",
          !pressed && "transition-[top,bottom,background-color,left] ease-out"
        )}
      />
    </div>
  )
}
