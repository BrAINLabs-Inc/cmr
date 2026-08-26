import { useState } from 'react'
import { Flower2, Heart, Plus, Sparkles, Target } from 'lucide-react'
import type { DiaryCheckin, GoalOutcome, MoodFeeling } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const MOOD_OPTIONS: { value: MoodFeeling; emoji: string; label: string }[] = [
  { value: 'very_good', emoji: '😊', label: 'Very good' },
  { value: 'good', emoji: '🙂', label: 'Good' },
  { value: 'okay', emoji: '😐', label: 'Okay' },
  { value: 'not_great', emoji: '🙁', label: 'Not great' },
  { value: 'difficult', emoji: '😔', label: 'Difficult week' },
]

const RATING_FIELDS: { key: 'happiness' | 'stress' | 'calmness' | 'sleepQuality' | 'wellbeing'; label: string }[] = [
  { key: 'happiness', label: 'Happiness' },
  { key: 'stress', label: 'Stress' },
  { key: 'calmness', label: 'Calmness' },
  { key: 'sleepQuality', label: 'Sleep quality' },
  { key: 'wellbeing', label: 'Overall well-being' },
]

const GOAL_OUTCOMES: { value: GoalOutcome; label: string }[] = [
  { value: 'not_started', label: 'Not started' },
  { value: 'partially_achieved', label: 'Partially achieved' },
  { value: 'achieved', label: 'Achieved' },
  { value: 'exceeded', label: 'Exceeded' },
]

function RatingButtons({
  value,
  onChange,
  disabled,
}: {
  value?: number
  onChange: (n: number) => void
  disabled?: boolean
}) {
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={disabled}
          onClick={() => onChange(n)}
          className={cn(
            'flex size-8 items-center justify-center rounded-full border text-sm font-medium transition-colors',
            value === n
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-input text-muted-foreground hover:bg-accent',
            disabled && 'pointer-events-none opacity-60'
          )}
        >
          {n}
        </button>
      ))}
    </div>
  )
}

type WeeklyCheckinProps = {
  value: DiaryCheckin
  onChange: (next: DiaryCheckin) => void
  disabled?: boolean

  alwaysOpen?: boolean
}

function hasAnyData(v: DiaryCheckin) {
  return Boolean(
    v.meditation?.practiced !== undefined ||
      v.mood?.feeling ||
      v.gratitude?.some((g) => g.trim()) ||
      v.noticed?.trim() ||
      v.goal?.intention?.trim()
  )
}

export function WeeklyCheckin({ value, onChange, disabled, alwaysOpen }: WeeklyCheckinProps) {
  const [open, setOpen] = useState(() => alwaysOpen || hasAnyData(value) || Boolean(disabled))

  function updateMeditation(patch: Partial<NonNullable<DiaryCheckin['meditation']>>) {
    onChange({ ...value, meditation: { ...value.meditation, ...patch } })
  }
  function updateMood(patch: Partial<NonNullable<DiaryCheckin['mood']>>) {
    onChange({ ...value, mood: { ...value.mood, ...patch } })
  }
  function updateGoal(patch: Partial<NonNullable<DiaryCheckin['goal']>>) {
    onChange({ ...value, goal: { ...value.goal, ...patch } })
  }
  function updateGratitude(index: number, text: string) {
    const next = [value.gratitude?.[0] ?? '', value.gratitude?.[1] ?? '', value.gratitude?.[2] ?? '']
    next[index] = text
    onChange({ ...value, gratitude: next })
  }

  if (!open) {
    return (
      <Button type="button" variant="outline" onClick={() => setOpen(true)} className="w-full border-dashed">
        <Plus className="size-4" />
        Add weekly check-in (optional)
      </Button>
    )
  }

  const meditation = value.meditation ?? {}
  const avgPerSession =
    meditation.practiced && meditation.minutes && meditation.sessions
      ? Math.round(meditation.minutes / meditation.sessions)
      : null

  return (
    <Card>
      {!alwaysOpen && (
        <CardHeader className="flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Weekly Check-in</CardTitle>
            <CardDescription>Optional: track your practice, mood, and intentions.</CardDescription>
          </div>
          {!disabled && (
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Hide
            </Button>
          )}
        </CardHeader>
      )}
      <CardContent className="space-y-6">
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Flower2 className="size-4 text-primary" />
            <h3 className="text-sm font-semibold">Meditation Practice</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Meditated this week?</span>
            <Button
              type="button"
              size="sm"
              variant={meditation.practiced === true ? 'default' : 'outline'}
              disabled={disabled}
              onClick={() => updateMeditation({ practiced: true })}
            >
              Yes
            </Button>
            <Button
              type="button"
              size="sm"
              variant={meditation.practiced === false ? 'default' : 'outline'}
              disabled={disabled}
              onClick={() => updateMeditation({ practiced: false, minutes: undefined, sessions: undefined, type: undefined })}
            >
              No
            </Button>
          </div>

          {meditation.practiced && (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Total minutes</Label>
                  <Input
                    type="number"
                    min={0}
                    disabled={disabled}
                    value={meditation.minutes ?? ''}
                    onChange={(e) => updateMeditation({ minutes: e.target.value === '' ? undefined : Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Sessions</Label>
                  <Input
                    type="number"
                    min={0}
                    disabled={disabled}
                    value={meditation.sessions ?? ''}
                    onChange={(e) => updateMeditation({ sessions: e.target.value === '' ? undefined : Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Type</Label>
                  <Input
                    placeholder="e.g. Mindfulness"
                    disabled={disabled}
                    value={meditation.type ?? ''}
                    onChange={(e) => updateMeditation({ type: e.target.value })}
                  />
                </div>
              </div>
              {avgPerSession !== null && (
                <p className="text-xs text-muted-foreground">
                  Meditation this week: {meditation.minutes} minutes · Sessions: {meditation.sessions} · Average:{' '}
                  {avgPerSession} min/session
                </p>
              )}
              <Textarea
                rows={2}
                placeholder="A short reflection on your practice…"
                disabled={disabled}
                value={meditation.reflection ?? ''}
                onChange={(e) => updateMeditation({ reflection: e.target.value })}
              />
            </>
          )}
        </section>

        <Separator />

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Heart className="size-4 text-primary" />
            <h3 className="text-sm font-semibold">Mood / Well-being Check-in</h3>
          </div>
          <p className="text-sm text-muted-foreground">How are you feeling this week?</p>
          <div className="flex flex-wrap gap-2">
            {MOOD_OPTIONS.map((m) => (
              <button
                key={m.value}
                type="button"
                disabled={disabled}
                onClick={() => updateMood({ feeling: m.value })}
                className={cn(
                  'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors',
                  value.mood?.feeling === m.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-input text-muted-foreground hover:bg-accent',
                  disabled && 'pointer-events-none opacity-60'
                )}
              >
                <span>{m.emoji}</span>
                {m.label}
              </button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {RATING_FIELDS.map((f) => (
              <div key={f.key} className="flex items-center justify-between gap-3">
                <Label className="text-sm text-muted-foreground">{f.label}</Label>
                <RatingButtons
                  value={value.mood?.[f.key]}
                  disabled={disabled}
                  onChange={(n) => updateMood({ [f.key]: n })}
                />
              </div>
            ))}
          </div>
        </section>

        <Separator />

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <h3 className="text-sm font-semibold">Gratitude Journal</h3>
          </div>
          <p className="text-sm text-muted-foreground">Three things I'm grateful for this week</p>
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-4 shrink-0 text-sm text-muted-foreground">{i + 1}.</span>
                <Input
                  disabled={disabled}
                  value={value.gratitude?.[i] ?? ''}
                  onChange={(e) => updateGratitude(i, e.target.value)}
                />
              </div>
            ))}
          </div>
        </section>

        <Separator />

        {/* What I noticed */}
        <section className="space-y-2">
          <h3 className="text-sm font-semibold">What did you notice about yourself this week?</h3>
          <p className="text-xs text-muted-foreground">
            Thoughts, emotions, behaviour, relationships, meditation, daily experiences: anything at all, or skip it.
          </p>
          <Textarea
            rows={3}
            placeholder="Optional…"
            disabled={disabled}
            value={value.noticed ?? ''}
            onChange={(e) => onChange({ ...value, noticed: e.target.value })}
          />
        </section>

        <Separator />

        {/* Personal goal */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Target className="size-4 text-primary" />
            <h3 className="text-sm font-semibold">Personal Goal</h3>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">My intention for this week</Label>
            <Textarea
              rows={2}
              placeholder="e.g. I will spend 10 minutes each morning in meditation."
              disabled={disabled}
              value={value.goal?.intention ?? ''}
              onChange={(e) => updateGoal({ intention: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">How did I do?</Label>
            <div className="flex flex-wrap gap-2">
              {GOAL_OUTCOMES.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  disabled={disabled}
                  onClick={() => updateGoal({ outcome: o.value })}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-sm transition-colors',
                    value.goal?.outcome === o.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-input text-muted-foreground hover:bg-accent',
                    disabled && 'pointer-events-none opacity-60'
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </section>
      </CardContent>
    </Card>
  )
}
