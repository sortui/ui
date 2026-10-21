"use client"

import * as React from "react"
import { cn } from "cn"
import {
  DayPicker,
  getDefaultClassNames,
  type ChevronProps,
  type DayButton,
  type Locale,
  type RootProps,
  type WeekNumberProps,
} from "react-day-picker"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from "lucide-react"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  locale,
  formatters,
  components,
  numberOfMonths = 1,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const defaultClassNames = getDefaultClassNames()
  const rootWidth =
    numberOfMonths <= 1
      ? "w-64"
      : numberOfMonths === 2
        ? "w-64 md:w-128"
        : "w-fit"

  const LocalizedDayButton = React.useCallback(
    (dayButtonProps: React.ComponentProps<typeof DayButton>) => (
      <CalendarDayButton locale={locale} {...dayButtonProps} />
    ),
    [locale]
  )

  const mergedComponents = React.useMemo(
    () => ({
      Root: CalendarRoot,
      Chevron: CalendarChevron,
      DayButton: LocalizedDayButton,
      WeekNumber: CalendarWeekNumber,
      ...components,
    }),
    [LocalizedDayButton, components]
  )

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      numberOfMonths={numberOfMonths}
      className={cn(
        "group/calendar max-w-full bg-background p-3 [--cell-radius:var(--radius-sm)] [--cell-size:--spacing(7)] in-data-[slot=card-content]:bg-transparent in-data-[slot=popover-content]:bg-transparent",
        rootWidth,
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      locale={locale}
      formatters={formatters}
      classNames={{
        root: defaultClassNames.root,
        months: cn(
          "relative flex flex-col gap-6 md:flex-row",
          defaultClassNames.months
        ),
        month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
        nav: cn(
          "absolute top-0 right-0 flex h-6 items-center gap-1",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-6 p-0 select-none aria-disabled:opacity-50",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-6 p-0 select-none aria-disabled:opacity-50",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex h-6 w-full items-center justify-start pr-13",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "flex h-6 w-full items-center justify-start gap-2 pr-13 text-sm font-normal",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "relative rounded-(--cell-radius)",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "absolute inset-0 bg-popover opacity-0",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          "font-normal select-none",
          captionLayout === "label"
            ? "text-sm"
            : "flex items-center gap-0.5 rounded-(--cell-radius) text-sm [&>svg]:size-4 [&>svg]:text-muted-foreground",
          defaultClassNames.caption_label
        ),
        month_grid: cn("w-full border-collapse", defaultClassNames.month_grid),
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "flex-1 rounded-sm py-0.5 text-sm font-normal text-muted-foreground select-none",
          defaultClassNames.weekday
        ),
        week: cn("mt-2 flex w-full", defaultClassNames.week),
        week_number_header: cn(
          "w-(--cell-size) select-none",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "text-[0.8rem] text-muted-foreground select-none",
          defaultClassNames.week_number
        ),
        day: cn(
          "group/day relative h-(--cell-size) w-full min-w-(--cell-size) rounded-(--cell-radius) p-0 text-center select-none [&:last-child[data-selected=true]_button]:rounded-r-(--cell-radius)",
          props.showWeekNumber
            ? "[&:nth-child(2)[data-selected=true]_button]:rounded-l-(--cell-radius)"
            : "[&:first-child[data-selected=true]_button]:rounded-l-(--cell-radius)",
          defaultClassNames.day
        ),
        range_start: cn(
          "relative isolate z-0 rounded-l-(--cell-radius) bg-fill-2 after:absolute after:inset-y-0 after:right-0 after:w-4 after:bg-fill-2",
          defaultClassNames.range_start
        ),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn(
          "relative isolate z-0 rounded-r-(--cell-radius) bg-fill-2 after:absolute after:inset-y-0 after:left-0 after:w-4 after:bg-fill-2",
          defaultClassNames.range_end
        ),
        today: cn(
          "rounded-(--cell-radius) bg-fill-2 text-foreground data-[selected=true]:rounded-none",
          defaultClassNames.today
        ),
        outside: cn(
          "text-muted-foreground aria-selected:text-muted-foreground",
          defaultClassNames.outside
        ),
        disabled: cn(
          "text-muted-foreground opacity-50",
          defaultClassNames.disabled
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={mergedComponents}
      {...props}
    />
  )
}

function CalendarRoot({ className, rootRef, ...props }: RootProps) {
  return (
    <div
      data-slot="calendar"
      ref={rootRef}
      className={className}
      {...props}
    />
  )
}

function CalendarChevron({
  className,
  orientation,
  size,
  style,
}: ChevronProps) {
  if (orientation === "left") {
    return (
      <ChevronLeftIcon
        className={cn("size-4", className)}
        size={size}
        style={style}
      />
    )
  }

  if (orientation === "right") {
    return (
      <ChevronRightIcon
        className={cn("size-4", className)}
        size={size}
        style={style}
      />
    )
  }

  return (
    <ChevronDownIcon
      className={cn("size-4", className)}
      size={size}
      style={style}
    />
  )
}

function CalendarWeekNumber({
  children,
  className,
  style,
  role,
  scope,
  "aria-label": ariaLabel,
}: WeekNumberProps) {
  return (
    <td
      className={className}
      style={style}
      role={role}
      scope={scope}
      aria-label={ariaLabel}
    >
      <div className="flex size-(--cell-size) items-center justify-center text-center">
        {children}
      </div>
    </td>
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  locale,
  ...props
}: React.ComponentProps<typeof DayButton> & { locale?: Partial<Locale> }) {
  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString(locale?.code ?? "en-US")}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "relative isolate z-10 flex h-full w-full min-w-(--cell-size) flex-col gap-1 rounded-(--cell-radius) leading-none font-normal group-data-[focused=true]/day:ring-[3px] group-data-[focused=true]/day:ring-ring/30 data-[range-end=true]:rounded-(--cell-radius) data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-fill-2 data-[range-middle=true]:text-foreground data-[range-start=true]:rounded-(--cell-radius) data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground dark:hover:text-foreground [&>span]:text-2xs [&>span]:opacity-70",
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
