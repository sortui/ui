"use client"

import * as React from "react"
import {
  CheckIcon,
  ChevronRightIcon,
  CopyIcon,
  FileTextIcon,
  PencilIcon,
  RotateCcwIcon,
  ShareIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "lucide-react"
import { cn } from "cn"

import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Message, MessageContent, MessageFooter } from "@/components/ui/message"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export type ChatAttachment = {
  name: string
  description: string
}

export type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  attachments?: ChatAttachment[]
  /** What the model weighed before answering, shown folded above the reply. */
  reasoning?: { seconds: number; steps: string[] }
  /** `thinking` before the first word, `streaming` while words arrive. */
  status?: "thinking" | "streaming" | "done"
}

export function ChatThread({
  messages,
  onRetry,
  onEdit,
  onShare,
  onFeedback,
  className,
}: {
  messages: ChatMessage[]
  onRetry?: (message: ChatMessage) => void
  onEdit?: (message: ChatMessage) => void
  onShare?: (message: ChatMessage) => void
  /** Called with the new rating, or null when it is turned off. */
  onFeedback?: (message: ChatMessage, value: "good" | "bad" | null) => void
  className?: string
}) {
  return (
    <MessageScrollerProvider>
      <MessageScroller className={className}>
        <MessageScrollerViewport>
          <MessageScrollerContent className="mx-auto w-full max-w-3xl gap-8 px-4 py-8">
            {messages.map((message) => (
              <MessageScrollerItem
                key={message.id}
                messageId={message.id}
                scrollAnchor={message.role === "user"}
              >
                {message.role === "user" ? (
                  <UserMessage message={message} onEdit={onEdit} />
                ) : (
                  <AssistantMessage
                    message={message}
                    onRetry={onRetry}
                    onShare={onShare}
                    onFeedback={onFeedback}
                  />
                )}
              </MessageScrollerItem>
            ))}
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton />
      </MessageScroller>
    </MessageScrollerProvider>
  )
}

function UserMessage({
  message,
  onEdit,
}: {
  message: ChatMessage
  onEdit?: (message: ChatMessage) => void
}) {
  return (
    <Message align="end">
      <MessageContent>
        {message.attachments?.map((file, index) => (
          <Attachment key={index} className="w-64">
            <AttachmentMedia>
              <FileTextIcon />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>{file.name}</AttachmentTitle>
              <AttachmentDescription>{file.description}</AttachmentDescription>
            </AttachmentContent>
          </Attachment>
        ))}
        {message.content && (
          <Bubble variant="muted" align="end">
            <BubbleContent className="whitespace-pre-wrap">
              {message.content}
            </BubbleContent>
          </Bubble>
        )}
        <MessageFooter className="transition-opacity has-focus-visible:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/message:opacity-100">
          {message.content && <CopyAction text={message.content} />}
          {onEdit && (
            <Action label="Edit message" onClick={() => onEdit(message)}>
              <PencilIcon />
            </Action>
          )}
        </MessageFooter>
      </MessageContent>
    </Message>
  )
}

function AssistantMessage({
  message,
  onRetry,
  onShare,
  onFeedback,
}: {
  message: ChatMessage
  onRetry?: (message: ChatMessage) => void
  onShare?: (message: ChatMessage) => void
  onFeedback?: (message: ChatMessage, value: "good" | "bad" | null) => void
}) {
  const [feedback, setFeedback] = React.useState<"good" | "bad" | null>(null)

  function toggleFeedback(value: "good" | "bad") {
    const next = feedback === value ? null : value
    setFeedback(next)
    onFeedback?.(message, next)
  }

  if (message.status === "thinking") {
    return (
      <Message>
        <MessageContent>
          <p className="shimmer text-sm text-muted-foreground">Thinking…</p>
        </MessageContent>
      </Message>
    )
  }

  return (
    <Message>
      <MessageContent>
        {message.reasoning && <Reasoning {...message.reasoning} />}
        <Bubble variant="ghost">
          <BubbleContent>
            <RichText text={message.content} />
          </BubbleContent>
        </Bubble>
        {message.status !== "streaming" && (
          <MessageFooter className="gap-0">
            <CopyAction text={message.content} />
            <Action
              label="Good response"
              pressed={feedback === "good"}
              onClick={() => toggleFeedback("good")}
            >
              <ThumbsUpIcon />
            </Action>
            <Action
              label="Bad response"
              pressed={feedback === "bad"}
              onClick={() => toggleFeedback("bad")}
            >
              <ThumbsDownIcon />
            </Action>
            {onShare && (
              <Action label="Share" onClick={() => onShare(message)}>
                <ShareIcon />
              </Action>
            )}
            {onRetry && (
              <Action label="Try again" onClick={() => onRetry(message)}>
                <RotateCcwIcon />
              </Action>
            )}
          </MessageFooter>
        )}
      </MessageContent>
    </Message>
  )
}

function Reasoning({ seconds, steps }: { seconds: number; steps: string[] }) {
  return (
    <Collapsible className="flex flex-col gap-2">
      <CollapsibleTrigger className="group/reasoning flex w-fit items-center gap-1 rounded-xs text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/30">
        Thought for {seconds} {seconds === 1 ? "second" : "seconds"}
        <ChevronRightIcon className="size-4 transition-transform group-data-panel-open/reasoning:rotate-90" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ul className="flex flex-col gap-2 border-l-2 border-border pl-3 text-sm text-muted-foreground">
          {steps.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  )
}

function Action({
  label,
  pressed,
  onClick,
  children,
}: {
  label: string
  pressed?: boolean
  onClick?: () => void
  children: React.ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={label}
            aria-pressed={pressed}
            onClick={onClick}
            className={cn(
              "text-muted-foreground hover:text-foreground",
              pressed && "text-foreground"
            )}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

function CopyAction({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    if (!copied) return
    const timeout = setTimeout(() => setCopied(false), 1500)
    return () => clearTimeout(timeout)
  }, [copied])

  return (
    <>
      <Action
        label={copied ? "Copied" : "Copy"}
        onClick={() => {
          navigator.clipboard?.writeText(text).then(
            () => setCopied(true),
            () => {}
          )
        }}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </Action>
      <span role="status" className="sr-only">
        {copied && "Copied"}
      </span>
    </>
  )
}

function RichText({ text }: { text: string }) {
  const blocks = text.split(/\n\s*\n/).filter((block) => block.trim())

  return (
    <div className="flex flex-col gap-3 leading-6">
      {blocks.map((block, index) => {
        const lines = block.trim().split("\n")
        if (lines.every((line) => /^- /.test(line))) {
          return (
            <ul key={index} className="flex list-disc flex-col gap-1 pl-5">
              {lines.map((line, i) => (
                <li key={i}>{inline(line.slice(2))}</li>
              ))}
            </ul>
          )
        }
        if (lines.every((line) => /^\d+\. /.test(line))) {
          return (
            <ol key={index} className="flex list-decimal flex-col gap-1 pl-5">
              {lines.map((line, i) => (
                <li key={i}>{inline(line.replace(/^\d+\. /, ""))}</li>
              ))}
            </ol>
          )
        }
        return (
          <p key={index} className="whitespace-pre-wrap">
            {inline(block.trim())}
          </p>
        )
      })}
    </div>
  )
}

function inline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={index} className="font-semibold">
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    )
  )
}
