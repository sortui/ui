"use client"

import { ChevronDownIcon, SparklesIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type Model = {
  id: string
  name: string
  description: string
  pro?: boolean
}

export const models: Model[] = [
  {
    id: "fast",
    name: "Lumen Fast",
    description: "Answers right away",
  },
  {
    id: "thinking",
    name: "Lumen Thinking",
    description: "Thinks longer for better answers",
  },
  {
    id: "pro",
    name: "Lumen Pro",
    description: "Research-grade reasoning",
    pro: true,
  },
]

export function ModelPicker({
  value,
  onValueChange,
  options = models,
  onUpgrade,
}: {
  value: string
  onValueChange: (value: string) => void
  options?: Model[]
  onUpgrade?: () => void
}) {
  const current = options.find((model) => model.id === value) ?? options[0]
  if (!current) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" className="text-base font-medium" />}
      >
        {current.name}
        <ChevronDownIcon
          data-icon="inline-end"
          className="text-muted-foreground"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Model</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={current.id}
            onValueChange={onValueChange}
          >
            {options.map((model) => (
              <DropdownMenuRadioItem key={model.id} value={model.id}>
                <div className="flex min-w-0 flex-col">
                  <span className="flex items-center gap-2">
                    {model.name}
                    {model.pro && <Badge variant="secondary">Pro</Badge>}
                  </span>
                  <span className="text-muted-foreground">
                    {model.description}
                  </span>
                </div>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
        {onUpgrade && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onUpgrade}>
              <SparklesIcon />
              Upgrade for longer answers
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
