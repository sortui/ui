export type PixelFieldFrame = {
  /** Milliseconds since the field appeared. */
  elapsed: number
  /** 0 → 1: how far the field has swept in from the right edge. */
  reveal: number
  color: string
}

const ROWS = 7
const GAP = 0.25
const ROUNDING = 0.3

const REST = 0.7
const FLARE = 0.8
const BAND = 0.5
const DIMS = [
  { opacity: 0.5, weight: 3 },
  { opacity: 0.4, weight: 2 },
  { opacity: 0.3, weight: 3 },
  { opacity: 0.2, weight: 3 },
]
const DIM_WEIGHT = DIMS.reduce((sum, dim) => sum + dim.weight, 0)

const CYCLE_MIN = 600
const CYCLE_MAX = 2000
const DIM_CHANCE = 0.85
const FLARE_CHANCE = 0.1
const EVENT_LENGTH = 0.25

const BAND_SLOT = 5
const BAND_CHANCE = 0.1
const BAND_STEP_MS = 4000

const SWEEP_EDGE = 0.15

function noise(a: number, b: number, c = 0) {
  let h = Math.imul(a | 0, 0x27d4eb2d) ^ Math.imul(b | 0, 0x165667b1)
  h = Math.imul(h ^ Math.imul(c | 0, 0x9e3779b1), 0x85ebca6b)
  h ^= h >>> 13
  h = Math.imul(h, 0xc2b2ae35)
  h ^= h >>> 16
  return (h >>> 0) / 4294967296
}

const easeInOut = (t: number) => t * t * (3 - 2 * t)

function cellOpacity(column: number, row: number, elapsed: number) {
  const length = CYCLE_MIN + noise(column, row, 1) * (CYCLE_MAX - CYCLE_MIN)
  const time = elapsed + noise(column, row, 2) * length
  const cycle = Math.floor(time / length)
  const position = (time % length) / length

  const roll = noise(column, row, 100 + cycle)
  const start = noise(column, row, 200 + cycle) * (1 - EVENT_LENGTH)
  const inEvent = position >= start && position < start + EVENT_LENGTH
  const depth = inEvent
    ? 1 - Math.abs(((position - start) / EVENT_LENGTH) * 2 - 1)
    : 0

  if (depth > 0 && roll < FLARE_CHANCE) return depth > 0.2 ? FLARE : REST
  if (depth > 0 && roll < FLARE_CHANCE + DIM_CHANCE) {
    let pick = noise(column, row, 300 + cycle) * DIM_WEIGHT
    const target = DIMS.find((dim) => (pick -= dim.weight) < 0) ?? DIMS[0]
    const steps = Math.round((REST - target.opacity) * 10)
    const reached = Math.ceil(Math.min(1, depth * 2) * steps)
    return Math.min(BAND, REST - reached / 10)
  }
  return REST
}

function inBand(column: number, row: number, elapsed: number) {
  const steps = elapsed / BAND_STEP_MS
  const offset = Math.floor(steps) + easeInOut(steps % 1)
  const slot = Math.floor(column / BAND_SLOT + offset)
  return noise(slot, row, 400) < BAND_CHANCE
}

function fillCell(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
) {
  if (!context.roundRect) return context.fillRect(x, y, size, size)
  context.beginPath()
  context.roundRect(x, y, size, size, size * ROUNDING)
  context.fill()
}

export function drawPixelField(
  canvas: HTMLCanvasElement,
  { elapsed, reveal, color }: PixelFieldFrame
) {
  const context = canvas.getContext("2d")
  if (!context || !canvas.width || !canvas.height) return
  const ratio = canvas.width / canvas.clientWidth || 1
  const width = canvas.clientWidth
  const height = canvas.clientHeight
  context.setTransform(ratio, 0, 0, ratio, 0, 0)
  context.clearRect(0, 0, width, height)
  context.fillStyle = color

  const pitch = height / ROWS
  const gap = pitch * GAP
  const size = pitch - gap
  const columns = Math.ceil(width / pitch)
  const edge = 1 - reveal * (1 + SWEEP_EDGE)

  for (let row = 0; row < ROWS; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const along = (column + 0.5) / columns
      const swept = Math.min(1, Math.max(0, (along - edge) / SWEEP_EDGE))
      if (swept === 0) continue

      let opacity = cellOpacity(column, row, elapsed)
      if (opacity === REST && inBand(column, row, elapsed)) opacity = BAND
      const alpha = Math.round(opacity * swept * 10) / 10
      if (alpha === 0) continue

      context.globalAlpha = alpha
      fillCell(context, column * pitch + gap / 2, row * pitch + gap / 2, size)
    }
  }
  context.globalAlpha = 1
}
