import { Angry, Frown, Laugh, Meh, Smile, type LucideIcon } from 'lucide-react'
import type { MoodFeeling } from '@/lib/types'

export const MOOD_OPTIONS: { value: MoodFeeling; label: string; icon: LucideIcon; className: string }[] = [
  { value: 'very_good', label: 'Very good', icon: Laugh, className: 'text-emerald-600 dark:text-emerald-400' },
  { value: 'good', label: 'Good', icon: Smile, className: 'text-lime-600 dark:text-lime-400' },
  { value: 'okay', label: 'Okay', icon: Meh, className: 'text-amber-600 dark:text-amber-400' },
  { value: 'not_great', label: 'Not great', icon: Frown, className: 'text-orange-600 dark:text-orange-400' },
  { value: 'difficult', label: 'Difficult week', icon: Angry, className: 'text-rose-600 dark:text-rose-400' },
]

export const MOOD_LABELS: Record<MoodFeeling, string> = Object.fromEntries(
  MOOD_OPTIONS.map((m) => [m.value, m.label])
) as Record<MoodFeeling, string>

export function moodIcon(feeling: MoodFeeling | undefined) {
  return MOOD_OPTIONS.find((m) => m.value === feeling)?.icon ?? Meh
}

export function moodClassName(feeling: MoodFeeling | undefined) {
  return MOOD_OPTIONS.find((m) => m.value === feeling)?.className ?? 'text-muted-foreground'
}
