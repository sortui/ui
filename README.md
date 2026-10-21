# SortUI

A design system built on [shadcn/ui](https://ui.shadcn.com): the shadcn components restyled on one
token set, extra components and ready-made blocks. Every component keeps the shadcn API, so
existing shadcn code works unchanged.

Documentation and live examples: https://sortui.dev/docs

## Install

SortUI is a [shadcn registry](https://ui.shadcn.com/docs/registry). In a project set up with
`npx shadcn@latest init`:

```sh
npx shadcn@latest registry add @sortui=https://sortui.dev/r/{name}.json
npx shadcn@latest add @sortui/theme
npx shadcn@latest add @sortui/button
```

`@sortui/theme` sets the SortUI tokens in your CSS. Each component brings the tokens it uses.

## Components

- `@sortui/accordion` Accordion
- `@sortui/ai-chat-composer` AI Chat Composer
- `@sortui/alert` Alert
- `@sortui/alert-dialog` Alert Dialog
- `@sortui/aspect-ratio` Aspect Ratio
- `@sortui/attachment` Attachment
- `@sortui/avatar` Avatar
- `@sortui/badge` Badge
- `@sortui/breadcrumb` Breadcrumb
- `@sortui/bubble` Bubble
- `@sortui/button` Button
- `@sortui/button-group` Button Group
- `@sortui/calendar` Calendar
- `@sortui/card` Card
- `@sortui/carousel` Carousel
- `@sortui/chart` Chart
- `@sortui/checkbox` Checkbox
- `@sortui/collapsible` Collapsible
- `@sortui/combobox` Combobox
- `@sortui/command` Command
- `@sortui/context-menu` Context Menu
- `@sortui/dialog` Dialog
- `@sortui/diff` Diff
- `@sortui/direction` Direction
- `@sortui/drawer` Drawer
- `@sortui/dropdown-menu` Dropdown Menu
- `@sortui/empty` Empty
- `@sortui/field` Field
- `@sortui/file-icon` File Icon
- `@sortui/hover-card` Hover Card
- `@sortui/input` Input
- `@sortui/input-group` Input Group
- `@sortui/input-otp` Input OTP
- `@sortui/item` Item
- `@sortui/kbd` Kbd
- `@sortui/label` Label
- `@sortui/marker` Marker
- `@sortui/menubar` Menubar
- `@sortui/message` Message
- `@sortui/message-scroller` Message Scroller
- `@sortui/native-select` Native Select
- `@sortui/navigation-menu` Navigation Menu
- `@sortui/pagination` Pagination
- `@sortui/popover` Popover
- `@sortui/progress` Progress
- `@sortui/radio-group` Radio Group
- `@sortui/resizable` Resizable
- `@sortui/scroll-area` Scroll Area
- `@sortui/select` Select
- `@sortui/separator` Separator
- `@sortui/sheet` Sheet
- `@sortui/sidebar` Sidebar
- `@sortui/simple-icon` Simple Icon
- `@sortui/skeleton` Skeleton
- `@sortui/slider` Slider
- `@sortui/sonner` Sonner
- `@sortui/spinner` Spinner
- `@sortui/switch` Switch
- `@sortui/table` Table
- `@sortui/tabs` Tabs
- `@sortui/textarea` Textarea
- `@sortui/toggle` Toggle
- `@sortui/toggle-group` Toggle Group
- `@sortui/tooltip` Tooltip
- `@sortui/trace` AI Trace
- `@sortui/usage-bar` Usage Bar

## Blocks

- `@sortui/chat-sidebar-01` Chat Sidebar
- `@sortui/chat-thread-01` Chat Thread
- `@sortui/chat-welcome-01` Chat Welcome
- `@sortui/effort-slider-01` Effort Slider
- `@sortui/model-picker-01` Model Picker
- `@sortui/prompt-input-01` Prompt Input
- `@sortui/sleep-widget-01` Sleep Widget

## Repository

This repository mirrors the code the registry serves, released from the SortUI source. Issues and
ideas are welcome; pull requests are read, and accepted changes ship in the next release.

```sh
pnpm install
pnpm typecheck
pnpm registry:validate
```

## License

[MIT](LICENSE)
