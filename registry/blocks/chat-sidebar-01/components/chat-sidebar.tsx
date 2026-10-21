"use client"

import * as React from "react"
import {
  ArchiveIcon,
  ChevronsUpDownIcon,
  CircleHelpIcon,
  ImagesIcon,
  LogOutIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PinIcon,
  PinOffIcon,
  SearchIcon,
  SettingsIcon,
  ShareIcon,
  SparklesIcon,
  SquarePenIcon,
  Trash2Icon,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export type Conversation = {
  id: string
  title: string
  /** The date group it is listed under: "Today", "Yesterday", "Previous 7 days"… */
  group: string
  pinned?: boolean
}

export type ChatUser = {
  name: string
  plan: string
  avatar?: string
}

export function ChatSidebar({
  conversations,
  activeId,
  user,
  onSelect,
  onNewChat,
  onTogglePin,
  onDelete,
  ...props
}: Omit<React.ComponentProps<typeof Sidebar>, "onSelect"> & {
  conversations: Conversation[]
  activeId?: string | null
  user: ChatUser
  onSelect?: (id: string) => void
  onNewChat?: () => void
  onTogglePin?: (id: string) => void
  onDelete?: (id: string) => void
}) {
  const [query, setQuery] = React.useState("")
  const { isMobile, setOpenMobile } = useSidebar()

  const visible = conversations.filter((conversation) =>
    conversation.title.toLowerCase().includes(query.trim().toLowerCase())
  )
  const groups = [
    { label: "Pinned", items: visible.filter((item) => item.pinned) },
    ...[...new Set(visible.map((item) => item.group))].map((label) => ({
      label,
      items: visible.filter((item) => item.group === label && !item.pinned),
    })),
  ].filter((group) => group.items.length > 0)

  function closeOnMobile() {
    if (isMobile) setOpenMobile(false)
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader className="gap-2 border-b-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<div />}
              className="pointer-events-none"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <SparklesIcon />
              </span>
              <span className="text-base font-semibold">Lumen</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                onNewChat?.()
                closeOnMobile()
              }}
            >
              <SquarePenIcon />
              <span>New chat</span>
              <KbdGroup className="ml-auto">
                <Kbd size="sm">⇧</Kbd>
                <Kbd size="sm">⌘</Kbd>
                <Kbd size="sm">O</Kbd>
              </KbdGroup>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <ImagesIcon />
              <span>Library</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <SidebarInput
            aria-label="Search chats"
            placeholder="Search chats"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="pl-8"
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel size="sm">{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((conversation) => (
                  <SidebarMenuItem key={conversation.id}>
                    <SidebarMenuButton
                      isActive={conversation.id === activeId}
                      aria-current={
                        conversation.id === activeId ? "page" : undefined
                      }
                      onClick={() => {
                        onSelect?.(conversation.id)
                        closeOnMobile()
                      }}
                    >
                      <span>{conversation.title}</span>
                    </SidebarMenuButton>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <SidebarMenuAction
                            showOnHover
                            aria-label={`More for ${conversation.title}`}
                          />
                        }
                      >
                        <MoreHorizontalIcon />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        side="right"
                        align="start"
                        className="w-44"
                      >
                        <DropdownMenuItem>
                          <ShareIcon />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <PencilIcon />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onTogglePin?.(conversation.id)}
                        >
                          {conversation.pinned ? <PinOffIcon /> : <PinIcon />}
                          {conversation.pinned ? "Unpin" : "Pin"}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <ArchiveIcon />
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => onDelete?.(conversation.id)}
                        >
                          <Trash2Icon />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
        <p
          role="status"
          className="px-4 py-2 text-sm text-muted-foreground empty:p-0"
        >
          {groups.length === 0 &&
            (query.trim()
              ? `No chats match “${query.trim()}”.`
              : "No chats yet.")}
        </p>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger render={<SidebarMenuButton size="lg" />}>
                <Avatar>
                  <AvatarImage src={user.avatar} alt="" />
                  <AvatarFallback>{initials(user.name)}</AvatarFallback>
                </Avatar>
                <span className="grid flex-1 text-left">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-2xs text-muted-foreground">
                    {user.plan}
                  </span>
                </span>
                <ChevronsUpDownIcon />
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                  <DropdownMenuItem>
                    <SparklesIcon />
                    Upgrade plan
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <SettingsIcon />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CircleHelpIcon />
                    Help
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOutIcon />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}
