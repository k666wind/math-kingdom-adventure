/**
 * audioEngine.ts — Math Kingdom Adventure
 * Oscillator-based sound effects via Web Audio API.
 * No audio files needed. All sounds generated in code.
 *
 * Usage:
 *   import { sfx } from '../../engine/audioEngine'
 *   sfx.correct()
 *   sfx.wrong()
 *   sfx.victory()
 *   sfx.levelUp()
 *   sfx.tap()
 *   sfx.setEnabled(false)   // mute (respects parent settings)
 */

// ── Context (lazy-init, one per session) ─────────────────────
let _ctx: AudioContext | null = null
let _enabled = true

function ctx(): AudioContext | null {
  if (!_enabled) return null
  if (!_ctx) {
    try {
      _ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    } catch {
      return null
    }
  }
  // Resume if suspended (autoplay policy)
  if (_ctx.state === 'suspended') _ctx.resume()
  return _ctx
}

// ── Core helpers ──────────────────────────────────────────────

/** Play a single tone: freq (Hz), duration (s), type, volume (0–1), startDelay (s) */
function tone(
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.3,
  startDelay = 0,
): void {
  const c = ctx()
  if (!c) return

  const osc  = c.createOscillator()
  const gain = c.createGain()

  osc.connect(gain)
  gain.connect(c.destination)

  osc.type      = type
  osc.frequency.setValueAtTime(freq, c.currentTime + startDelay)

  // Gentle attack + release envelope
  const t0 = c.currentTime + startDelay
  gain.gain.setValueAtTime(0, t0)
  gain.gain.linearRampToValueAtTime(volume, t0 + 0.01)
  gain.gain.setValueAtTime(volume, t0 + duration - 0.05)
  gain.gain.linearRampToValueAtTime(0, t0 + duration)

  osc.start(t0)
  osc.stop(t0 + duration)
}

/** Play a sequence of [freq, duration] pairs with a gap between each */
function sequence(
  notes: Array<[number, number]>,
  type: OscillatorType = 'sine',
  volume = 0.28,
  gap = 0,
): void {
  let delay = 0
  for (const [freq, dur] of notes) {
    tone(freq, dur, type, volume, delay)
    delay += dur + gap
  }
}

// ── Sound effects ─────────────────────────────────────────────

/** Short ascending ding — correct answer */
function correct(): void {
  sequence(
    [[523, 0.08], [659, 0.08], [784, 0.15]],
    'sine', 0.3, 0.02,
  )
}

/** Low buzz — wrong answer */
function wrong(): void {
  tone(180, 0.25, 'sawtooth', 0.25)
  tone(140, 0.20, 'sawtooth', 0.15, 0.12)
}

/** Short victory fanfare */
function victory(): void {
  sequence(
    [
      [523, 0.10], [523, 0.10], [523, 0.10],
      [659, 0.30],
      [587, 0.10],
      [523, 0.10],
      [659, 0.50],
    ],
    'triangle', 0.28, 0.02,
  )
}

/** Ascending scale — level up */
function levelUp(): void {
  const scale: Array<[number, number]> = [
    [262, 0.08], [294, 0.08], [330, 0.08],
    [349, 0.08], [392, 0.08], [440, 0.08],
    [494, 0.08], [523, 0.25],
  ]
  sequence(scale, 'sine', 0.28, 0.02)
}

/** Subtle click — button tap */
function tap(): void {
  tone(800, 0.04, 'square', 0.12)
}

/** Defeat / retreat sound */
function defeat(): void {
  sequence(
    [[349, 0.15], [294, 0.15], [247, 0.30]],
    'triangle', 0.22, 0.02,
  )
}

/** Item drop / reward ping */
function drop(): void {
  sequence(
    [[880, 0.08], [1047, 0.12]],
    'sine', 0.25, 0.03,
  )
}

// ── Public API ────────────────────────────────────────────────

export const sfx = {
  correct,
  wrong,
  victory,
  levelUp,
  tap,
  defeat,
  drop,

  /** Enable or disable all sounds */
  setEnabled(val: boolean): void {
    _enabled = val
    if (!val && _ctx) {
      _ctx.suspend()
    } else if (val && _ctx) {
      _ctx.resume()
    }
  },

  isEnabled(): boolean {
    return _enabled
  },
}
