"use client"

import { cn } from "cn"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react"

const Toaster = ({
  className,
  style,
  icons,
  toastOptions,
  ...props
}: ToasterProps) => {
  const { theme = "system" } = useTheme()
  const classNames = toastOptions?.classNames

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className={cn("toaster group font-sans!", className)}
      icons={{
        success: <CircleCheckIcon className="size-4 text-blue-500" />,
        info: <InfoIcon className="size-4 text-muted-foreground" />,
        warning: <TriangleAlertIcon className="size-4 text-orange-500" />,
        error: <OctagonXIcon className="size-4 text-destructive-foreground" />,
        loading: (
          <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
        ),
        ...icons,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius-2xl)",
          "--toast-icon-margin-start": "0px",
          "--toast-icon-margin-end": "0px",
          "--toast-svg-margin-start": "0px",
          "--toast-svg-margin-end": "0px",
          ...style,
        } as React.CSSProperties
      }
      toastOptions={{
        ...toastOptions,
        classNames: {
          ...classNames,
          toast: cn(
            "cn-toast items-start! gap-3! text-sm! data-[styled=true]:border-0! data-[styled=true]:shadow-(--shadow-popover)! data-[styled=true]:ring-1 data-[styled=true]:ring-border data-[styled=true]:focus-visible:ring-2 data-[styled=true]:focus-visible:ring-ring/30 [&[data-styled=false]_[data-title]>*]:shadow-(--shadow-popover)",
            classNames?.toast
          ),
          title: cn("leading-5!", classNames?.title),
          description: cn(
            "text-sm! leading-5! text-muted-foreground!",
            classNames?.description
          ),
          icon: cn("mt-0.5", classNames?.icon),
          actionButton: cn(
            "h-6! rounded-md! bg-primary! bg-linear-to-b! from-white/20 to-transparent to-[67.7%] px-2! text-xs! font-medium! text-primary-foreground! shadow-(--shadow-primary-control)! hover:from-white/35 focus-visible:ring-2 focus-visible:ring-ring/30 [[data-cancel]+&]:-ml-1.5!",
            classNames?.actionButton
          ),
          cancelButton: cn(
            "h-6! rounded-md! bg-fill-2! px-2! text-xs! font-medium! text-foreground! hover:bg-fill-3!",
            classNames?.cancelButton
          ),
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
