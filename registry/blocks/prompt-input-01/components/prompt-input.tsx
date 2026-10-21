"use client"

import * as React from "react"
import {
  ArrowUpIcon,
  FileTextIcon,
  GlobeIcon,
  ImageIcon,
  MicIcon,
  PaperclipIcon,
  PlusIcon,
  SquareIcon,
  TelescopeIcon,
  XIcon,
} from "lucide-react"
import { cn } from "cn"

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export type PromptTool = "search" | "research" | "image"

export type PromptSubmission = {
  text: string
  files: File[]
  tool: PromptTool | null
}

export const promptTools: {
  id: PromptTool
  label: string
  icon: React.ComponentType
}[] = [
  { id: "search", label: "Web search", icon: GlobeIcon },
  { id: "research", label: "Deep research", icon: TelescopeIcon },
  { id: "image", label: "Create image", icon: ImageIcon },
]

export function PromptInput({
  onSubmit,
  onStop,
  onDictate,
  status = "ready",
  placeholder = "Ask anything",
  autoFocus,
  className,
}: {
  onSubmit?: (submission: PromptSubmission) => void
  onStop?: () => void
  onDictate?: () => void
  status?: "ready" | "busy"
  placeholder?: string
  autoFocus?: boolean
  className?: string
}) {
  const [text, setText] = React.useState("")
  const [files, setFiles] = React.useState<PickedFile[]>([])
  const [tool, setTool] = React.useState<PromptTool | null>(null)
  const fileInput = React.useRef<HTMLInputElement>(null)

  const previews = React.useRef(new Set<string>())
  const nextId = React.useRef(0)
  React.useEffect(() => {
    const urls = previews.current
    return () => urls.forEach((url) => URL.revokeObjectURL(url))
  }, [])

  function release(items: PickedFile[]) {
    for (const { preview } of items) {
      if (!preview) continue
      URL.revokeObjectURL(preview)
      previews.current.delete(preview)
    }
  }

  const busy = status === "busy"
  const canSend = !busy && (text.trim().length > 0 || files.length > 0)
  const activeTool = promptTools.find((item) => item.id === tool)

  function submit() {
    if (!canSend) return
    onSubmit?.({
      text: text.trim(),
      files: files.map((item) => item.file),
      tool,
    })
    release(files)
    setText("")
    setFiles([])
  }

  return (
    <form
      className={cn("w-full", className)}
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
    >
      <InputGroup className="rounded-3xl">
        {files.length > 0 && (
          <InputGroupAddon align="block-start" className="flex-wrap gap-2">
            {files.map((item) => (
              <FileChip
                key={item.id}
                file={item.file}
                preview={item.preview}
                onRemove={() => {
                  release([item])
                  setFiles((current) =>
                    current.filter((other) => other.id !== item.id)
                  )
                }}
              />
            ))}
          </InputGroupAddon>
        )}
        <InputGroupTextarea
          aria-label="Message"
          placeholder={placeholder}
          autoFocus={autoFocus}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing &&
              event.keyCode !== 229
            ) {
              event.preventDefault()
              submit()
            }
          }}
          className="max-h-52 min-h-14"
        />
        <InputGroupAddon align="block-end" className="gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <InputGroupButton
                  size="icon-sm"
                  variant="outline"
                  aria-label="Add files and tools"
                />
              }
            >
              <PlusIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-52">
              <DropdownMenuItem onClick={() => fileInput.current?.click()}>
                <PaperclipIcon />
                Add photos & files
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel>Tools</DropdownMenuLabel>
                {promptTools.map(({ id, label, icon: Icon }) => (
                  <DropdownMenuItem key={id} onClick={() => setTool(id)}>
                    <Icon />
                    {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          {activeTool && (
            <InputGroupButton
              size="sm"
              variant="secondary"
              aria-label={`Turn off ${activeTool.label.toLowerCase()}`}
              onClick={() => setTool(null)}
            >
              <activeTool.icon />
              {activeTool.label}
              <XIcon className="text-muted-foreground" />
            </InputGroupButton>
          )}
          <div className="ml-auto flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger
                render={
                  <InputGroupButton
                    size="icon-sm"
                    aria-label="Dictate"
                    onClick={onDictate}
                  />
                }
              >
                <MicIcon />
              </TooltipTrigger>
              <TooltipContent>Dictate</TooltipContent>
            </Tooltip>
            {busy ? (
              <InputGroupButton
                size="icon-sm"
                variant="default"
                aria-label="Stop generating"
                onClick={onStop}
              >
                <SquareIcon className="fill-current" />
              </InputGroupButton>
            ) : (
              <InputGroupButton
                type="submit"
                size="icon-sm"
                variant="default"
                aria-label="Send"
                disabled={!canSend}
              >
                <ArrowUpIcon />
              </InputGroupButton>
            )}
          </div>
        </InputGroupAddon>
        <input
          ref={fileInput}
          type="file"
          multiple
          hidden
          onChange={(event) => {
            const picked = Array.from(event.target.files ?? []).map((file) => {
              const preview = file.type.startsWith("image/")
                ? URL.createObjectURL(file)
                : null
              if (preview) previews.current.add(preview)
              return { id: nextId.current++, file, preview }
            })
            setFiles((current) => [...current, ...picked])
            event.target.value = ""
          }}
        />
      </InputGroup>
    </form>
  )
}

type PickedFile = { id: number; file: File; preview: string | null }

function FileChip({
  file,
  preview,
  onRemove,
}: {
  file: File
  preview: string | null
  onRemove: () => void
}) {
  return (
    <Attachment
      type={preview ? "image" : "file"}
      className={preview ? "size-13.5" : "w-56"}
    >
      <AttachmentMedia variant={preview ? "image" : "icon"}>
        {preview ? <img src={preview} alt="" /> : <FileTextIcon />}
      </AttachmentMedia>
      <AttachmentContent className={preview ? "sr-only" : undefined}>
        <AttachmentTitle>{file.name}</AttachmentTitle>
        <AttachmentDescription>{formatSize(file.size)}</AttachmentDescription>
      </AttachmentContent>
      <AttachmentActions>
        <AttachmentAction aria-label={`Remove ${file.name}`} onClick={onRemove}>
          <XIcon />
        </AttachmentAction>
      </AttachmentActions>
    </Attachment>
  )
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
