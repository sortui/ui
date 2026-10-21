"use client"

import * as React from "react"
import {
  ArrowUpIcon,
  MaximizeIcon,
  AudioLinesIcon,
  MinimizeIcon,
  SquareIcon,
  XIcon,
} from "lucide-react"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

const EXPAND_FROM_LINE = 5
const WAVEFORM_BARS = 64
const LOUD_BAR_HEIGHT = 8
const WAVEFORM_INTERVAL = 60
const MIN_TRANSCRIBING_TIME = 2000

type AIChatComposerContextValue = {
  rootRef: React.RefObject<HTMLDivElement | null>
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  multiline: boolean
  setMultiline: (multiline: boolean) => void
  maximized: boolean
  setMaximized: (maximized: boolean) => void
  setEmpty: (empty: boolean) => void
  dictation: Dictation
}

const AIChatComposerContext =
  React.createContext<AIChatComposerContextValue | null>(null)

function useAIChatComposer() {
  const context = React.useContext(AIChatComposerContext)
  if (!context) {
    throw new Error("AIChatComposer parts must be used within AIChatComposer.")
  }
  return context
}

function assignRefs<T>(node: T | null, refs: (React.Ref<T> | undefined)[]) {
  const cleanups = refs.map((ref) => {
    if (typeof ref === "function") {
      const cleanup = ref(node)
      return typeof cleanup === "function" ? cleanup : () => ref(null)
    }
    if (ref) ref.current = node
    return () => {
      if (ref) ref.current = null
    }
  })
  return () => cleanups.forEach((cleanup) => cleanup())
}

function isSubmitButton(
  element: Element
): element is HTMLButtonElement | HTMLInputElement {
  return (
    (element instanceof HTMLButtonElement ||
      element instanceof HTMLInputElement) &&
    (element.type === "submit" || element.type === "image")
  )
}

function submitForm(form: HTMLFormElement) {
  const button = Array.from(form.elements).find(isSubmitButton)
  if (button?.matches(":disabled, [aria-disabled='true']")) return
  form.requestSubmit(button)
}

function insertText(
  textarea: HTMLTextAreaElement,
  text: string,
  start = textarea.selectionStart,
  end = textarea.selectionEnd
) {
  const before = textarea.value.slice(0, start)
  const after = textarea.value.slice(end)
  const lead = before === "" || /\s$/.test(before) ? "" : " "
  const trail = /^\s/.test(after) ? "" : " "
  textarea.focus()
  textarea.setRangeText(lead + text + trail, start, end, "end")
  textarea.dispatchEvent(new Event("input", { bubbles: true }))
}

/** Inserts a token (such as "/release-notes") at the caret of a textarea. */
function insertAIChatComposerToken(
  textarea: HTMLTextAreaElement | null,
  token: string
) {
  if (textarea) insertText(textarea, token)
}

function availableHeight(element: HTMLElement) {
  for (let node = element.parentElement; node; node = node.parentElement) {
    if (node === document.body || node === document.documentElement) break
    const style = getComputedStyle(node)
    if (style.overflowY === "visible") continue
    return Math.min(
      node.clientHeight -
        parseFloat(style.paddingTop) -
        parseFloat(style.paddingBottom),
      window.innerHeight
    )
  }
  return window.innerHeight
}

type SpeechRecognitionInstance = {
  continuous: boolean
  interimResults: boolean
  lang: string
  processLocally?: boolean
  onerror: ((event: { error: string }) => void) | null
  onresult:
    | ((event: {
        results: ArrayLike<ArrayLike<{ transcript: string }>>
      }) => void)
    | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

type SpeechRecognitionConstructor = (new () => SpeechRecognitionInstance) & {
  available?: (options: {
    langs: string[]
    processLocally: boolean
  }) => Promise<string>
}

function getSpeechRecognition(): SpeechRecognitionConstructor | undefined {
  if (typeof window === "undefined") return undefined
  const scope = window as unknown as Record<string, unknown>
  return (scope.SpeechRecognition ?? scope.webkitSpeechRecognition) as
    SpeechRecognitionConstructor | undefined
}

function subscribeNever() {
  return () => {}
}

async function hasOnDeviceModel(
  Recognition: SpeechRecognitionConstructor,
  lang: string
) {
  try {
    const status = await Recognition.available?.({
      langs: [lang],
      processLocally: true,
    })
    return status === "available"
  } catch {
    return false
  }
}

type AIChatComposerDictationErrorCode =
  | "microphone-blocked"
  | "insecure-context"
  | "no-microphone"
  | "microphone-busy"
  | "recognition-blocked"
  | "recognition-unreachable"
  | "language-not-supported"
  | "unknown"

const dictationErrorMessages: Record<AIChatComposerDictationErrorCode, string> =
  {
    "microphone-blocked":
      "Microphone access is blocked. Allow it for this site in the browser's settings, and for the browser in the system's privacy settings.",
    "insecure-context": "Microphone access needs a secure (https) page.",
    "no-microphone": "No microphone was found.",
    "microphone-busy": "The microphone is in use by another app.",
    "recognition-blocked":
      "Speech recognition is blocked or turned off in this browser.",
    "recognition-unreachable":
      "Speech recognition could not reach its service. Chrome needs a connection to Google; Arc, Brave and other Chromium browsers have no access to it.",
    "language-not-supported":
      "Speech recognition does not support this language.",
    unknown: "Dictation stopped unexpectedly.",
  }

/** Why dictation could not start or produce text. `code` is stable; `message` is English. */
class AIChatComposerDictationError extends Error {
  code: AIChatComposerDictationErrorCode

  constructor(code: AIChatComposerDictationErrorCode, cause?: unknown) {
    super(dictationErrorMessages[code], { cause })
    this.name = "AIChatComposerDictationError"
    this.code = code
  }
}

const dictationErrorCodes: Record<string, AIChatComposerDictationErrorCode> = {
  NotAllowedError: "microphone-blocked",
  SecurityError: "insecure-context",
  NotFoundError: "no-microphone",
  NotReadableError: "microphone-busy",
  "audio-capture": "no-microphone",
  "not-allowed": "recognition-blocked",
  "service-not-allowed": "recognition-blocked",
  network: "recognition-unreachable",
  "language-not-supported": "language-not-supported",
}

function toDictationError(reason: unknown) {
  const name =
    reason instanceof DOMException || reason instanceof Error
      ? reason.name
      : String(reason)
  return new AIChatComposerDictationError(
    dictationErrorCodes[name] ?? "unknown",
    reason
  )
}

type DictationState = "idle" | "recording" | "transcribing"

type DictationOptions = {
  transcribe?: (audio: Blob) => Promise<string>
  lang?: string
  onError?: (error: AIChatComposerDictationError) => void
}

type Dictation = {
  state: DictationState
  configure: (options: DictationOptions) => void
  start: () => void
  stop: () => void
  send: () => void
  cancel: () => void
}

type DictationSession = {
  stream: MediaStream
  audioContext: AudioContext
  frame: number
  range: [number, number]
  recorder?: MediaRecorder
  chunks: Blob[]
  recognition?: SpeechRecognitionInstance
  recognitionEnded?: Promise<void>
  transcript: string
  error?: unknown
}

function useDictation(
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
) {
  const [state, setState] = React.useState<DictationState>("idle")
  const [levels, setLevels] = React.useState<number[]>(() =>
    Array(WAVEFORM_BARS).fill(0)
  )
  const options = React.useRef<DictationOptions>({})
  const session = React.useRef<DictationSession | null>(null)
  const generation = React.useRef(0)
  const starting = React.useRef(false)
  const sendWhenDone = React.useRef(false)

  const release = React.useCallback((target: DictationSession | null) => {
    if (!target || session.current !== target) return
    session.current = null
    cancelAnimationFrame(target.frame)
    target.stream.getTracks().forEach((track) => track.stop())
    void target.audioContext.close()
  }, [])

  React.useEffect(
    () => () => {
      generation.current++
      session.current?.recognition?.abort()
      release(session.current)
    },
    [release]
  )

  const reportError = React.useCallback((reason: unknown) => {
    options.current.onError?.(toDictationError(reason))
  }, [])

  const start = React.useCallback(async () => {
    if (session.current || starting.current) return
    starting.current = true
    const id = generation.current
    const textarea = textareaRef.current
    const end = textarea?.value.length ?? 0
    const range: [number, number] =
      textarea && document.activeElement === textarea
        ? [textarea.selectionStart, textarea.selectionEnd]
        : [end, end]
    const { transcribe, lang = navigator.language } = options.current
    const Recognition = transcribe ? undefined : getSpeechRecognition()
    let stream: MediaStream | undefined
    let audioContext: AudioContext | undefined
    try {
      const onDevice = Recognition
        ? await hasOnDeviceModel(Recognition, lang)
        : false
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: true,
        },
      })
      if (id !== generation.current) {
        stream.getTracks().forEach((track) => track.stop())
        return
      }

      audioContext = new AudioContext()
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 512
      audioContext.createMediaStreamSource(stream).connect(analyser)
      const samples = new Uint8Array(analyser.fftSize)

      const current: DictationSession = {
        stream,
        audioContext,
        frame: 0,
        range,
        chunks: [],
        transcript: "",
      }
      session.current = current

      let lastSample = 0
      const sample = (time: number) => {
        current.frame = requestAnimationFrame(sample)
        if (time - lastSample < WAVEFORM_INTERVAL) return
        lastSample = time
        analyser.getByteTimeDomainData(samples)
        let sum = 0
        for (const value of samples) sum += ((value - 128) / 128) ** 2
        const level = Math.min(1, Math.sqrt(sum / samples.length) * 4)
        setLevels((previous) => [...previous.slice(1), level])
      }
      current.frame = requestAnimationFrame(sample)

      if (transcribe) {
        const recorder = new MediaRecorder(stream)
        recorder.ondataavailable = (event) => current.chunks.push(event.data)
        recorder.start()
        current.recorder = recorder
      } else if (Recognition) {
        const recognition = new Recognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = lang
        if (onDevice) recognition.processLocally = true
        recognition.onerror = (event) => {
          if (event.error !== "no-speech" && event.error !== "aborted") {
            current.error = event.error
          }
        }
        recognition.onresult = (event) => {
          current.transcript = Array.from(event.results)
            .map((result) => result[0].transcript)
            .join("")
        }
        current.recognitionEnded = new Promise((resolve) => {
          recognition.onend = () => resolve()
        })
        recognition.start()
        current.recognition = recognition
      }

      setLevels(Array(WAVEFORM_BARS).fill(0))
      setState("recording")
    } catch (reason) {
      if (session.current) {
        release(session.current)
      } else {
        stream?.getTracks().forEach((track) => track.stop())
        void audioContext?.close()
      }
      setState("idle")
      reportError(reason)
    } finally {
      starting.current = false
    }
  }, [release, reportError, textareaRef])

  const stop = React.useCallback(async () => {
    const current = session.current
    if (!current) return
    const id = generation.current
    const shownAt = Date.now()
    setState("transcribing")

    let words = ""
    try {
      const { transcribe } = options.current
      if (current.recorder && transcribe) {
        const recorder = current.recorder
        const stopped = new Promise((resolve) => {
          recorder.onstop = resolve
        })
        recorder.stop()
        await stopped
        release(current)
        words = await transcribe(
          new Blob(current.chunks, { type: recorder.mimeType })
        )
      } else if (current.recognition) {
        current.recognition.stop()
        await current.recognitionEnded
        words = current.transcript
      }
    } catch (reason) {
      current.error ??= reason ?? "unknown"
    } finally {
      release(current)
    }

    const remaining = MIN_TRANSCRIBING_TIME - (Date.now() - shownAt)
    if (remaining > 0) {
      await new Promise((resolve) => setTimeout(resolve, remaining))
    }
    if (id !== generation.current) return

    words = words.trim()
    const textarea = textareaRef.current
    if (words && textarea) insertText(textarea, words, ...current.range)
    else if (!words && current.error) reportError(current.error)
    setState("idle")

    if (sendWhenDone.current) {
      sendWhenDone.current = false
      if (words && !current.error && textarea?.form) submitForm(textarea.form)
    }
  }, [release, reportError, textareaRef])

  const send = React.useCallback(() => {
    sendWhenDone.current = true
    if (state === "recording") void stop()
  }, [state, stop])

  const cancel = React.useCallback(() => {
    generation.current++
    sendWhenDone.current = false
    const current = session.current
    if (current?.recorder?.state === "recording") current.recorder.stop()
    current?.recognition?.abort()
    release(current)
    setState("idle")
  }, [release])

  const configure = React.useCallback((next: DictationOptions) => {
    options.current = next
  }, [])

  const dictation = React.useMemo<Dictation>(
    () => ({
      state,
      configure,
      start: () => void start(),
      stop: () => void stop(),
      send,
      cancel,
    }),
    [state, configure, start, stop, send, cancel]
  )

  return { dictation, levels }
}

function AIChatComposer({
  className,
  style,
  children,
  ref,
  ...props
}: React.ComponentProps<"div">) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const stopRef = React.useRef<HTMLButtonElement>(null)
  const [multiline, setMultilineState] = React.useState(false)
  const [maximized, setMaximizedState] = React.useState(false)
  const [maxHeight, setMaxHeight] = React.useState<number>()
  const [empty, setEmpty] = React.useState(true)
  const { dictation, levels } = useDictation(textareaRef)
  const dictating = dictation.state !== "idle"
  const wasDictating = React.useRef(false)

  const mergedRef = React.useCallback(
    (node: HTMLDivElement | null) => assignRefs(node, [rootRef, ref]),
    [ref]
  )

  const setMultiline = React.useCallback((next: boolean) => {
    setMultilineState(next)
    if (!next) setMaximizedState(false)
  }, [])

  const setMaximized = React.useCallback((next: boolean) => {
    if (next && rootRef.current) {
      setMaxHeight(availableHeight(rootRef.current))
    }
    setMaximizedState(next)
  }, [])

  React.useEffect(() => {
    if (!maximized) return
    const measure = () => {
      if (rootRef.current) setMaxHeight(availableHeight(rootRef.current))
    }
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [maximized])

  React.useLayoutEffect(() => {
    if (dictating === wasDictating.current) return
    wasDictating.current = dictating
    const focused = document.activeElement
    const fallen = !focused || focused === document.body
    if (!dictating) {
      if (fallen) textareaRef.current?.focus({ preventScroll: true })
      return
    }
    const hidden =
      !!focused &&
      !!rootRef.current?.contains(focused) &&
      focused.getClientRects().length === 0
    if (fallen || hidden) stopRef.current?.focus({ preventScroll: true })
  }, [dictating])

  const context = React.useMemo<AIChatComposerContextValue>(
    () => ({
      rootRef,
      textareaRef,
      multiline,
      setMultiline,
      maximized,
      setMaximized,
      setEmpty,
      dictation,
    }),
    [multiline, setMultiline, maximized, setMaximized, dictation]
  )

  return (
    <AIChatComposerContext.Provider value={context}>
      <div
        ref={mergedRef}
        data-slot="ai-chat-composer"
        data-multiline={multiline}
        data-maximized={maximized}
        data-empty={empty}
        data-dictating={dictating}
        style={
          maxHeight === undefined
            ? style
            : ({
                "--ai-chat-composer-max-height": `${maxHeight}px`,
                ...style,
              } as React.CSSProperties)
        }
        className={cn(
          "group/ai-chat-composer relative grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center rounded-3xl bg-popover text-xs text-popover-foreground shadow-[0_-1px_0_oklch(1_0_0/20%),0_4px_16px_-4px_oklch(0.371_0_0/0.02),0_0_10px_oklch(0.371_0_0/0.03)] ring-1 ring-field-border [grid-template-areas:'leading_input_trailing'] has-data-measuring:invisible has-data-[slot=ai-chat-composer-header]:[grid-template-areas:'header_header_header'_'input_input_input'_'leading_._trailing'] has-[[data-slot=ai-chat-composer-leading]>[data-slot=badge]]:[grid-template-areas:'header_header_header'_'input_input_input'_'leading_._trailing'] data-[dictating=true]:data-[empty=false]:[grid-template-areas:'header_header_header'_'input_input_input'_'record_record_record'] data-[dictating=true]:data-[empty=true]:[grid-template-areas:'header_header_header'_'record_record_record'] data-[maximized=true]:h-[min(var(--ai-chat-composer-max-height,100dvh),--spacing(160))] data-[maximized=true]:grid-rows-[auto_minmax(0,1fr)_auto] data-[multiline=true]:[grid-template-areas:'header_header_header'_'input_input_input'_'leading_._trailing']",
          className
        )}
        {...props}
      >
        {children}
        {dictating && (
          <DictationBar
            dictation={dictation}
            levels={levels}
            stopRef={stopRef}
          />
        )}
      </div>
    </AIChatComposerContext.Provider>
  )
}

function DictationBar({
  dictation,
  levels,
  stopRef,
}: {
  dictation: Dictation
  levels: number[]
  stopRef: React.Ref<HTMLButtonElement>
}) {
  const transcribing = dictation.state === "transcribing"
  return (
    <div
      data-slot="ai-chat-composer-dictation"
      className="flex min-w-0 items-center [grid-area:record]"
    >
      <div className="py-1.5 pl-1.5 [&>button]:rounded-full">
        <Button
          type="button"
          variant="secondary"
          size="icon-sm"
          aria-label="Cancel dictation"
          onClick={dictation.cancel}
        >
          <XIcon />
        </Button>
      </div>
      {transcribing ? (
        <div
          role="status"
          className="flex h-7 min-w-0 flex-1 items-center justify-center px-1.5 text-2xs text-muted-foreground"
        >
          Transcribing…
        </div>
      ) : (
        <div
          aria-hidden
          className="flex h-7 min-w-0 flex-1 items-center justify-between px-1.5"
        >
          {levels.map((level, index) => {
            const height = 2 + Math.round(level * 14)
            return (
              <span
                key={index}
                className={cn(
                  "w-0.5 shrink-0 rounded-[1px]",
                  height >= LOUD_BAR_HEIGHT
                    ? "bg-foreground/30"
                    : "bg-foreground/15"
                )}
                style={{ height }}
              />
            )
          })}
        </div>
      )}
      <div className="flex items-center gap-1 py-1.5 pr-1.5 [&>button]:rounded-full">
        <Button
          ref={stopRef}
          type="button"
          variant="secondary"
          size="icon-sm"
          aria-label="Stop dictation"
          aria-disabled={transcribing || undefined}
          onClick={() => {
            if (!transcribing) dictation.stop()
          }}
        >
          {transcribing ? <Spinner /> : <SquareIcon />}
        </Button>
        <Button
          type="button"
          size="icon-sm"
          aria-label="Send"
          onClick={dictation.send}
        >
          <ArrowUpIcon />
        </Button>
      </div>
    </div>
  )
}

/** Content above the text, such as attachments. Rendering it opens the composer. */
function AIChatComposerHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="ai-chat-composer-header"
      className={cn(
        "flex min-w-0 flex-wrap items-center gap-2 p-2 [grid-area:header]",
        className
      )}
      {...props}
    />
  )
}

type AIChatComposerCommand = {
  /** Inserted as "/" + value, and matched against the typed filter. */
  value: string
  label?: React.ReactNode
  icon?: React.ReactNode
  /** Consecutive commands with the same group are shown under its label. */
  group?: string
  /** Shown next to the menu while the command is highlighted. */
  description?: React.ReactNode
  /** Runs instead of inserting a token; the typed "/…" is removed. */
  onSelect?: () => void
}

const textBoxClassName =
  "group-data-[dictating=true]/ai-chat-composer:group-data-[empty=true]/ai-chat-composer:hidden group-data-[dictating=true]/ai-chat-composer:px-3 px-2 py-2.5 leading-5 [grid-area:input] group-has-data-[slot=ai-chat-composer-header]/ai-chat-composer:px-3 group-has-[[data-slot=ai-chat-composer-leading]>[data-slot=badge]]/ai-chat-composer:px-3 group-data-[multiline=true]/ai-chat-composer:px-3 data-fade-bottom:[mask-image:linear-gradient(to_bottom,transparent,black_var(--fade-top,0px),black_calc(100%_-_var(--fade-bottom,0px)),transparent)] data-fade-bottom:[--fade-bottom:--spacing(6)] data-fade-top:[mask-image:linear-gradient(to_bottom,transparent,black_var(--fade-top,0px),black_calc(100%_-_var(--fade-bottom,0px)),transparent)] data-fade-top:[--fade-top:--spacing(6)]"

const escapeRegExp = (text: string) =>
  text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

const findSlashCommand = (textBeforeCaret: string) =>
  /(^|\s)\/([^\s/]*)$/.exec(textBeforeCaret)

function useTokenPattern(
  tokens: string[] | undefined,
  commands: AIChatComposerCommand[] | undefined
) {
  return React.useMemo(() => {
    const all = new Set([
      ...(tokens ?? []),
      ...(commands ?? [])
        .filter((command) => !command.onSelect)
        .map((command) => "/" + command.value),
    ])
    if (all.size === 0) return null
    const alternatives = [...all]
      .sort((a, b) => b.length - a.length)
      .map(escapeRegExp)
      .join("|")
    return new RegExp(`(^|\\s)(${alternatives})(?=\\s|$)`, "g")
  }, [tokens, commands])
}

function removeTokenBeforeCaret(
  textarea: HTMLTextAreaElement,
  tokenPattern: RegExp
) {
  if (textarea.selectionStart !== textarea.selectionEnd) return false
  if (/\S/.test(textarea.value.charAt(textarea.selectionEnd))) return false
  const before = textarea.value.slice(0, textarea.selectionStart)
  const token = new RegExp(`(?:${tokenPattern.source})$`).exec(before)
  if (!token) return false
  textarea.setRangeText(
    "",
    before.length - token[2].length,
    before.length,
    "end"
  )
  textarea.dispatchEvent(new Event("input", { bubbles: true }))
  return true
}

function useTextareaLayout(
  textareaRef: React.RefObject<HTMLTextAreaElement | null>,
  overlayRef: React.RefObject<HTMLDivElement | null>,
  initialText: string
) {
  const { multiline, setMultiline, maximized, setEmpty } = useAIChatComposer()
  const [text, setText] = React.useState(initialText)
  const [long, setLong] = React.useState(false)
  const [measured, setMeasured] = React.useState(false)
  const [gutter, setGutter] = React.useState(0)
  const [scroll, setScroll] = React.useState({
    fadeTop: false,
    fadeBottom: false,
  })

  const measure = React.useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    if (overlayRef.current) overlayRef.current.scrollTop = textarea.scrollTop
    if (textarea.value !== text) setText(textarea.value)
    setEmpty(textarea.value === "")

    const style = getComputedStyle(textarea)
    const nextGutter = Math.max(
      0,
      textarea.offsetWidth -
        textarea.clientWidth -
        parseFloat(style.borderLeftWidth) -
        parseFloat(style.borderRightWidth)
    )
    if (nextGutter !== gutter) setGutter(nextGutter)

    const next = {
      fadeTop: textarea.scrollTop > 0,
      fadeBottom:
        textarea.scrollTop + textarea.clientHeight < textarea.scrollHeight - 1,
    }
    if (
      next.fadeTop !== scroll.fadeTop ||
      next.fadeBottom !== scroll.fadeBottom
    ) {
      setScroll(next)
    }

    if (textarea.value === "") {
      setLong(false)
      setMultiline(false)
      return
    }
    const lines = Math.round(
      (textarea.scrollHeight -
        parseFloat(style.paddingTop) -
        parseFloat(style.paddingBottom)) /
        parseFloat(style.lineHeight)
    )
    if (!multiline && (textarea.value.includes("\n") || lines > 1)) {
      setMultiline(true)
    }
    if (!maximized) setLong(lines >= EXPAND_FROM_LINE)
  }, [
    textareaRef,
    overlayRef,
    text,
    gutter,
    scroll,
    multiline,
    maximized,
    setMultiline,
    setEmpty,
  ])

  const measureRef = React.useRef(measure)
  React.useLayoutEffect(() => {
    measureRef.current = measure
    measure()
  })

  React.useLayoutEffect(() => setMeasured(true), [])

  React.useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    let active = true
    const remeasure = () => {
      if (active) measureRef.current()
    }
    const observer =
      typeof ResizeObserver === "undefined"
        ? undefined
        : new ResizeObserver(remeasure)
    observer?.observe(textarea)
    void document.fonts?.ready.then(remeasure)
    return () => {
      active = false
      observer?.disconnect()
    }
  }, [textareaRef])

  React.useEffect(() => {
    const form = textareaRef.current?.form
    if (!form) return
    const onReset = () => setTimeout(measure)
    form.addEventListener("reset", onReset)
    return () => form.removeEventListener("reset", onReset)
  }, [textareaRef, measure])

  const measuring = !measured && initialText !== ""

  return { text, long, measuring, scroll, gutter, measure }
}

function useSlashCommands(
  textareaRef: React.RefObject<HTMLTextAreaElement | null>,
  commands: AIChatComposerCommand[] | undefined
) {
  const [slash, setSlash] = React.useState<{
    start: number
    filter: string
  } | null>(null)
  const [dismissedAt, setDismissedAt] = React.useState<number | null>(null)
  const [highlighted, setHighlighted] = React.useState(0)

  const matches = React.useMemo(() => {
    if (!slash || !commands) return []
    const filter = slash.filter.toLowerCase()
    return commands.filter((command) =>
      [command.value, typeof command.label === "string" ? command.label : ""]
        .join(" ")
        .toLowerCase()
        .includes(filter)
    )
  }, [slash, commands])
  const open = !!slash && slash.start !== dismissedAt && matches.length > 0
  const active = Math.min(highlighted, Math.max(matches.length - 1, 0))

  const update = React.useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea || !commands) return
    const caret = textarea.selectionStart
    const match =
      caret === textarea.selectionEnd
        ? findSlashCommand(textarea.value.slice(0, caret))
        : null
    const next = match
      ? { start: caret - match[2].length - 1, filter: match[2] }
      : null
    setSlash((previous) =>
      previous?.start === next?.start && previous?.filter === next?.filter
        ? previous
        : next
    )
    if (!next) setDismissedAt(null)
    if (next?.filter !== slash?.filter) setHighlighted(0)
  }, [textareaRef, commands, slash])

  const dismiss = () => {
    if (slash) setDismissedAt(slash.start)
  }

  const choose = (command: AIChatComposerCommand) => {
    const textarea = textareaRef.current
    if (!textarea || !slash) return
    const end = textarea.selectionStart
    if (command.onSelect) {
      textarea.focus()
      textarea.setRangeText("", slash.start, end, "end")
      textarea.dispatchEvent(new Event("input", { bubbles: true }))
      command.onSelect()
    } else {
      insertText(textarea, "/" + command.value, slash.start, end)
    }
    setSlash(null)
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!open) return false
    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp": {
        const step = event.key === "ArrowDown" ? 1 : -1
        setHighlighted((active + step + matches.length) % matches.length)
        break
      }
      case "Enter":
      case "Tab":
        choose(matches[active])
        break
      case "Escape":
        event.stopPropagation()
        dismiss()
        break
      default:
        return false
    }
    event.preventDefault()
    return true
  }

  return {
    open,
    matches,
    active,
    slashStart: open ? slash.start : null,
    update,
    choose,
    dismiss,
    highlight: setHighlighted,
    handleKeyDown,
  }
}

function TokenOverlay({
  text,
  tokenPattern,
  markerAt,
  markerRef,
  ...props
}: React.ComponentProps<"div"> & {
  text: string
  tokenPattern: RegExp | null
  markerAt: number | null
  markerRef: React.Ref<HTMLSpanElement>
}) {
  const content = React.useMemo(() => {
    const parts: React.ReactNode[] = []
    const chips = tokenPattern
      ? [...text.matchAll(tokenPattern)].map((match) => {
          const start = match.index + match[1].length
          return { start, end: start + match[2].length, token: match[2] }
        })
      : []
    const adjacent = (a?: { end: number }, b?: { start: number }) =>
      !!a && !!b && /^[^\S\n]+$/.test(text.slice(a.end, b.start))
    const marker = <span key="marker" ref={markerRef} />
    const pushText = (from: number, to: number) => {
      if (markerAt !== null && markerAt >= from && markerAt < to) {
        parts.push(text.slice(from, markerAt), marker, text.slice(markerAt, to))
      } else {
        parts.push(text.slice(from, to))
      }
    }

    let last = 0
    chips.forEach((chip, index) => {
      pushText(last, chip.start)
      if (markerAt === chip.start) parts.push(marker)
      parts.push(
        <span
          key={chip.start}
          data-slot="ai-chat-composer-token"
          className={cn(
            "rounded-xs bg-blue-100 box-decoration-clone py-[1.5px] text-blue-700 dark:bg-blue-500/25 dark:text-blue-200",
            !adjacent(chips[index - 1], chip) && "-ml-1 pl-1",
            !adjacent(chip, chips[index + 1]) && "-mr-1 pr-1"
          )}
        >
          {chip.token}
        </span>
      )
      last = chip.end
    })
    pushText(last, text.length)
    if (markerAt === text.length) parts.push(marker)
    parts.push("\u200b")
    return parts
  }, [text, tokenPattern, markerAt, markerRef])

  return (
    <div aria-hidden data-slot="ai-chat-composer-overlay" {...props}>
      {content}
    </div>
  )
}

function CommandMenu({
  open,
  anchor,
  listId,
  commands,
  active,
  onHighlight,
  onChoose,
  onDismiss,
}: {
  open: boolean
  anchor: PopoverPrimitive.Positioner.Props["anchor"]
  listId: string
  commands: AIChatComposerCommand[]
  active: number
  onHighlight: (index: number) => void
  onChoose: (command: AIChatComposerCommand) => void
  onDismiss: () => void
}) {
  const positionerRef = React.useRef<HTMLDivElement>(null)
  const [descriptionTop, setDescriptionTop] = React.useState(0)
  const description = commands[active]?.description

  const placeDescription = React.useCallback(() => {
    const option = document.getElementById(`${listId}-${active}`)
    const positioner = positionerRef.current
    if (!option || !positioner) return
    setDescriptionTop(
      option.getBoundingClientRect().top -
        positioner.getBoundingClientRect().top
    )
  }, [listId, active])

  React.useLayoutEffect(() => {
    if (!open) return
    document
      .getElementById(`${listId}-${active}`)
      ?.scrollIntoView({ block: "nearest" })
    placeDescription()
  }, [open, listId, active, commands, placeDescription])

  return (
    <PopoverPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onDismiss()
      }}
      modal={false}
    >
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Positioner
          ref={positionerRef}
          anchor={anchor}
          side="bottom"
          align="start"
          sideOffset={4}
          className="isolate z-50 outline-none"
        >
          <PopoverPrimitive.Popup
            initialFocus={false}
            finalFocus={false}
            data-slot="ai-chat-composer-commands"
            onScroll={placeDescription}
            className="max-h-(--available-height) w-60 origin-(--transform-origin) overflow-y-auto rounded-14 bg-popover p-1 text-sm text-popover-foreground shadow-(--shadow-popover) ring-1 ring-border outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"
          >
            <div id={listId} role="listbox" className="flex flex-col">
              {commands.map((command, index) => {
                const startsGroup =
                  !!command.group &&
                  command.group !== commands[index - 1]?.group
                return (
                  <React.Fragment key={command.value}>
                    {startsGroup && (
                      <>
                        {index > 0 && (
                          <div
                            role="separator"
                            className="mx-1 mt-1 mb-[3px] h-px bg-border"
                          />
                        )}
                        <div className="px-2 py-1.5 text-2xs font-medium text-muted-foreground">
                          {command.group}
                        </div>
                      </>
                    )}
                    <div
                      id={`${listId}-${index}`}
                      role="option"
                      aria-selected={index === active}
                      data-highlighted={index === active || undefined}
                      className="flex cursor-default items-center gap-2 rounded-lg px-2 py-1.5 select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&>svg]:mx-0.5"
                      onMouseMove={() => onHighlight(index)}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => onChoose(command)}
                    >
                      {command.icon}
                      <span className="truncate">
                        {command.label ?? command.value}
                      </span>
                    </div>
                  </React.Fragment>
                )
              })}
            </div>
          </PopoverPrimitive.Popup>
          {description && (
            <div
              data-slot="ai-chat-composer-command-description"
              style={{ top: descriptionTop }}
              className="pointer-events-none absolute left-full ml-2 w-max max-w-66 rounded-md bg-foreground px-2 py-1 text-2xs text-background"
            >
              {description}
            </div>
          )}
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}

function ExpandButton() {
  const { maximized, setMaximized } = useAIChatComposer()
  return (
    <Button
      data-slot="ai-chat-composer-expand"
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={maximized ? "Collapse" : "Expand"}
      onClick={() => setMaximized(!maximized)}
      className="relative z-10 mt-1.5 mr-1.5 self-start justify-self-end rounded-full text-muted-foreground [grid-area:input] hover:text-foreground"
    >
      {maximized ? <MinimizeIcon /> : <MaximizeIcon />}
    </Button>
  )
}

/**
 * The text input. Enter submits the closest form (Shift+Enter adds a line)
 * unless `submitOnEnter` is false. It grows with its content up to a limit and
 * fades out at the edges it scrolls past; from the fifth line a button
 * maximizes the composer.
 *
 * `tokens` are drawn as inline chips wherever they stand as a word, and
 * Backspace removes a token as a whole. Typing "/" at the start of a word
 * opens the `commands` menu, which inserts a token or runs an action.
 */
function AIChatComposerTextarea({
  className,
  style,
  submitOnEnter = true,
  maximizable = true,
  tokens,
  commands,
  onKeyDown,
  onInput,
  onScroll,
  onSelect,
  ref,
  ...props
}: React.ComponentProps<"textarea"> & {
  submitOnEnter?: boolean
  /** Shows the maximize button once the text runs long. */
  maximizable?: boolean
  /** Strings drawn as inline chips, such as "/release-notes". */
  tokens?: string[]
  /** Items of the menu that "/" opens. */
  commands?: AIChatComposerCommand[]
}) {
  const { rootRef, textareaRef, maximized } = useAIChatComposer()
  const localRef = React.useRef<HTMLTextAreaElement>(null)
  const overlayRef = React.useRef<HTMLDivElement>(null)
  const markerRef = React.useRef<HTMLSpanElement>(null)
  const listId = React.useId()

  const tokenPattern = useTokenPattern(tokens, commands)
  const { text, long, measuring, scroll, gutter, measure } = useTextareaLayout(
    localRef,
    overlayRef,
    String(props.value ?? props.defaultValue ?? "")
  )
  const menu = useSlashCommands(localRef, commands)
  const mergedRef = React.useCallback(
    (node: HTMLTextAreaElement | null) =>
      assignRefs(node, [localRef, textareaRef, ref]),
    [textareaRef, ref]
  )

  const menuAnchor = {
    get contextElement() {
      return localRef.current ?? undefined
    },
    getBoundingClientRect() {
      const target = markerRef.current ?? rootRef.current
      return target?.getBoundingClientRect() ?? new DOMRect()
    },
  }

  const expandable = maximizable && (long || maximized)
  const fadeAttributes = {
    "data-fade-top": scroll.fadeTop || undefined,
    "data-fade-bottom": scroll.fadeBottom || undefined,
  }
  const gutterStyle = gutter
    ? ({ "--ai-chat-composer-gutter": `${gutter}px` } as React.CSSProperties)
    : undefined

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    onKeyDown?.(event)
    if (
      event.defaultPrevented ||
      event.nativeEvent.isComposing ||
      (event.key === "Enter" && event.keyCode === 229)
    ) {
      return
    }
    if (menu.handleKeyDown(event)) return

    const textarea = event.currentTarget
    if (
      event.key === "Backspace" &&
      tokenPattern &&
      removeTokenBeforeCaret(textarea, tokenPattern)
    ) {
      event.preventDefault()
      return
    }
    if (submitOnEnter && event.key === "Enter" && !event.shiftKey) {
      const form = textarea.form
      if (!form) return
      event.preventDefault()
      submitForm(form)
    }
  }

  return (
    <>
      {(tokenPattern || commands) && (
        <TokenOverlay
          ref={overlayRef}
          markerRef={markerRef}
          text={text}
          tokenPattern={tokenPattern}
          markerAt={menu.slashStart}
          {...fadeAttributes}
          style={gutterStyle}
          className={cn(
            textBoxClassName,
            "pointer-events-none mr-[var(--ai-chat-composer-gutter,0px)] self-stretch overflow-hidden wrap-break-word whitespace-pre-wrap contain-size group-has-[[data-slot=ai-chat-composer-textarea]:disabled]/ai-chat-composer:opacity-50",
            !tokenPattern && "text-transparent",
            expandable &&
              "pr-[calc(--spacing(11.5)-var(--ai-chat-composer-gutter,0px))]!"
          )}
        />
      )}
      <textarea
        ref={mergedRef}
        data-slot="ai-chat-composer-textarea"
        data-measuring={measuring || undefined}
        {...fadeAttributes}
        rows={1}
        aria-autocomplete={commands ? "list" : undefined}
        aria-controls={menu.open ? listId : undefined}
        aria-activedescendant={
          menu.open ? `${listId}-${menu.active}` : undefined
        }
        style={gutterStyle ? { ...gutterStyle, ...style } : style}
        className={cn(
          textBoxClassName,
          "field-sizing-content max-h-47 min-h-10 resize-none bg-transparent outline-none group-data-[maximized=true]/ai-chat-composer:h-full group-data-[maximized=true]/ai-chat-composer:max-h-none group-data-[maximized=true]/ai-chat-composer:self-stretch placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-scrollbar]:w-6 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-8 [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:bg-clip-padding [&::-webkit-scrollbar-track]:mb-2 [&::-webkit-scrollbar-track]:bg-transparent [@supports_not_selector(::-webkit-scrollbar)]:[scrollbar-width:thin] [@supports_not_selector(::-webkit-scrollbar)]:[scrollbar-color:var(--border)_transparent]",
          tokenPattern &&
            "text-transparent caret-foreground selection:bg-primary/20 selection:text-transparent",
          expandable &&
            "[scrollbar-gutter:stable] pr-[calc(--spacing(11.5)-var(--ai-chat-composer-gutter,0px))]! [&::-webkit-scrollbar-track]:mt-10",
          className
        )}
        onInput={(event) => {
          onInput?.(event)
          measure()
          menu.update()
        }}
        onSelect={(event) => {
          onSelect?.(event)
          menu.update()
        }}
        onScroll={(event) => {
          onScroll?.(event)
          measure()
        }}
        onKeyDown={handleKeyDown}
        {...props}
      />
      {expandable && <ExpandButton />}
      {commands && (
        <CommandMenu
          open={menu.open}
          anchor={menuAnchor}
          listId={listId}
          commands={menu.matches}
          active={menu.active}
          onHighlight={menu.highlight}
          onChoose={menu.choose}
          onDismiss={menu.dismiss}
        />
      )}
    </>
  )
}

/** The actions before the text. A Badge here marks a tool that is turned on. */
function AIChatComposerLeading({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="ai-chat-composer-leading"
      className={cn(
        "flex items-center gap-1 py-1.5 pl-1.5 [grid-area:leading] group-data-[dictating=true]/ai-chat-composer:hidden [&>:not([data-slot=badge])+[data-slot=badge]]:ml-1 [&>button]:rounded-full",
        className
      )}
      {...props}
    />
  )
}

function AIChatComposerTrailing({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="ai-chat-composer-trailing"
      className={cn(
        "flex items-center justify-end gap-1 py-1.5 pr-1.5 [grid-area:trailing] group-data-[dictating=true]/ai-chat-composer:hidden [&>button]:rounded-full",
        className
      )}
      {...props}
    />
  )
}

/**
 * Starts dictation. While recording, the row of actions turns into a bar with
 * cancel, a live waveform, stop and send; stop inserts the words at the caret,
 * send also submits the form.
 *
 * Without `transcribe` the browser's speech recognition is used (Safari and
 * Chrome; not Firefox, Arc or Brave). The button is disabled where neither is
 * available.
 */
function AIChatComposerDictate({
  transcribe,
  lang,
  onError,
  onClick,
  onMouseDown,
  disabled,
  children,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "onError"> & {
  /** Turns the recorded audio into text, e.g. through a speech-to-text API. */
  transcribe?: (audio: Blob) => Promise<string>
  /** BCP 47 language tag of the speech. Defaults to `navigator.language`. */
  lang?: string
  /** Called when dictation cannot start or produces no text. */
  onError?: (error: AIChatComposerDictationError) => void
}) {
  const { dictation } = useAIChatComposer()
  const { configure } = dictation
  const supported = React.useSyncExternalStore(
    subscribeNever,
    () =>
      !!navigator.mediaDevices?.getUserMedia &&
      (!!transcribe || !!getSpeechRecognition()),
    () => false
  )

  React.useEffect(() => {
    configure({ transcribe, lang, onError })
  }, [configure, transcribe, lang, onError])

  return (
    <Button
      data-slot="ai-chat-composer-dictate"
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label="Dictate"
      disabled={disabled || !supported}
      onMouseDown={(event) => {
        onMouseDown?.(event)
        event.preventDefault()
      }}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) dictation.start()
      }}
      {...props}
    >
      {children ?? <AudioLinesIcon />}
    </Button>
  )
}

function AIChatComposerSubmit({
  children,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      data-slot="ai-chat-composer-submit"
      type="submit"
      size="icon-sm"
      aria-label="Send"
      {...props}
    >
      {children ?? <ArrowUpIcon />}
    </Button>
  )
}

/**
 * Positions menus opened from the composer's buttons: 4px below the composer,
 * or above the button that opened them when there is no room below, aligned to
 * the composer's sides.
 *
 * @example
 * const { ref, anchor } = useAIChatComposerAnchor()
 * <AIChatComposer ref={ref}>…<DropdownMenuContent anchor={anchor}>
 */
function useAIChatComposerAnchor() {
  const ref = React.useRef<HTMLDivElement>(null)
  const anchor = React.useCallback(() => {
    const composer = ref.current
    if (!composer) return null
    return {
      contextElement: composer,
      getBoundingClientRect: () => {
        const box = composer.getBoundingClientRect()
        const trigger = composer.querySelector("[data-popup-open]")
        const top = trigger ? trigger.getBoundingClientRect().top : box.top
        return DOMRect.fromRect({
          x: box.left,
          y: top,
          width: box.width,
          height: box.bottom - top,
        })
      },
    }
  }, [])
  return { ref, anchor }
}

export {
  AIChatComposer,
  AIChatComposerHeader,
  AIChatComposerTextarea,
  AIChatComposerLeading,
  AIChatComposerTrailing,
  AIChatComposerDictate,
  AIChatComposerSubmit,
  AIChatComposerDictationError,
  useAIChatComposerAnchor,
  insertAIChatComposerToken,
  type AIChatComposerCommand,
  type AIChatComposerDictationErrorCode,
}
