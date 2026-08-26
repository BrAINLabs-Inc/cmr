import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { JSONContent } from '@tiptap/core'
import { AlertTriangle, CheckCircle2, Loader2, Lock, ShieldOff, Trash2 } from 'lucide-react'
import { api, ApiError } from '@/lib/api'
import type { DiaryEntry } from '@/lib/types'
import { EMPTY_DOC } from '@/lib/tiptap'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { DiaryEditor } from '@/components/DiaryEditor'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

function wordCountFromText(text: string) {
  const trimmed = text.trim()
  return trimmed === '' ? 0 : trimmed.split(/\s+/).length
}

export function DiaryWritePage() {
  const { week } = useParams<{ week: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['diary', week],
    queryFn: () => api.get<{ entry: DiaryEntry; currentWeek: number }>(`/diary/${week}`),
  })

  const loadedEntry = data?.entry
  const isSubmitted = loadedEntry?.status === 'submitted'
  const isLocked = !isSubmitted && data !== undefined && Number(week) !== data.currentWeek
  const readOnly = isSubmitted || isLocked

  const latestContent = useRef<JSONContent>(EMPTY_DOC)
  const [words, setWords] = useState(0)
  const [researchOptOut, setResearchOptOut] = useState(false)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (loadedEntry) {
      setWords(loadedEntry.word_count)
      setResearchOptOut(loadedEntry.research_opt_out ?? false)
    }
  }, [loadedEntry])

  async function saveDraft(silent = false, optOutOverride?: boolean) {
    if (!week || readOnly) return
    setSaving(true)
    try {
      await api.put(`/diary/${week}`, {
        content: latestContent.current,
        researchOptOut: optOutOverride ?? researchOptOut,
      })
      setLastSavedAt(new Date())
      queryClient.invalidateQueries({ queryKey: ['weeks'] })
      if (!silent) toast.success('Draft saved')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not save draft')
    } finally {
      setSaving(false)
    }
  }

  function handleEditorUpdate(content: JSONContent, plainText: string) {
    latestContent.current = content
    setWords(wordCountFromText(plainText))

    if (readOnly) return
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    autosaveTimer.current = setTimeout(() => saveDraft(true), 4000)
  }

  function toggleResearchOptOut() {
    const next = !researchOptOut
    setResearchOptOut(next)
    saveDraft(true, next)
  }

  async function handleSubmit() {
    if (!week) return
    if (words === 0) {
      toast.error('Write something before submitting')
      return
    }
    setSubmitting(true)
    try {
      await api.post(`/diary/${week}/submit`, { content: latestContent.current, researchOptOut })
      toast.success('Diary submitted')
      queryClient.invalidateQueries({ queryKey: ['weeks'] })
      navigate('/previous')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not submit diary')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!week) return
    setDeleting(true)
    try {
      await api.delete(`/diary/${week}`)
      toast.success('Draft deleted')
      queryClient.invalidateQueries({ queryKey: ['weeks'] })
      navigate('/dashboard')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not delete draft')
    } finally {
      setDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pb-16">
      {!readOnly && (
        <div className="flex items-center justify-end gap-2">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {saving && <Loader2 className="size-3 animate-spin" />}
            {saving
              ? 'Saving…'
              : lastSavedAt
                ? `Saved at ${lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : ''}
          </span>
        </div>
      )}

      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-primary/30 text-primary">
            Week {week}
          </Badge>
          {isSubmitted && (
            <Badge className="gap-1">
              <CheckCircle2 className="size-3.5" />
              Submitted
            </Badge>
          )}
          {isLocked && (
            <Badge variant="outline" className="gap-1 border-destructive/30 text-destructive">
              <AlertTriangle className="size-3.5" />
              Missed: deadline passed
            </Badge>
          )}
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Week {week} Diary</h1>
        <p className="text-sm text-muted-foreground">
          {loadedEntry?.entry_date
            ? new Date(loadedEntry.entry_date).toLocaleDateString(undefined, { dateStyle: 'long' })
            : '-'}
        </p>
      </header>

      {isLocked ? (
        <div className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <p>
            The deadline for this week has passed, so it can no longer be edited or submitted. Anything left here
            was not saved after the week closed.
          </p>
        </div>
      ) : (
        <div className="flex items-start gap-2.5 rounded-lg border border-primary/15 bg-primary/5 px-4 py-3 text-sm text-primary">
          <Lock className="mt-0.5 size-4 shrink-0" />
          <p>
            This is your private space. Only you and authorized CMR staff can read it. Write about your
            experiences, thoughts, feelings, meditation practice, learning, or anything you'd like to reflect on.
          </p>
        </div>
      )}

      {loadedEntry && (
        <DiaryEditor
          key={week}
          initialContent={loadedEntry.content ?? EMPTY_DOC}
          editable={!readOnly}
          onUpdate={handleEditorUpdate}
        />
      )}

      <div
        className={cn(
          'flex items-center justify-between gap-3 rounded-lg border bg-muted/30 px-4 py-3',
          readOnly && 'opacity-70'
        )}
      >
        <div className="flex items-center gap-2.5">
          <ShieldOff className="size-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Exclude from research</p>
            <p className="text-xs text-muted-foreground">
              If CMR uses diary data for research, this entry won't be included.
            </p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={researchOptOut}
          disabled={readOnly}
          onClick={toggleResearchOptOut}
          className={cn(
            'relative h-6 w-11 shrink-0 rounded-full transition-colors',
            researchOptOut ? 'bg-primary' : 'bg-muted-foreground/30',
            !readOnly && 'cursor-pointer',
            readOnly && 'pointer-events-none'
          )}
        >
          <span
            className={cn(
              'absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-sm transition-transform',
              researchOptOut && 'translate-x-5'
            )}
          />
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        <span className="text-sm text-muted-foreground">{words} words</span>
        {!readOnly && (
          <div className="flex flex-wrap items-center gap-3">
            {confirmingDelete ? (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Delete this draft?</span>
                <Button variant="ghost" size="sm" onClick={() => setConfirmingDelete(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
                  {deleting ? 'Deleting…' : 'Yes, delete'}
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="ghost"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => setConfirmingDelete(true)}
              >
                <Trash2 className="size-4" />
                Delete Draft
              </Button>
            )}
            <Button variant="outline" onClick={() => saveDraft(false)} disabled={saving}>
              Save Draft
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit Diary'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
