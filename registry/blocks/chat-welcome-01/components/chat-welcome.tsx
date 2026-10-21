"use client"

import * as React from "react"
import {
  ChartColumnIcon,
  FileTextIcon,
  ListChecksIcon,
  MailIcon,
} from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import {
  PromptInput,
  type PromptSubmission,
} from "@/registry/blocks/prompt-input-01/components/prompt-input"

export type ChatSuggestion = {
  label: string
  prompt: string
  icon: React.ComponentType
}

export const chatSuggestions: ChatSuggestion[] = [
  {
    label: "Summarize feedback",
    prompt: "Summarize this week's customer feedback into the top five themes.",
    icon: FileTextIcon,
  },
  {
    label: "Analyze a funnel",
    prompt:
      "Where do new users drop off between sign-up and their first project?",
    icon: ChartColumnIcon,
  },
  {
    label: "Plan a sprint",
    prompt: "Turn these feature requests into a two-week sprint plan.",
    icon: ListChecksIcon,
  },
  {
    label: "Write an email",
    prompt: "Write a short email announcing dark mode to our beta users.",
    icon: MailIcon,
  },
]

export function ChatWelcome({
  greeting = "What can I help with?",
  suggestions = chatSuggestions,
  onSubmit,
  autoFocus,
  className,
}: {
  greeting?: string
  suggestions?: ChatSuggestion[]
  onSubmit?: (submission: PromptSubmission) => void
  autoFocus?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-3xl flex-col items-center gap-8 px-4",
        className
      )}
    >
      <h1 className="text-center text-3xl font-semibold text-balance">
        {greeting}
      </h1>
      <PromptInput onSubmit={onSubmit} autoFocus={autoFocus} />
      <div className="flex flex-wrap justify-center gap-2">
        {suggestions.map(({ label, prompt, icon: Icon }) => (
          <Button
            key={label}
            variant="outline"
            size="sm"
            onClick={() => onSubmit?.({ text: prompt, files: [], tool: null })}
          >
            <Icon data-icon="inline-start" />
            {label}
          </Button>
        ))}
      </div>
    </div>
  )
}
