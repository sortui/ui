import type { SimpleIcon as SimpleIconData } from "simple-icons"
import { cn } from "cn"

function SimpleIcon({
  icon,
  title,
  className,
  ...props
}: Omit<React.ComponentProps<"svg">, "children"> & {
  /** An icon object from `simple-icons`, e.g. `siGithub`. */
  icon: SimpleIconData
  /** Accessible name; omitted = decorative (`aria-hidden`). */
  title?: string
}) {
  const labelled = Boolean(
    title || props["aria-label"] || props["aria-labelledby"]
  )

  return (
    <svg
      data-slot="simple-icon"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={24}
      height={24}
      fill="currentColor"
      role={labelled ? "img" : undefined}
      aria-hidden={labelled ? undefined : true}
      className={cn("shrink-0", className)}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <path d={icon.path} />
    </svg>
  )
}

export { SimpleIcon }
