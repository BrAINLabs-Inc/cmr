import { useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CheckCircle2, Circle, Flame, HeartHandshake, Loader2 } from 'lucide-react'
import { api, ApiError } from '@/lib/api'
import type { CheckinResponse, CheckinWeeksResponse, DiaryCheckin, MeditationStats } from '@/lib/types'
import { WeeklyCheckin } from '@/components/WeeklyCheckin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'

// Mirrors WeeklyCheckin's own Card/section shape, so the check-in form
// doesn't visually jump once it loads.
function WeeklyCheckinSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-1 h-3 w-64" />
      </CardHeader>
      <CardContent className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="flex items-center gap-2.5">
              <Skeleton className="size-8 shrink-0 rounded-lg" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-20 w-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function MeditationJourneyCard() {
  const { data, isLoading } = useQuery({
    queryKey: ['checkin-stats'],
    queryFn: () => api.get<MeditationStats>('/checkin/stats'),
  })

  if (isLoading || !data) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="mt-1 h-3 w-56" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 rounded-lg border bg-muted/30 px-3 py-3">
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const { meditation, checkinStreak } = data
  const tiles = [
    { label: 'Total sessions', value: meditation.totalSessions },
    { label: 'Total meditation time', value: `${meditation.totalMinutes} min` },
    { label: 'Meditation streak', value: `${meditation.currentStreak} wk` },
    { label: 'Avg. weekly practice', value: `${meditation.averageWeeklyMinutes} min` },
  ]

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Flame className="size-4 text-primary" />
          <CardTitle className="text-base">Your Meditation Journey</CardTitle>
        </div>
        <CardDescription>
          {checkinStreak > 0
            ? `${checkinStreak}-week check-in streak, nice and steady.`
            : "Optional. Track it whenever you'd like, no pressure."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {tiles.map((t) => (
            <div key={t.label} className="rounded-lg border bg-muted/30 px-3 py-3 text-center">
              <p className="text-xl font-semibold tabular-nums">{t.value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{t.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function PastCheckinDialog({
  week,
  onOpenChange,
}: {
  week: number | null
  onOpenChange: (open: boolean) => void
}) {
  const { data } = useQuery({
    queryKey: ['checkin', week],
    queryFn: () => api.get<CheckinResponse>(`/checkin/${week}`),
    enabled: week !== null,
  })

  return (
    <Dialog open={week !== null} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[85vh] w-[min(96vw,64rem)] max-w-none flex-col gap-0 overflow-hidden p-0 sm:max-w-none sm:w-[min(92vw,64rem)]">
        <DialogHeader className="shrink-0 border-b px-6 py-4">
          <DialogTitle className="flex flex-wrap items-center gap-2 text-lg">
            <HeartHandshake className="size-5 text-primary" />
            Week {week} Check-in
            {data?.checkin.meditation?.practiced && (
              <Badge className="gap-1">
                <CheckCircle2 className="size-3.5" />
                Meditated
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {data ? <WeeklyCheckin value={data.checkin} onChange={() => {}} disabled /> : <WeeklyCheckinSkeleton />}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function CheckinPage() {
  const queryClient = useQueryClient()

  const { data: weeksData, isLoading: weeksLoading } = useQuery({
    queryKey: ['checkin-weeks'],
    queryFn: () => api.get<CheckinWeeksResponse>('/checkin/weeks'),
  })
  const currentWeek = weeksData?.currentWeek

  const { data: currentData, isLoading: currentLoading } = useQuery({
    queryKey: ['checkin', currentWeek],
    queryFn: () => api.get<CheckinResponse>(`/checkin/${currentWeek}`),
    enabled: currentWeek !== undefined,
  })

  const [checkin, setCheckin] = useState<DiaryCheckin>({})
  const [saving, setSaving] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [viewingWeek, setViewingWeek] = useState<number | null>(null)
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const saveSeq = useRef(0)

  useEffect(() => {
    if (currentData) setCheckin(currentData.checkin)
  }, [currentData])

  async function save(next: DiaryCheckin, silent: boolean) {
    if (!currentWeek) return
    const seq = ++saveSeq.current
    setSaving(true)
    try {
      const saved = await api.put<{ checkin: DiaryCheckin; updatedAt: string | null }>(
        `/checkin/${currentWeek}`,
        { checkin: next }
      )
      setLastSavedAt(new Date())
      if (seq === saveSeq.current) {
        queryClient.setQueryData<CheckinResponse>(['checkin', currentWeek], (old) =>
          old ? { ...old, checkin: saved.checkin, updatedAt: saved.updatedAt } : old
        )
      }
      queryClient.invalidateQueries({ queryKey: ['checkin-weeks'] })
      queryClient.invalidateQueries({ queryKey: ['checkin-stats'] })
      if (!silent) toast.success('Check-in saved')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not save check-in')
    } finally {
      setSaving(false)
    }
  }

  function handleChange(next: DiaryCheckin) {
    setCheckin(next)
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    autosaveTimer.current = setTimeout(() => save(next, true), 1500)
  }

  const pastWeeks = (weeksData?.weeks ?? []).filter((w) => !w.isCurrent)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <HeartHandshake className="size-5 text-primary" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Weekly Check-in</h1>
          <p className="text-sm text-muted-foreground">
            Optional: your meditation practice, mood, gratitude, and intentions, week by week.
          </p>
        </div>
      </div>

      <MeditationJourneyCard />

      {weeksLoading || currentLoading || !currentWeek ? (
        <WeeklyCheckinSkeleton />
      ) : (
        <>
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold tracking-tight">Week {currentWeek} Check-in</h2>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {saving && <Loader2 className="size-3 animate-spin" />}
              {saving
                ? 'Saving…'
                : lastSavedAt
                  ? `Saved at ${lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  : ''}
            </span>
          </div>

          <WeeklyCheckin value={checkin} onChange={handleChange} />

          <div className="flex justify-end">
            <Button onClick={() => save(checkin, false)} disabled={saving}>
              Save Check-in
            </Button>
          </div>
        </>
      )}

      {pastWeeks.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Past Weeks</CardTitle>
            <CardDescription>Look back at what you logged in previous weeks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {pastWeeks.map((w) => (
              <button
                key={w.weekNumber}
                type="button"
                onClick={() => setViewingWeek(w.weekNumber)}
                className="flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors hover:bg-accent/50"
              >
                <div className="flex items-center gap-3">
                  {w.hasData ? (
                    <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Circle className="size-5 text-muted-foreground" />
                  )}
                  <span className="font-medium">Week {w.weekNumber}</span>
                </div>
                <span className="text-sm text-muted-foreground">{w.hasData ? 'Logged' : 'Nothing logged'}</span>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      <PastCheckinDialog week={viewingWeek} onOpenChange={(open) => !open && setViewingWeek(null)} />
    </div>
  )
}
