"use client"

import * as React from "react"
import { useDirection } from "@base-ui/react/direction-provider"
import { Slider as SliderPrimitive } from "@base-ui/react/slider"

import { cn } from "cn"

import { drawPixelField } from "@/registry/blocks/effort-slider-01/lib/pixel-field"

const defaultLevels = ["Low", "Medium", "High", "Extra", "Max", "Ultra"]

const clamp = (value: number, last: number) =>
  Math.min(last, Math.max(0, value))

const revealAt = (elapsed: number) => {
  const t = Math.min(1, elapsed / 1000)
  return t * t * (3 - 2 * t)
}

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches

const stepAt = (index: number, last: number) =>
  `calc(var(--thumb) / 2 + (100% - var(--thumb)) * ${index / last})`

const keyTargets: Record<
  string,
  (level: number, last: number, rtl: boolean) => number
> = {
  ArrowLeft: (level, _, rtl) => (rtl ? level + 1 : level - 1),
  ArrowDown: (level) => level - 1,
  PageDown: (level) => level - 1,
  ArrowRight: (level, _, rtl) => (rtl ? level - 1 : level + 1),
  ArrowUp: (level) => level + 1,
  PageUp: (level) => level + 1,
  Home: () => 0,
  End: (_, last) => last,
}

const DETENT_RADIUS = 0.45
const DETENT_PULL = 0.9

function detent(value: number) {
  const level = Math.round(value)
  const offset = value - level
  const closeness = 1 - Math.abs(offset) / DETENT_RADIUS
  if (closeness <= 0) return value
  return level + offset * (1 - DETENT_PULL * closeness * closeness)
}

const SPRING_FREQUENCY = 30
const SPRING_DAMPING_RATIO = 0.65
const MAX_SPEED = 8
const MAX_OFFSET = 0.49
const SPEED_SMOOTHING = 0.5

function springOffset(offset: number, speed: number, t: number) {
  const decay = SPRING_DAMPING_RATIO * SPRING_FREQUENCY
  const frequency = SPRING_FREQUENCY * Math.sqrt(1 - SPRING_DAMPING_RATIO ** 2)
  return (
    Math.exp(-decay * t) *
    (offset * Math.cos(frequency * t) +
      ((speed + decay * offset) / frequency) * Math.sin(frequency * t))
  )
}

function useSnappingValue(initial: number, last: number) {
  const [value, setValue] = React.useState(initial)
  const current = React.useRef(initial)
  const motion = React.useRef({ speed: 0, time: 0 })
  const frame = React.useRef(0)

  React.useEffect(() => () => cancelAnimationFrame(frame.current), [])

  const set = React.useCallback((next: number) => {
    current.current = next
    setValue(next)
  }, [])

  const drag = (raw: number) => {
    cancelAnimationFrame(frame.current)
    const next = detent(raw)
    const now = performance.now()
    const seconds = (now - motion.current.time) / 1000
    const instant =
      seconds > 0 && seconds < 0.1 ? (next - current.current) / seconds : 0
    motion.current = {
      speed:
        motion.current.speed +
        (instant - motion.current.speed) * SPEED_SMOOTHING,
      time: now,
    }
    set(next)
  }

  const jump = React.useCallback(
    (target: number) => {
      cancelAnimationFrame(frame.current)
      motion.current = { speed: 0, time: 0 }
      set(target)
    },
    [set]
  )

  const release = () => {
    const target = Math.round(current.current)
    const offset = current.current - target
    const idle = performance.now() - motion.current.time > 100
    const speed = idle
      ? 0
      : Math.max(-MAX_SPEED, Math.min(MAX_SPEED, motion.current.speed))
    motion.current = { speed: 0, time: 0 }
    if (prefersReducedMotion() || (Math.abs(offset) < 0.001 && !speed)) {
      set(target)
      return target
    }
    const start = performance.now()
    const step = (time: number) => {
      const t = (time - start) / 1000
      const now = springOffset(offset, speed, t)
      const settled =
        Math.abs(now) < 0.001 && Math.exp(-SPRING_FREQUENCY * t) < 0.01
      if (settled) {
        set(target)
        return
      }
      set(
        clamp(target + Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, now)), last)
      )
      frame.current = requestAnimationFrame(step)
    }
    frame.current = requestAnimationFrame(step)
    return target
  }

  return { value, drag, jump, release }
}

const LevelName = React.memo(function LevelName({
  levels,
  level,
}: {
  levels: string[]
  level: number
}) {
  const [shown, setShown] = React.useState({
    level,
    leaving: null as number | null,
    rising: true,
  })
  if (shown.level !== level) {
    setShown({ level, leaving: shown.level, rising: level > shown.level })
  }

  return (
    <span
      className={cn(
        "relative inline-grid transition-colors duration-200",
        level === levels.length - 1 && "text-primary"
      )}
    >
      {levels.map((name) => (
        <span key={name} aria-hidden className="invisible [grid-area:1/1]">
          {name}
        </span>
      ))}
      {shown.leaving !== null && (
        <span
          key={`leaving-${shown.leaving}-${shown.level}`}
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 animate-out duration-150 fill-mode-forwards fade-out motion-reduce:hidden",
            shown.rising ? "slide-out-to-top-1" : "slide-out-to-bottom-1"
          )}
          onAnimationEnd={() =>
            setShown((state) => ({ ...state, leaving: null }))
          }
        >
          {levels[shown.leaving]}
        </span>
      )}
      <span
        key={shown.level}
        className={cn(
          "absolute inset-0",
          shown.leaving !== null &&
            cn(
              "animate-in duration-150 fade-in motion-reduce:animate-none",
              shown.rising ? "slide-in-from-bottom-1" : "slide-in-from-top-1"
            )
        )}
      >
        {levels[level]}
      </span>
    </span>
  )
})

const StepMarks = React.memo(function StepMarks({
  levels,
  recommended,
  hidden,
}: {
  levels: string[]
  recommended?: number
  hidden: boolean
}) {
  const rtl = useDirection() === "rtl"

  return levels.map((name, index) => (
    <span
      key={name}
      aria-hidden
      className={cn(
        "pointer-events-none absolute top-1/2 -translate-y-1/2 transition-opacity duration-200",
        rtl ? "translate-x-1/2" : "-translate-x-1/2",
        hidden && "opacity-0"
      )}
      style={{ insetInlineStart: stepAt(index, levels.length - 1) }}
    >
      {index === recommended ? (
        <span className="block h-3 w-[3px] rounded-xs bg-foreground/30" />
      ) : (
        <span className="block size-1 rounded-full bg-foreground/30" />
      )}
    </span>
  ))
})

const PixelField = React.memo(function PixelField({
  active,
}: {
  active: boolean
}) {
  const ref = React.useRef<HTMLCanvasElement>(null)
  const rtl = useDirection() === "rtl"

  React.useEffect(() => {
    const canvas = ref.current
    if (!canvas || !active) return
    canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height)
    const reduced = prefersReducedMotion()
    const style = getComputedStyle(canvas)
    const draw = (elapsed: number, reveal: number) => {
      drawPixelField(canvas, { elapsed, reveal, color: style.color })
    }
    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      const width = Math.round(canvas.clientWidth * ratio)
      const height = Math.round(canvas.clientHeight * ratio)
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
      }
      if (reduced) draw(0, 1)
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)

    const started = performance.now()
    let frame = 0
    if (!reduced) {
      let drawnAt = 0
      const loop = (time: number) => {
        if (time - drawnAt >= 33) {
          drawnAt = time
          const elapsed = time - started
          draw(elapsed, revealAt(elapsed))
        }
        frame = requestAnimationFrame(loop)
      }
      frame = requestAnimationFrame(loop)
    }
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [active])

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 size-full [mask-image:linear-gradient(to_right,transparent,black_70%)] text-primary transition-opacity duration-200",
        rtl && "-scale-x-100",
        active ? "opacity-100" : "opacity-0"
      )}
    />
  )
})

type EffortSliderProps = Omit<React.ComponentProps<"div">, "onChange"> & {
  /** Level names, lowest first. The last one lights the track. */
  levels?: string[]
  /** Index of the selected level, when controlled. */
  value?: number
  /** Index of the level the picker starts on. */
  defaultValue?: number
  /** Index of the level marked as recommended on the track. */
  recommended?: number
  /** Called with the level's index when the thumb settles on another level. */
  onValueChange?: (level: number) => void
  label?: string
  minLabel?: string
  maxLabel?: string
}

function EffortSlider({
  className,
  levels = defaultLevels,
  value: controlled,
  defaultValue = 2,
  recommended = 1,
  onValueChange,
  label = "Effort",
  minLabel = "Faster",
  maxLabel = "Smarter",
  ...props
}: EffortSliderProps) {
  const last = levels.length - 1
  const initial = clamp(Math.round(controlled ?? defaultValue), last)
  const { value, drag, jump, release } = useSnappingValue(initial, last)
  const level = clamp(Math.round(value), last)
  const top = level === last
  const rtl = useDirection() === "rtl"

  const settled = React.useRef(initial)
  const [settleCount, setSettleCount] = React.useState(0)
  const settle = (target: number) => {
    if (settled.current === target) return
    settled.current = target
    onValueChange?.(target)
    setSettleCount((count) => count + 1)
  }

  React.useEffect(() => {
    if (controlled === undefined) return
    const target = clamp(Math.round(controlled), last)
    if (settled.current === target) return
    settled.current = target
    jump(target)
  }, [controlled, last, jump, settleCount])

  return (
    <div
      data-slot="effort-slider"
      className={cn(
        "flex w-72 flex-col gap-4 rounded-4xl bg-card p-5 text-sm shadow-2xs ring-1 ring-border [--thumb:--spacing(5)]",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-1.5 text-base font-medium">
        <span className="text-muted-foreground">{label}</span>
        <LevelName levels={levels} level={level} />
      </div>
      <div className="flex flex-col gap-2">
        <div aria-hidden className="flex justify-between text-muted-foreground">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
        <SliderPrimitive.Root
          value={[value]}
          onValueChange={(next, { reason }) => {
            const raw = Array.isArray(next) ? next[0] : next
            if (reason !== "input-change") return drag(raw)
            const nearest = clamp(Math.round(raw), last)
            const target =
              nearest !== level
                ? nearest
                : clamp(level + Math.sign(raw - value), last)
            jump(target)
            settle(target)
          }}
          onValueCommitted={() => settle(release())}
          min={0}
          max={last}
          step={0.001}
          thumbAlignment="edge"
        >
          <SliderPrimitive.Control className="relative flex h-6 w-full cursor-ew-resize touch-none items-center select-none">
            <SliderPrimitive.Track className="relative size-full overflow-hidden rounded-sm bg-fill-2">
              <SliderPrimitive.Indicator
                className={cn(
                  "box-content h-full rounded-sm bg-fill-4 pr-[calc(var(--thumb)/2)] transition-opacity duration-200",
                  top && "opacity-0"
                )}
              />
              <PixelField active={top} />
              <StepMarks
                levels={levels}
                recommended={recommended}
                hidden={top}
              />
            </SliderPrimitive.Track>
            <SliderPrimitive.Thumb
              aria-label={label}
              getAriaValueText={(_, thumbValue) => {
                const index = Math.round(thumbValue)
                return index === recommended
                  ? `${levels[index]}, recommended`
                  : levels[index]
              }}
              onKeyDown={(event) => {
                const target = keyTargets[event.key]
                if (!target) return
                event.preventDefault()
                event.stopPropagation()
                const next = clamp(target(level, last, rtl), last)
                jump(next)
                settle(next)
              }}
              className="z-10 h-6 w-(--thumb) rounded-sm bg-white shadow-md ring-1 ring-black/10 transition-[scale,box-shadow] duration-200 select-none not-dark:bg-clip-padding hover:ring-4 hover:ring-ring/30 active:scale-[0.96] has-focus-visible:ring-4 has-focus-visible:ring-ring/30"
            />
          </SliderPrimitive.Control>
        </SliderPrimitive.Root>
      </div>
    </div>
  )
}

export { EffortSlider, type EffortSliderProps }
