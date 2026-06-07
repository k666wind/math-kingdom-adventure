/**
 * audioEngine.ts — Math Kingdom Adventure v10
 * Oscillator-based sound effects via Web Audio API.
 */

let _ctx: AudioContext | null = null
let _enabled = true

function ctx(): AudioContext | null {
  if (!_enabled) return null
  if (!_ctx) {
    try {
      _ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    } catch { return null }
  }
  if (_ctx.state === 'suspended') _ctx.resume()
  return _ctx
}

function tone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.3, startDelay = 0): void {
  const c = ctx()
  if (!c) return
  const osc  = c.createOscillator()
  const gain = c.createGain()
  osc.connect(gain)
  gain.connect(c.destination)
  osc.type = type
  osc.frequency.setValueAtTime(freq, c.currentTime + startDelay)
  const t0 = c.currentTime + startDelay
  gain.gain.setValueAtTime(0, t0)
  gain.gain.linearRampToValueAtTime(volume, t0 + 0.01)
  gain.gain.setValueAtTime(volume, t0 + duration - 0.05)
  gain.gain.linearRampToValueAtTime(0, t0 + duration)
  osc.start(t0)
  osc.stop(t0 + duration)
}

function sequence(notes: Array<[number, number]>, type: OscillatorType = 'sine', volume = 0.28, gap = 0): void {
  let delay = 0
  for (const [freq, dur] of notes) {
    tone(freq, dur, type, volume, delay)
    delay += dur + gap
  }
}

function correct(): void { sequence([[523,0.08],[659,0.08],[784,0.15]],'sine',0.3,0.02) }
function wrong(): void { tone(180,0.25,'sawtooth',0.25); tone(140,0.20,'sawtooth',0.15,0.12) }
function victory(): void { sequence([[523,0.10],[523,0.10],[523,0.10],[659,0.30],[587,0.10],[523,0.10],[659,0.50]],'triangle',0.28,0.02) }
function levelUp(): void { sequence([[262,0.08],[294,0.08],[330,0.08],[349,0.08],[392,0.08],[440,0.08],[494,0.08],[523,0.25]],'sine',0.28,0.02) }
function tap(): void { tone(800,0.04,'square',0.12) }
function defeat(): void { sequence([[349,0.15],[294,0.15],[247,0.30]],'triangle',0.22,0.02) }
function drop(): void { sequence([[880,0.08],[1047,0.12]],'sine',0.25,0.03) }

// ── 2E-9: New SFX ────────────────────────────────────────────
function hint(): void { tone(880, 0.1, 'sine', 0.2) }
function shield(): void { tone(220, 0.15, 'square', 0.2) }
function crystal(): void { tone(1046,0.08,'sine',0.22); tone(1318,0.08,'sine',0.22,0.1) }
function revive(): void { sequence([[523,0.1],[659,0.1],[784,0.15]],'sine',0.3,0.02) }

let _bgmGain: GainNode | null = null
let _bgmOsc: OscillatorNode | null = null

export function setSfxVolume(_v: number): void {
  // Volume stored in parentSettings; reserved for future use when tone() accepts dynamic volume
}

export function setBgmEnabled(on: boolean): void {
  const c = ctx()
  if (!c) return
  if (on && !_bgmGain) {
    _bgmGain = c.createGain()
    _bgmGain.gain.value = 0.06
    _bgmGain.connect(c.destination)
    _bgmOsc = c.createOscillator()
    _bgmOsc.frequency.value = 110  // A2 drone
    _bgmOsc.type = 'sine'
    _bgmOsc.connect(_bgmGain)
    _bgmOsc.start()
  } else if (!on && _bgmGain) {
    _bgmOsc?.stop()
    _bgmGain.disconnect()
    _bgmGain = null
    _bgmOsc  = null
  }
}

export const sfx = {
  correct, wrong, victory, levelUp, tap, defeat, drop,
  hint, shield, crystal, revive,
  setEnabled(val: boolean): void {
    _enabled = val
    if (!val && _ctx) _ctx.suspend()
    else if (val && _ctx) _ctx.resume()
  },
  isEnabled(): boolean { return _enabled },
}
