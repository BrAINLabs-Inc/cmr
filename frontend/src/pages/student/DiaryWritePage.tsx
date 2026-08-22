import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, CheckCircle2, Loader2, NotebookText, Sparkles } from 'lucide-react'
import { api, ApiError } from '@/lib/api'
import type { DiaryEntry } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'

function wordCount(text: string) {
  const trimmed = text.trim()
  return trimmed === '' ? 0 : trimmed.split(/\s+/).length
}

export function DiaryWritePage() {
  const { week } = useParams<{ week: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['diary', week],
    queryFn: () => api.get<{ entry: DiaryEntry }>(`/diary/${week}`),
  })

  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const loadedEntry = data?.entry

  useEffect(() => {
    if (loadedEntry) setContent(loadedEntry.content)
  }, [loadedEntry])

  const isSubmitted = loadedEntry?.status === 'submitted'

  async function saveDraft(silent = false) {
    if (!week || isSubmitted) return
    setSaving(true)
    try {
      await api.put(`/diary/${week}`, { content })
      setLastSavedAt(new Date())
      queryClient.invalidateQueries({ queryKey: ['weeks'] })
      if (!silent) toast.success('Draft saved')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not save draft')
    } finally {
      setSaving(false)
    }
  }

  // Auto-save a few seconds after the student stops typing.
  useEffect(() => {
    if (isSubmitted || !loadedEntry) return
    if (content === loadedEntry.content) return
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    autosaveTimer.current = setTimeout(() => saveDraft(true), 4000)
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content])

  async function handleSubmit() {
    if (!week) return
    if (content.trim() === '') {
      toast.error('Write something before submitting')
      return
    }
    setSubmitting(true)
    try {
      await api.post(`/diary/${week}/submit`, { content })
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
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to dashboard
      </Link>

      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <NotebookText className="size-5 text-primary" />
              <CardTitle>Week {week} — Weekly Diary</CardTitle>
            </div>
            {isSubmitted && (
              <Badge className="gap-1">
                <CheckCircle2 className="size-3.5" />
                Submitted
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Date: {loadedEntry?.entry_date ? new Date(loadedEntry.entry_date).toLocaleDateString(undefined, { dateStyle: 'long' }) : '—'}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Sparkles className="size-4" />
            <AlertDescription>
              Use this space as your personal weekly diary. You may write about your thoughts, feelings,
              experiences, meditation practice, learning, challenges, changes you noticed, or anything else
              you would like to reflect on during the week.
            </AlertDescription>
          </Alert>

          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            readOnly={isSubmitted}
            rows={16}
            placeholder="Write about your experiences this week…"
            className="resize-y text-[15px] leading-relaxed"
          />

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{wordCount(content)} words</span>
            {!isSubmitted && (
              <span className="flex items-center gap-1.5">
                {saving && <Loader2 className="size-3.5 animate-spin" />}
                {saving ? 'Saving…' : lastSavedAt ? `Saved at ${lastSavedAt.toLocaleTimeString()}` : ''}
              </span>
            )}
          </div>

          {!isSubmitted && (
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => saveDraft(false)} disabled={saving}>
                Save Draft
              </Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit Diary'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
