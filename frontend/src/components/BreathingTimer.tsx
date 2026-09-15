import { useEffect, useState } from 'react'
import { CheckCircle2, Pause, Play, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export type BreathPhase = 'inhale' | 'hold' | 'exhale'

export type BreathingTechnique = {
  id: string
  name: string
  pattern: string
  description: string
  steps: { phase: BreathPhase; seconds: number; label: string }[]
}

export const BREATHING_TECHNIQUES: BreathingTechnique[] = [
  {
    id: 'box',
    name: 'Box Breathing',
    pattern: '4-4-4-4',
    description: 'Equal inhale, hold, exhale, and hold. Steadies the nervous system and sharpens focus.',
    steps: [
      { phase: 'inhale', seconds: 4, label: 'Breathe in' },
      { phase: 'hold', seconds: 4, label: 'Hold' },
      { phase: 'exhale', seconds: 4, label: 'Breathe out' },
      { phase: 'hold', seconds: 4, label: 'Hold' },
    ],
  },
  {
    id: 'long-exhale',
    name: 'Long-Exhale Breathing',
    pattern: '4-7-8',
    description: 'An exhale twice as long as the inhale. Relaxes the body and can help with sleep and anxiety.',
    steps: [
      { phase: 'inhale', seconds: 4, label: 'Breathe in' },
      { phase: 'hold', seconds: 7, label: 'Hold' },
      { phase: 'exhale', seconds: 8, label: 'Breathe out' },
    ],
  },
  {
    id: 'equal',
    name: 'Equal Breathing',
    pattern: '5-0-5',
    description: 'A simple, even inhale and exhale with no holding, to build a steady, calming rhythm.',
    steps: [
      { phase: 'inhale', seconds: 5, label: 'Breathe in' },
      { phase: 'exhale', seconds: 5, label: 'Breathe out' },
    ],
  },
]

const SESSION_SECONDS = 5 * 60
const RESTING_SCALE = 0.6
const FULL_SCALE = 1

function formatClock(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function phaseAt(elapsed: number, steps: BreathingTechnique['steps']) {
  const cycleSeconds = steps.reduce((sum, s) => sum + s.seconds, 0)
  const t = elapsed % cycleSeconds
  let acc = 0
  for (let index = 0; index < steps.length; index++) {
    const step = steps[index]
    if (t < acc + step.seconds) {
      return { index, step, secondsLeft: step.seconds - (t - acc) }
    }
    acc += step.seconds
  }
  return { index: 0, step: steps[0], secondsLeft: steps[0].seconds }
}

const PHASE_TINT: Record<BreathPhase, string> = {
  inhale: 'from-primary/30 to-primary/10',
  hold: 'from-amber-400/25 to-amber-400/10',
  exhale: 'from-sky-400/25 to-sky-400/10',
}

export function BreathingTimer({ technique, onChangeTechnique }: { technique: BreathingTechnique; onChangeTechnique: () => void }) {
  const [running, setRunning] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [scale, setScale] = useState(RESTING_SCALE)
  const [transitionSeconds, setTransitionSeconds] = useState(0)

  const { index: phaseIndex, step: currentStep, secondsLeft } = phaseAt(elapsed, technique.steps)
  const remaining = SESSION_SECONDS - elapsed
  const completed = elapsed >= SESSION_SECONDS

  // Reset everything when a different technique is chosen.
  useEffect(() => {
    setRunning(false)
    setHasStarted(false)
    setElapsed(0)
    setScale(RESTING_SCALE)
    setTransitionSeconds(0)
  }, [technique])

  // Ticks the session clock once a second while running.
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1
        if (next >= SESSION_SECONDS) {
          setRunning(false)
          return SESSION_SECONDS
        }
        return next
      })
    }, 1000)
    return () => clearInterval(id)
  }, [running])

  // Drives the circle's grow/shrink animation once per phase change, timed
  // to that phase's own duration so it's a smooth CSS transition rather
  // than a per-second jump.
  useEffect(() => {
    if (!hasStarted) return
    setTransitionSeconds(currentStep.seconds)
    if (currentStep.phase === 'inhale') setScale(FULL_SCALE)
    else if (currentStep.phase === 'exhale') setScale(RESTING_SCALE)
    // 'hold' intentionally leaves the scale where the previous phase left it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phaseIndex, hasStarted])

  function handleStart() {
    setHasStarted(true)
    setRunning(true)
  }

  function handleReset() {
    setRunning(false)
    setHasStarted(false)
    setElapsed(0)
    setScale(RESTING_SCALE)
    setTransitionSeconds(0)
  }

  return (
    <div className="flex flex-col items-center gap-8 py-4">
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 text-center text-sm text-muted-foreground">
        <button onClick={onChangeTechnique} className="underline-offset-2 hover:text-foreground hover:underline">
          Change technique
        </button>
        <span aria-hidden>·</span>
        <span className="font-medium text-foreground">{technique.name}</span>
        <span>({technique.pattern})</span>
      </div>

      {completed ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="size-8" />
          </span>
          <p className="text-xl font-semibold">Session complete</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            You just spent 5 minutes on {technique.name.toLowerCase()}. Notice how you feel before moving on.
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <Button onClick={handleReset}>
              <RotateCcw className="size-4" />
              Do another round
            </Button>
            <Button variant="outline" onClick={onChangeTechnique}>
              Choose another technique
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="relative flex size-52 items-center justify-center sm:size-64 md:size-72">
            <div
              aria-hidden
              className={cn(
                'absolute inset-0 rounded-full bg-gradient-to-br blur-2xl transition-colors duration-700',
                PHASE_TINT[currentStep.phase]
              )}
            />
            <div
              className="absolute inset-6 rounded-full border-2 border-primary/20 bg-primary/5 sm:inset-8"
              style={{
                transform: `scale(${scale})`,
                transitionProperty: 'transform',
                transitionDuration: `${transitionSeconds}s`,
                transitionTimingFunction: 'ease-in-out',
              }}
            />
            <div className="relative flex flex-col items-center gap-1">
              <p className="text-lg font-semibold sm:text-xl">{hasStarted ? currentStep.label : 'Ready?'}</p>
              <p className="text-4xl font-bold tabular-nums sm:text-5xl">{hasStarted ? secondsLeft : currentStep.seconds}</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <p className="text-sm text-muted-foreground">
              Session time remaining: <span className="font-medium tabular-nums text-foreground">{formatClock(remaining)}</span>
            </p>
            <div className="flex items-center gap-3">
              {!hasStarted ? (
                <Button size="lg" onClick={handleStart}>
                  <Play className="size-4" />
                  Start 5-minute session
                </Button>
              ) : (
                <>
                  <Button size="lg" onClick={() => setRunning((r) => !r)}>
                    {running ? (
                      <>
                        <Pause className="size-4" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="size-4" />
                        Resume
                      </>
                    )}
                  </Button>
                  <Button size="lg" variant="outline" onClick={handleReset}>
                    <RotateCcw className="size-4" />
                    Reset
                  </Button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
