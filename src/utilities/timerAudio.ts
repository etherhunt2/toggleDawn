/**
 * timerAudio.ts — Web Audio API device bell chime generator & haptics.
 * Generates natural harmonic synthesizer bells for focus starts, break transitions,
 * and mission completions. Works 100% offline with zero external audio assets.
 */

let sharedAudioContext: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    if (!sharedAudioContext) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        sharedAudioContext = new AudioCtx()
      }
    }
    if (sharedAudioContext && sharedAudioContext.state === 'suspended') {
      sharedAudioContext.resume().catch(() => {})
    }
    return sharedAudioContext
  } catch (_e) {
    return null
  }
}

/**
 * Ring device bell chime
 * @param type 'focus' (energetic double-bell), 'break' (gentle reminder bell), 'complete' (triumphant chord)
 */
export function playBellChime(type: 'focus' | 'break' | 'complete' = 'focus'): void {
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const now = ctx.currentTime

    if (type === 'complete') {
      // Triumphant 4-note ascending chord arpeggio (C5 -> E5 -> G5 -> C6)
      const freqs = [523.25, 659.25, 783.99, 1046.5]
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, now + idx * 0.12)

        gain.gain.setValueAtTime(0, now + idx * 0.12)
        gain.gain.linearRampToValueAtTime(0.3, now + idx * 0.12 + 0.04)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 1.4)

        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now + idx * 0.12)
        osc.stop(now + idx * 0.12 + 1.5)
      })
    } else if (type === 'break') {
      // Gentle warm 2-tone bell for transition to break (A4 -> E5)
      const notes = [
        { freq: 440, delay: 0 },
        { freq: 659.25, delay: 0.22 },
      ]
      notes.forEach(({ freq, delay }) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now + delay)

        gain.gain.setValueAtTime(0, now + delay)
        gain.gain.linearRampToValueAtTime(0.25, now + delay + 0.03)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 1.2)

        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now + delay)
        osc.stop(now + delay + 1.3)
      })
    } else {
      // Focus start: Crisp, resonant double-strike bell (A5 -> D6) to energize operator
      const notes = [
        { freq: 880, delay: 0 },
        { freq: 1174.66, delay: 0.15 },
        { freq: 1760, delay: 0.3 },
      ]
      notes.forEach(({ freq, delay }) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now + delay)

        gain.gain.setValueAtTime(0, now + delay)
        gain.gain.linearRampToValueAtTime(0.3, now + delay + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 1.1)

        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now + delay)
        osc.stop(now + delay + 1.2)
      })
    }

    // Trigger mobile haptic feedback if available
    triggerHaptic([40, 60, 40])
  } catch (_e) {
    // Audio execution failed or muted
  }
}

/**
 * Mobile device tactile vibration
 */
export function triggerHaptic(pattern: number | number[] = 30): void {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern)
    } catch (_e) {
      // Vibration rejected or unavailable
    }
  }
}

