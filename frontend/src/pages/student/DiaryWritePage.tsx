import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { JSONContent } from '@tiptap/core'
import { AlertTriangle, CheckCircle2, Loader2, Sparkles } from 'lucide-react'
import { api, ApiError } from '@/lib/api'
import type { DiaryEntry } from '@/lib/types'
import { EMPTY_DOC } from '@/lib/tiptap'
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
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (loadedEntry) setWords(loadedEntry.word_count)
  }, [loadedEntry])

  async function saveDraft(silent = false) {
    if (!week || readOnly) return
    setSaving(true)
    try {
      await api.put(`/diary/${week}`, { content: latestContent.current })
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

  async function handleSubmit() {
    if (!week) return
    if (words === 0) {
      toast.error('Write something before submitting')
      return
    }
    setSubmitting(true)
    try {
      await api.post(`/diary/${week}/submit`, { content: latestContent.current })
      toast.success('Diary submitted')
      queryClient.invalidateQueries({ queryKey: ['weeks'] })
      navigate('/previous')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not submit diary')
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-4 py-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 pb-16">
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
          <Sparkles className="mt-0.5 size-4 shrink-0" />
          <p>
            This is your personal space. Write about your experiences, thoughts, feelings, meditation
            practice, learning, challenges, or anything you would like to reflect on during the week.
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

      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        <span className="text-sm text-muted-foreground">{words} words</span>
        {!readOnly && (
          <div className="flex gap-3">
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
