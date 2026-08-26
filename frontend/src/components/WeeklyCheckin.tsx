import { Flower2, Heart, Sparkles, Target } from 'lucide-react'
import type { DiaryCheckin, GoalOutcome } from '@/lib/types'
import { MOOD_OPTIONS } from '@/lib/mood'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

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

function SectionHeading({
  icon: Icon,
  tint,
  title,
}: {
  icon: typeof Flower2
  tint: string
  title: string
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg', tint)}>
        <Icon className="size-4" />
      </div>
      <h3 className="text-sm font-semibold">{title}</h3>
    </div>
  )
}

function RatingMeter({
  value,
  onChange,
  disabled,
}: {
  value?: number
  onChange: (n: number) => void
  disabled?: boolean
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            disabled={disabled}
            onClick={() => onChange(n)}
            aria-label={`${n} out of 5`}
            aria-pressed={value === n}
            className={cn(
              'h-2.5 w-6 rounded-full border transition-colors',
              value !== undefined && n <= value
                ? 'border-primary bg-primary'
                : 'border-border bg-muted-foreground/20 hover:bg-muted-foreground/30',
              disabled && 'pointer-events-none opacity-70'
            )}
          />
        ))}
      </div>
      <span className="w-3 text-xs tabular-nums text-muted-foreground">{value ?? ''}</span>
    </div>
  )
}

type WeeklyCheckinProps = {
  value: DiaryCheckin
  onChange: (next: DiaryCheckin) => void
  disabled?: boolean
}

export function WeeklyCheckin({ value, onChange, disabled }: WeeklyCheckinProps) {
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

  const meditation = value.meditation ?? {}
  const avgPerSession =
    meditation.practiced && meditation.minutes && meditation.sessions
      ? Math.round(meditation.minutes / meditation.sessions)
      : null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Weekly Check-in</CardTitle>
        <CardDescription>Optional: track your practice, mood, and intentions.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <section className="space-y-3">
          <SectionHeading icon={Flower2} tint="bg-primary/10 text-primary" title="Meditation Practice" />
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
                <p className="rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                  {meditation.minutes} minutes across {meditation.sessions} session{meditation.sessions === 1 ? '' : 's'}: an
                  average of {avgPerSession} min/session.
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
          <SectionHeading icon={Heart} tint="bg-rose-500/10 text-rose-600 dark:text-rose-400" title="Mood & Well-being" />
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
                <m.icon className={cn('size-4', value.mood?.feeling === m.value ? '' : m.className)} />
                {m.label}
              </button>
            ))}
          </div>
          <div className="divide-y rounded-lg border">
            {RATING_FIELDS.map((f) => (
              <div key={f.key} className="flex items-center justify-between gap-3 px-3 py-2.5">
                <Label className="text-sm text-muted-foreground">{f.label}</Label>
                <RatingMeter
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
          <SectionHeading icon={Sparkles} tint="bg-amber-500/10 text-amber-600 dark:text-amber-400" title="Gratitude Journal" />
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

        <section className="space-y-2">
          <SectionHeading icon={Sparkles} tint="bg-sky-500/10 text-sky-600 dark:text-sky-400" title="What did you notice about yourself?" />
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

        <section className="space-y-3">
          <SectionHeading icon={Target} tint="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" title="Personal Goal" />
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
