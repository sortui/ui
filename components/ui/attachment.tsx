import * as React from "react"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

import { Button } from "@/components/ui/button"

const revealActions =
  "*:data-[slot=attachment-actions]:transition-opacity [@media(hover:hover)]:*:data-[slot=attachment-actions]:opacity-0 hover:*:data-[slot=attachment-actions]:opacity-100 has-[:focus-visible]:*:data-[slot=attachment-actions]:opacity-100 data-[state=error]:*:data-[slot=attachment-actions]:opacity-100"

const attachmentVariants = cva(
  "group/attachment relative flex min-w-0 rounded-xl bg-popover text-sm text-popover-foreground shadow-[0_1px_1px_-1px_oklch(0.371_0_0/6%),0_2px_2px_-1px_oklch(0.371_0_0/3%)] transition-colors after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:shadow-[inset_0_1px_0_oklch(1_0_0/15%)] after:inset-ring-1 after:inset-ring-border has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/30 data-[state=error]:after:inset-ring-destructive/30",
  {
    variants: {
      type: {
        file: "w-full items-center gap-2.5 px-3 py-2 hover:bg-control-hover",
        card: `size-40 flex-col hover:bg-control-hover ${revealActions}`,
        image: `size-40 flex-col not-data-[cover=true]:hover:bg-control-hover ${revealActions}`,
      },
      variant: {
        default: "",
        muted: "",
      },
      size: {
        default: "",
        sm: "",
        xs: "",
      },
      orientation: {
        horizontal: "",
        vertical: "",
      },
    },
    compoundVariants: [
      {
        type: "file",
        size: ["sm", "xs"],
        className: "gap-1.5 rounded-lg px-2 py-1.5",
      },
    ],
    defaultVariants: {
      type: "file",
      variant: "default",
      size: "default",
      orientation: "horizontal",
    },
  }
)

function Attachment({
  className,
  state = "done",
  variant = "default",
  size = "default",
  orientation = "horizontal",
  type,
  ...props
}: Omit<React.ComponentProps<"div">, "type"> &
  VariantProps<typeof attachmentVariants> & {
    state?: "idle" | "uploading" | "processing" | "error" | "done"
  }) {
  const resolvedType = type ?? (orientation === "vertical" ? "card" : "file")
  const cover =
    resolvedType === "image" &&
    state !== "uploading" &&
    state !== "processing" &&
    state !== "error"
  return (
    <div
      data-slot="attachment"
      data-state={state}
      data-variant={variant}
      data-size={size}
      data-type={resolvedType}
      data-cover={cover || undefined}
      data-orientation={resolvedType === "file" ? "horizontal" : "vertical"}
      className={cn(
        attachmentVariants({ type: resolvedType, variant, size, orientation }),
        className
      )}
      {...props}
    />
  )
}

const attachmentMediaVariants = cva(
  "relative flex shrink-0 items-center justify-center overflow-hidden text-muted-foreground group-data-[type=card]/attachment:block group-data-[type=card]/attachment:justify-start group-data-[type=card]/attachment:truncate group-data-[type=card]/attachment:pt-3 group-data-[type=card]/attachment:pr-10 group-data-[type=card]/attachment:pl-3 group-data-[type=card]/attachment:font-mono group-data-[type=card]/attachment:text-2xs group-data-[type=file]/attachment:size-8 group-data-[size=sm]/attachment:group-data-[type=file]/attachment:size-6 group-data-[size=xs]/attachment:group-data-[type=file]/attachment:size-6 group-data-[type=image]/attachment:absolute group-data-[type=image]/attachment:inset-0 group-data-[type=image]/attachment:rounded-[inherit] group-data-[type=image]/attachment:bg-fill-1 group-data-[type=image]/attachment:not-group-data-[cover=true]/attachment:hidden [&_svg]:pointer-events-none group-data-[type=file]/attachment:[&>[data-slot=file-icon]]:size-8 group-data-[size=sm]/attachment:group-data-[type=file]/attachment:[&>[data-slot=file-icon]]:size-5 group-data-[size=xs]/attachment:group-data-[type=file]/attachment:[&>[data-slot=file-icon]]:size-5 group-data-[type=card]/attachment:[&>svg]:size-4 group-data-[type=file]/attachment:[&>svg]:size-5 group-data-[size=sm]/attachment:group-data-[type=file]/attachment:[&>svg]:size-4 group-data-[size=xs]/attachment:group-data-[type=file]/attachment:[&>svg]:size-4",
  {
    variants: {
      variant: {
        icon: "",
        image:
          "group-data-[type=file]/attachment:rounded-md group-data-[size=sm]/attachment:group-data-[type=file]/attachment:rounded-sm group-data-[size=xs]/attachment:group-data-[type=file]/attachment:rounded-sm *:[img]:size-full *:[img]:object-cover",
      },
    },
    defaultVariants: {
      variant: "icon",
    },
  }
)

function AttachmentMedia({
  className,
  variant = "icon",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof attachmentMediaVariants>) {
  return (
    <div
      data-slot="attachment-media"
      data-variant={variant}
      className={cn(attachmentMediaVariants({ variant }), className)}
      {...props}
    />
  )
}

function AttachmentContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="attachment-content"
      className={cn(
        "flex max-w-full min-w-0 flex-1 flex-col gap-0.5 group-data-[cover=true]/attachment:absolute group-data-[cover=true]/attachment:inset-0 group-data-[cover=true]/attachment:justify-end group-data-[cover=true]/attachment:rounded-[inherit] group-data-[cover=true]/attachment:bg-linear-to-b group-data-[cover=true]/attachment:from-transparent group-data-[cover=true]/attachment:to-black/40 group-data-[cover=true]/attachment:text-white group-data-[cover=true]/attachment:transition-colors group-data-[cover=true]/attachment:group-hover/attachment:bg-black/20 group-data-[orientation=vertical]/attachment:mt-auto group-data-[orientation=vertical]/attachment:w-full group-data-[orientation=vertical]/attachment:flex-none group-data-[orientation=vertical]/attachment:p-3",
        className
      )}
      {...props}
    />
  )
}

function AttachmentTitle({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="attachment-title"
      className={cn("block max-w-full min-w-0 truncate", className)}
      {...props}
    />
  )
}

function AttachmentDescription({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="attachment-description"
      className={cn(
        "block max-w-full min-w-0 truncate text-2xs text-muted-foreground group-data-[cover=true]/attachment:text-white/70 group-data-[state=error]/attachment:text-destructive-foreground group-data-[state=processing]/attachment:shimmer group-data-[state=uploading]/attachment:shimmer",
        className
      )}
      {...props}
    />
  )
}

function AttachmentActions({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="attachment-actions"
      className={cn(
        "relative z-20 flex shrink-0 items-center gap-1 group-data-[orientation=vertical]/attachment:absolute group-data-[orientation=vertical]/attachment:top-2 group-data-[orientation=vertical]/attachment:right-2 group-data-[orientation=vertical]/attachment:gap-0",
        className
      )}
      {...props}
    />
  )
}

function AttachmentAction({
  className,
  variant,
  size = "icon-xs",
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      data-slot="attachment-action"
      variant={variant ?? "ghost"}
      size={size}
      className={cn(
        "rounded-full text-muted-foreground group-data-[cover=true]/attachment:text-white hover:text-foreground group-data-[cover=true]/attachment:hover:bg-white/15 group-data-[cover=true]/attachment:hover:text-white",
        className
      )}
      {...props}
    />
  )
}

function AttachmentTrigger({
  className,
  render,
  type,
  ...props
}: useRender.ComponentProps<"button">) {
  return useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(
      {
        type: render ? type : (type ?? "button"),
        className: cn("absolute inset-0 z-10 outline-none", className),
      },
      props
    ),
    render,
    state: {
      slot: "attachment-trigger",
    },
  })
}

function AttachmentGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="attachment-group"
      className={cn(
        "flex min-w-0 scroll-fade-x snap-x snap-mandatory scroll-px-1 scrollbar-none gap-2 overflow-x-auto overscroll-x-contain p-1 *:data-[slot=attachment]:flex-none *:data-[slot=attachment]:snap-start",
        className
      )}
      {...props}
    />
  )
}

export {
  Attachment,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
  AttachmentActions,
  AttachmentAction,
  AttachmentTrigger,
}
