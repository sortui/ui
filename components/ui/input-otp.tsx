"use client"

import * as React from "react"
import { cn } from "cn"
import { OTPInput, OTPInputContext } from "input-otp"
import { MinusIcon } from "lucide-react"

function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string
}) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        "cn-input-otp flex items-center has-disabled:opacity-50",
        containerClassName
      )}
      spellCheck={false}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  )
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn(
        "flex items-center rounded-lg outline-1 -outline-offset-1 outline-field-border outline-solid has-aria-invalid:ring-2 has-aria-invalid:ring-destructive/20 has-aria-invalid:outline-destructive dark:has-aria-invalid:ring-destructive/40 dark:has-aria-invalid:outline-destructive/50",
        className
      )}
      {...props}
    />
  )
}

function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  index: number
}) {
  const inputOTPContext = React.useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {}

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        "relative flex size-8 items-center justify-center border-field-border bg-field text-xs outline-1 -outline-offset-1 outline-transparent transition-[color,box-shadow,outline-color] duration-200 outline-solid first:rounded-l-lg last:rounded-r-lg data-[active=true]:z-10 data-[active=true]:ring-2 data-[active=true]:ring-ring/30 data-[active=true]:outline-ring data-[active=true]:aria-invalid:ring-destructive/20 data-[active=true]:aria-invalid:outline-destructive dark:data-[active=true]:aria-invalid:ring-destructive/40 dark:data-[active=true]:aria-invalid:outline-destructive/50 [&:not(:last-child)]:border-r",
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
        </div>
      )}
    </div>
  )
}

function InputOTPSeparator({ ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-separator"
      className="flex items-center [&_svg:not([class*='size-'])]:size-4"
      role="separator"
      {...props}
    >
      <MinusIcon />
    </div>
  )
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
