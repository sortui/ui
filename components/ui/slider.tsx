import { Slider as SliderPrimitive } from "@base-ui/react/slider"
import { cn } from "cn"

function Slider({
  className,
  children,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: SliderPrimitive.Root.Props) {
  const current = value ?? defaultValue
  const thumbs = Array.isArray(current) ? current.length : 1

  return (
    <SliderPrimitive.Root
      className={cn(
        "flex flex-col gap-2 data-horizontal:w-full data-vertical:h-full",
        className
      )}
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      thumbAlignment="edge"
      {...props}
    >
      {children}
      <SliderPrimitive.Control
        data-slot="slider-control"
        className="relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col"
      >
        <SliderPrimitive.Track
          data-slot="slider-track"
          className="relative grow overflow-hidden rounded-2xl bg-fill-2 select-none data-horizontal:h-1 data-horizontal:w-full data-vertical:h-full data-vertical:w-1"
        >
          <SliderPrimitive.Indicator
            data-slot="slider-range"
            className="bg-primary select-none data-horizontal:h-full data-vertical:w-full"
          />
        </SliderPrimitive.Track>
        {Array.from({ length: thumbs }, (_, index) => (
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            key={index}
            className="block size-4 shrink-0 rounded-2xl bg-white shadow-md ring-1 ring-black/10 transition-[color,box-shadow] duration-200 select-none not-dark:bg-clip-padding hover:ring-4 hover:ring-ring/30 has-focus-visible:ring-4 has-focus-visible:ring-ring/30"
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

function SliderLabel({ className, ...props }: SliderPrimitive.Label.Props) {
  return (
    <SliderPrimitive.Label
      data-slot="slider-label"
      className={cn("text-sm font-medium", className)}
      {...props}
    />
  )
}

function SliderValue({ className, ...props }: SliderPrimitive.Value.Props) {
  return (
    <SliderPrimitive.Value
      data-slot="slider-value"
      className={cn("text-sm text-muted-foreground tabular-nums", className)}
      {...props}
    />
  )
}

export { Slider, SliderLabel, SliderValue }
