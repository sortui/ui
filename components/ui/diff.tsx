"use client"

import * as React from "react"
import {
  diffWordsWithSpace,
  parsePatch,
  structuredPatch,
  type StructuredPatchHunk,
} from "diff"
import { UnfoldVerticalIcon } from "lucide-react"
import { cn } from "cn"

type DiffLineKind = "context" | "added" | "removed"

type DiffLine = {
  kind: DiffLineKind
  content: string
  oldNumber?: number
  newNumber?: number
  oldIndex?: number
  newIndex?: number
  change?: number
  marks?: [number, number][]
}

/** One change: a run of removed and / or added lines with no unchanged line between. */
type DiffChange = {
  index: number
  /** Where the change starts in the old / new file. */
  oldStart?: number
  newStart?: number
  removed: string[]
  added: string[]
}

type DiffHunk = { header: string; lines: DiffLine[] }

type Token = { content: string; color?: string }

type DiffContextValue = {
  hunks: DiffHunk[]
  changes: DiffChange[]
  foldable: boolean
  contextLines: number
  view: "unified" | "split"
  lineNumbers: "both" | "single"
  added: number
  removed: number
  tokens: { old: Token[][]; new: Token[][] } | null
}

const DiffContext = React.createContext<DiffContextValue | null>(null)

function useDiff() {
  const context = React.useContext(DiffContext)
  if (!context) throw new Error("Diff parts must be used within Diff.")
  return context
}

function toHunks(hunks: StructuredPatchHunk[]) {
  let oldIndex = 0
  let newIndex = 0
  return hunks.map((hunk): DiffHunk => {
    let oldNumber = hunk.oldStart
    let newNumber = hunk.newStart
    const lines: DiffLine[] = []
    for (const raw of hunk.lines) {
      const sign = raw === "" ? " " : raw[0]
      const content = raw.slice(1)
      if (sign === "-") {
        lines.push({
          kind: "removed",
          content,
          oldNumber: oldNumber++,
          oldIndex: oldIndex++,
        })
      } else if (sign === "+") {
        lines.push({
          kind: "added",
          content,
          newNumber: newNumber++,
          newIndex: newIndex++,
        })
      } else if (sign === " ") {
        lines.push({
          kind: "context",
          content,
          oldNumber: oldNumber++,
          newNumber: newNumber++,
          oldIndex: oldIndex++,
          newIndex: newIndex++,
        })
      }
    }
    const oldStart = hunk.oldLines ? hunk.oldStart : hunk.oldStart - 1
    const newStart = hunk.newLines ? hunk.newStart : hunk.newStart - 1
    return {
      header: `@@ -${oldStart},${hunk.oldLines} +${newStart},${hunk.newLines} @@`,
      lines,
    }
  })
}

const WORD_MARK_SIMILARITY = 0.4
const WORD_MARK_MAX_LENGTH = 1000

function markWords(before: DiffLine, after: DiffLine) {
  if (
    before.content.length > WORD_MARK_MAX_LENGTH ||
    after.content.length > WORD_MARK_MAX_LENGTH
  )
    return
  const parts = diffWordsWithSpace(before.content, after.content)
  const kept = parts
    .filter((part) => !part.added && !part.removed)
    .reduce((sum, part) => sum + part.value.length, 0)
  const longest = Math.max(before.content.length, after.content.length, 1)
  if (kept / longest < WORD_MARK_SIMILARITY) return
  let oldAt = 0
  let newAt = 0
  for (const part of parts) {
    const length = part.value.length
    if (part.removed) {
      before.marks ??= []
      before.marks.push([oldAt, oldAt + length])
      oldAt += length
    } else if (part.added) {
      after.marks ??= []
      after.marks.push([newAt, newAt + length])
      newAt += length
    } else {
      oldAt += length
      newAt += length
    }
  }
}

function annotate(hunks: DiffHunk[]) {
  const changes: DiffChange[] = []
  let current: DiffChange | null = null
  let removed: DiffLine[] = []
  let added: DiffLine[] = []
  const close = () => {
    if (!current) return
    for (let i = 0; i < Math.min(removed.length, added.length); i++)
      markWords(removed[i], added[i])
    changes.push(current)
    current = null
    removed = []
    added = []
  }
  for (const hunk of hunks) {
    for (const line of hunk.lines) {
      if (line.kind === "context") {
        close()
        continue
      }
      current ??= { index: changes.length, removed: [], added: [] }
      line.change = current.index
      if (line.kind === "removed") {
        current.oldStart ??= line.oldNumber
        current.removed.push(line.content)
        removed.push(line)
      } else {
        current.newStart ??= line.newNumber
        current.added.push(line.content)
        added.push(line)
      }
    }
    close()
  }
  return changes
}

function languageOf(
  language: string | undefined,
  fileName: string | undefined
) {
  if (language) return language
  const extension = fileName?.match(/\.([a-z0-9]+)$/i)?.[1]
  return extension?.toLowerCase()
}

const syntaxColors: Record<string, string> = {
  "#6a737d": "var(--syntax-comment)",
  "#586069": "var(--syntax-comment)",
  "#d73a49": "var(--syntax-keyword)",
  "#032f62": "var(--syntax-string)",
  "#005cc5": "var(--syntax-constant)",
  "#6f42c1": "var(--syntax-function)",
  "#e36209": "var(--syntax-variable)",
  "#22863a": "var(--syntax-tag)",
}

let syntaxTheme: ReturnType<typeof loadSyntaxTheme> | undefined

async function loadSyntaxTheme() {
  const { default: github } = await import("shiki/themes/github-light.mjs")
  return {
    name: "sortui-syntax",
    type: "light" as const,
    colors: {
      "editor.foreground": "var(--syntax-foreground)",
      "editor.background": "transparent",
    },
    tokenColors: github.tokenColors?.map((rule) => ({
      ...rule,
      settings: rule.settings.foreground
        ? {
            foreground:
              syntaxColors[rule.settings.foreground.toLowerCase()] ??
              "var(--syntax-foreground)",
          }
        : {},
    })),
  }
}

function useHighlight(hunks: DiffHunk[], language: string | undefined) {
  const { oldText, newText } = React.useMemo(() => {
    const lines = hunks.flatMap((hunk) => hunk.lines)
    const text = (side: "oldIndex" | "newIndex") =>
      lines
        .filter((line) => line[side] !== undefined)
        .map((line) => line.content)
        .join("\n")
    return { oldText: text("oldIndex"), newText: text("newIndex") }
  }, [hunks])
  const [highlighted, setHighlighted] = React.useState<{
    source: string
    tokens: NonNullable<DiffContextValue["tokens"]>
  } | null>(null)
  const source = React.useMemo(
    () => `${language}\0${oldText}\0${newText}`,
    [language, oldText, newText]
  )

  React.useEffect(() => {
    if (!language) return
    let cancelled = false
    import("shiki")
      .then(async ({ codeToTokens, bundledLanguages }) => {
        if (!(language in bundledLanguages)) return
        syntaxTheme ??= loadSyntaxTheme().catch((error: unknown) => {
          syntaxTheme = undefined
          throw error
        })
        const options = {
          lang: language as keyof typeof bundledLanguages,
          theme: await syntaxTheme,
        }
        const [old, next] = await Promise.all([
          codeToTokens(oldText, options),
          codeToTokens(newText, options),
        ])
        if (!cancelled)
          setHighlighted({
            source,
            tokens: { old: old.tokens, new: next.tokens },
          })
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [source, oldText, newText, language])

  return highlighted?.source === source ? highlighted.tokens : null
}

function Diff({
  patch,
  oldValue,
  newValue,
  fileName,
  language,
  view = "unified",
  lineNumbers = "both",
  contextLines = 3,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  /** A unified diff; its first file is shown. */
  patch?: string
  /** The two versions of the file, diffed here (when there is no `patch`). */
  oldValue?: string
  newValue?: string
  /** Picks the language from its extension when `language` is not set. */
  fileName?: string
  /** A Shiki language id, e.g. "ts", "tsx", "css". */
  language?: string
  view?: "unified" | "split"
  /**
   * In the unified view, the old and the new line number side by side
   * ("both") or one column ("single": a removed line's old number, every
   * other line's new one). Split shows one per side either way.
   */
  lineNumbers?: "both" | "single"
  /**
   * Unchanged lines kept around each change. With two values the rest fold
   * into rows that open them; a patch carries only what it has.
   */
  contextLines?: number
}) {
  const parsed = React.useMemo(() => {
    if (patch !== undefined) {
      try {
        return parsePatch(patch)[0]
      } catch {
        return undefined
      }
    }
    return structuredPatch(
      fileName ?? "",
      fileName ?? "",
      oldValue ?? "",
      newValue ?? "",
      undefined,
      undefined,
      { context: Number.MAX_SAFE_INTEGER }
    )
  }, [patch, oldValue, newValue, fileName])

  const { hunks, changes, added, removed } = React.useMemo(() => {
    const hunks = toHunks(parsed?.hunks ?? [])
    const lines = hunks.flatMap((hunk) => hunk.lines)
    return {
      hunks,
      changes: annotate(hunks),
      added: lines.filter((line) => line.kind === "added").length,
      removed: lines.filter((line) => line.kind === "removed").length,
    }
  }, [parsed])
  const foldable = patch === undefined
  const patchFileName = [parsed?.newFileName, parsed?.oldFileName]
    .find((name) => name && name !== "/dev/null")
    ?.replace(/^[ab]\//, "")
  const tokens = useHighlight(
    hunks,
    languageOf(language, fileName ?? patchFileName)
  )

  const value = React.useMemo(
    () => ({
      hunks,
      changes,
      foldable,
      contextLines,
      view,
      lineNumbers,
      tokens,
      added,
      removed,
    }),
    [
      hunks,
      changes,
      foldable,
      contextLines,
      view,
      lineNumbers,
      tokens,
      added,
      removed,
    ]
  )

  return (
    <DiffContext.Provider value={value}>
      <div
        data-slot="diff"
        data-view={view}
        className={cn(
          "flex min-w-0 flex-col overflow-hidden rounded-2xl bg-card text-sm text-card-foreground shadow-(--shadow-card) ring-1 ring-border",
          className
        )}
        {...props}
      />
    </DiffContext.Provider>
  )
}

function DiffHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="diff-header"
      className={cn(
        "flex min-w-0 items-center gap-2 border-b px-3 py-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&>svg]:text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function DiffTitle({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="diff-title"
      className={cn("min-w-0 truncate font-mono", className)}
      {...props}
    />
  )
}

function DiffStats({ className, ...props }: React.ComponentProps<"span">) {
  const { added, removed } = useDiff()
  return (
    <span
      data-slot="diff-stats"
      className={cn("ml-auto flex shrink-0 gap-2 font-mono", className)}
      {...props}
    >
      <span className="text-green-700 dark:text-green-200">
        +{added}
        <span className="sr-only"> lines added</span>
      </span>
      <span className="text-destructive-foreground">
        −{removed}
        <span className="sr-only"> lines removed</span>
      </span>
    </span>
  )
}

type CodeRow = {
  key: string
  kind: DiffLineKind
  numbers: (number | undefined)[]
  content: string
  tokens?: Token[]
  marks?: [number, number][]
}

type PaneRow =
  | CodeRow
  | { key: string; kind: "hunk"; header: string }
  | { key: string; kind: "empty" }
  | { key: string; kind: "folded"; id: string; count: number; mirror?: boolean }
  | { key: string; kind: "actions"; node?: React.ReactNode }

const rowHeight = {
  context: "h-5",
  added: "h-5",
  removed: "h-5",
  empty: "h-5",
  hunk: "h-5",
  folded: "h-7",
  actions: "h-8",
} as const

const rowTint = {
  context: "",
  added: "bg-syntax-added",
  removed: "bg-syntax-removed",
  empty: "bg-fill-1",
  hunk: "bg-fill-1 text-muted-foreground",
  folded: "bg-fill-1 text-muted-foreground",
  actions: "",
} as const

const numberColor = {
  context: "text-muted-foreground",
  added: "text-green-700 dark:text-green-200",
  removed: "text-destructive-foreground",
} as const

const wordMark = {
  context: "",
  added: "bg-syntax-added-word",
  removed: "bg-syntax-removed-word",
} as const

const rowRule = {
  added: "before:bg-green-600",
  removed:
    "before:bg-[repeating-linear-gradient(-45deg,var(--color-red-500)_0_2px,transparent_2px_4px)]",
} as const

function Code({ row }: { row: CodeRow }) {
  const pieces: Token[] = row.tokens ?? [{ content: row.content }]
  const marks = row.marks ?? []
  const out: (Token & { marked: boolean })[] = []
  let at = 0
  for (const piece of pieces) {
    let start = 0
    while (start < piece.content.length) {
      const position = at + start
      const mark = marks.find(([from, to]) => position >= from && position < to)
      const next = mark
        ? mark[1]
        : Math.min(
            ...marks.map(([from]) => from).filter((from) => from > position),
            Infinity
          )
      const end = Math.min(piece.content.length, next - at)
      out.push({
        content: piece.content.slice(start, end),
        color: piece.color,
        marked: !!mark,
      })
      start = end
    }
    at += piece.content.length
  }
  return out.map((piece, index) => (
    <span
      key={index}
      style={{ color: piece.color }}
      className={piece.marked ? wordMark[row.kind] : undefined}
    >
      {piece.content}
    </span>
  ))
}

function indentOf(content: string) {
  let columns = 0
  for (const char of content) {
    if (char === " ") columns += 1
    else if (char === "\t") columns += 2
    else return columns
  }
  return -1
}

function indentUnit(hunks: DiffHunk[]) {
  let unit = Infinity
  for (const hunk of hunks)
    for (const line of hunk.lines) {
      if (line.content.trimStart().startsWith("*")) continue
      const indent = indentOf(line.content)
      if (indent > 0) unit = Math.min(unit, indent)
    }
  return Number.isFinite(unit) ? unit : 2
}

function guideLevels(rows: PaneRow[], unit: number) {
  const levels = rows.map((row) =>
    "content" in row ? Math.floor(indentOf(row.content) / unit) : -1
  )
  return rows.map((row, index) => {
    if (!("content" in row) || levels[index] >= 0)
      return Math.max(levels[index], 0)
    let before = 0
    for (let i = index - 1; i >= 0; i--)
      if (levels[i] >= 0) {
        before = levels[i]
        break
      }
    let after = 0
    for (let i = index + 1; i < rows.length; i++)
      if (levels[i] >= 0) {
        after = levels[i]
        break
      }
    return Math.min(before, after)
  })
}

function Pane({
  rows,
  columns,
  unit,
  onUnfold,
}: {
  rows: PaneRow[]
  columns: number
  unit: number
  onUnfold: (id: string) => void
}) {
  const guides = guideLevels(rows, unit)
  return (
    <div data-slot="diff-pane" className="flex min-w-0">
      <div
        aria-hidden
        className="grid shrink-0 border-r"
        style={{ gridTemplateColumns: `repeat(${columns}, auto)` }}
      >
        {rows.map((row) => {
          const kind = row.kind
          return (
            <div
              key={row.key}
              onClick={kind === "folded" ? () => onUnfold(row.id) : undefined}
              className={cn(
                "relative col-span-full grid grid-cols-subgrid items-center",
                rowHeight[kind],
                rowTint[kind],
                kind === "folded" && "cursor-pointer",
                (kind === "added" || kind === "removed") &&
                  cn(
                    "before:absolute before:inset-y-0 before:left-0 before:w-0.75",
                    rowRule[kind]
                  )
              )}
            >
              {Array.from({ length: columns }, (_, column) => (
                <span
                  key={column}
                  className={cn(
                    "flex min-w-8 justify-end px-2 tabular-nums",
                    "numbers" in row
                      ? numberColor[row.kind]
                      : "text-muted-foreground"
                  )}
                >
                  {"numbers" in row ? (
                    row.numbers[column]
                  ) : kind === "hunk" && column === 0 ? (
                    "⋯"
                  ) : kind === "folded" && column === 0 ? (
                    <UnfoldVerticalIcon className="size-3.5" />
                  ) : null}
                </span>
              ))}
            </div>
          )
        })}
      </div>
      <div className="min-w-0 flex-1 overflow-x-auto">
        <div className="w-max min-w-full">
          {rows.map((row, index) => (
            <div
              key={row.key}
              className={cn(
                "flex items-center pr-4 whitespace-pre",
                rowHeight[row.kind],
                rowTint[row.kind]
              )}
            >
              {row.kind === "hunk" ? (
                <span className="pl-2">{row.header}</span>
              ) : row.kind === "folded" ? (
                <button
                  type="button"
                  aria-hidden={row.mirror || undefined}
                  tabIndex={row.mirror ? -1 : undefined}
                  onClick={(event) => {
                    if (event.currentTarget.matches(":focus"))
                      event.currentTarget
                        .closest<HTMLElement>("[data-slot=diff-content]")
                        ?.focus({ preventScroll: true })
                    onUnfold(row.id)
                  }}
                  className="sticky left-0 ml-2 rounded-sm px-0.5 font-sans text-2xs outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/30"
                >
                  Show {row.count} unchanged{" "}
                  {row.count === 1 ? "line" : "lines"}
                </button>
              ) : row.kind === "actions" ? (
                row.node !== undefined ? (
                  <div
                    data-slot="diff-change-actions"
                    className="sticky left-0 flex items-center gap-1 pl-6.5 font-sans"
                  >
                    {row.node}
                  </div>
                ) : null
              ) : row.kind === "empty" ? null : (
                <>
                  <span
                    aria-hidden
                    className={cn("w-4.5 shrink-0 pl-2", numberColor[row.kind])}
                  >
                    {row.kind === "added"
                      ? "+"
                      : row.kind === "removed"
                        ? "-"
                        : " "}
                  </span>
                  {row.kind !== "context" && (
                    <span className="sr-only">
                      {row.kind === "added" ? "Added: " : "Removed: "}
                    </span>
                  )}
                  <span className="relative self-stretch pl-2 leading-5 [tab-size:2]">
                    {Array.from({ length: guides[index] }, (_, level) => (
                      <span
                        key={level}
                        aria-hidden
                        className="absolute inset-y-0 border-l border-border"
                        style={{
                          left: `calc(var(--spacing) * 2 + ${level * unit}ch)`,
                        }}
                      />
                    ))}
                    <Code row={row} />
                  </span>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

type Item =
  | { type: "line"; line: DiffLine }
  | { type: "hunk"; id: string; header: string }
  | { type: "folded"; id: string; count: number }

function lineKey(line: DiffLine) {
  return `l:${line.oldIndex ?? ""}:${line.newIndex ?? ""}`
}

function foldLines(
  hunks: DiffHunk[],
  foldable: boolean,
  contextLines: number,
  unfolded: ReadonlySet<string>
) {
  const items: Item[] = []
  hunks.forEach((hunk, h) => {
    if (h > 0) items.push({ type: "hunk", id: String(h), header: hunk.header })
    const lines = hunk.lines
    for (let i = 0; i < lines.length;) {
      if (lines[i].kind !== "context" || !foldable) {
        items.push({ type: "line", line: lines[i++] })
        continue
      }
      let j = i
      while (j < lines.length && lines[j].kind === "context") j++
      const run = lines.slice(i, j)
      const id = `${h}:${i}`
      const keepStart = i === 0 ? 0 : contextLines
      const keepEnd = j === lines.length ? 0 : contextLines
      const hidden = run.length - keepStart - keepEnd
      if (hidden > 1 && !unfolded.has(id)) {
        for (const line of run.slice(0, keepStart))
          items.push({ type: "line", line })
        items.push({ type: "folded", id, count: hidden })
        for (const line of run.slice(run.length - keepEnd))
          items.push({ type: "line", line })
      } else {
        for (const line of run) items.push({ type: "line", line })
      }
      i = j
    }
  })
  return items
}

const noIds: ReadonlySet<string> = new Set()

function DiffContent({
  renderChangeActions,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  /**
   * Controls shown under each change, e.g. accept / reject buttons for an
   * edit an agent proposes. Receives the change: its index, where it starts,
   * the removed and the added lines.
   */
  renderChangeActions?: (change: DiffChange) => React.ReactNode
}) {
  const { hunks, changes, foldable, contextLines, view, lineNumbers, tokens } =
    useDiff()
  const [opened, setOpened] = React.useState<{
    hunks: DiffHunk[]
    ids: Set<string>
  }>(() => ({ hunks, ids: new Set() }))
  const unfolded = opened.hunks === hunks ? opened.ids : noIds
  const onUnfold = (id: string) =>
    setOpened((current) => ({
      hunks,
      ids: new Set(current.hunks === hunks ? current.ids : []).add(id),
    }))
  const unit = React.useMemo(() => indentUnit(hunks), [hunks])
  const items = React.useMemo(
    () => foldLines(hunks, foldable, contextLines, unfolded),
    [hunks, foldable, contextLines, unfolded]
  )

  const codeRow = (
    line: DiffLine,
    numbers: (number | undefined)[]
  ): CodeRow => ({
    key: lineKey(line),
    kind: line.kind,
    numbers,
    content: line.content,
    marks: line.marks,
    tokens:
      line.kind === "removed"
        ? line.oldIndex !== undefined
          ? tokens?.old[line.oldIndex]
          : undefined
        : line.newIndex !== undefined
          ? tokens?.new[line.newIndex]
          : undefined,
  })
  const actionsAfter = (index: number) => {
    const item = items[index]
    if (item.type !== "line" || item.line.change === undefined) return undefined
    const next = items[index + 1]
    if (next?.type === "line" && next.line.change === item.line.change)
      return undefined
    const change = changes[item.line.change]
    const node = renderChangeActions?.(change)
    if (node == null || typeof node === "boolean") return undefined
    return { key: `a:${change.index}`, node }
  }
  const pane = (rows: PaneRow[], columns: number) => (
    <Pane rows={rows} columns={columns} unit={unit} onUnfold={onUnfold} />
  )

  if (view === "split") {
    const left: PaneRow[] = []
    const right: PaneRow[] = []
    let removed: DiffLine[] = []
    let added: DiffLine[] = []
    const flush = () => {
      for (let i = 0; i < Math.max(removed.length, added.length); i++) {
        const before = removed[i]
        const after = added[i]
        left.push(
          before
            ? codeRow(before, [before.oldNumber])
            : { key: `e:${lineKey(after)}`, kind: "empty" }
        )
        right.push(
          after
            ? codeRow(after, [after.newNumber])
            : { key: `e:${lineKey(before)}`, kind: "empty" }
        )
      }
      removed = []
      added = []
    }
    items.forEach((item, index) => {
      if (item.type === "line" && item.line.kind === "removed") {
        if (added.length) flush()
        removed.push(item.line)
      } else if (item.type === "line" && item.line.kind === "added") {
        added.push(item.line)
      } else {
        flush()
        if (item.type === "line") {
          left.push(codeRow(item.line, [item.line.oldNumber]))
          right.push(codeRow(item.line, [item.line.newNumber]))
        } else {
          const row: PaneRow =
            item.type === "hunk"
              ? { key: `h:${item.id}`, kind: "hunk", header: item.header }
              : {
                  key: `f:${item.id}`,
                  kind: "folded",
                  id: item.id,
                  count: item.count,
                }
          left.push(row.kind === "folded" ? { ...row, mirror: true } : row)
          right.push(row)
        }
      }
      const actions = actionsAfter(index)
      if (actions) {
        flush()
        left.push({ key: actions.key, kind: "actions" })
        right.push({ kind: "actions", ...actions })
      }
    })
    flush()
    return (
      <div
        data-slot="diff-content"
        tabIndex={-1}
        className={cn(
          "grid grid-cols-2 divide-x py-1 font-mono outline-none",
          className
        )}
        {...props}
      >
        {pane(left, 1)}
        {pane(right, 1)}
      </div>
    )
  }

  const rows: PaneRow[] = []
  items.forEach((item, index) => {
    if (item.type === "hunk")
      rows.push({ key: `h:${item.id}`, kind: "hunk", header: item.header })
    else if (item.type === "folded")
      rows.push({
        key: `f:${item.id}`,
        kind: "folded",
        id: item.id,
        count: item.count,
      })
    else
      rows.push(
        codeRow(
          item.line,
          lineNumbers === "single"
            ? [
                item.line.kind === "removed"
                  ? item.line.oldNumber
                  : item.line.newNumber,
              ]
            : [item.line.oldNumber, item.line.newNumber]
        )
      )
    const actions = actionsAfter(index)
    if (actions) rows.push({ kind: "actions", ...actions })
  })
  return (
    <div
      data-slot="diff-content"
      tabIndex={-1}
      className={cn("py-1 font-mono outline-none", className)}
      {...props}
    >
      {pane(rows, lineNumbers === "single" ? 1 : 2)}
    </div>
  )
}

export { Diff, DiffHeader, DiffTitle, DiffStats, DiffContent, type DiffChange }
