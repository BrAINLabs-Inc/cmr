import { useState } from 'react'
import { Clock, Wind } from 'lucide-react'
import { PublicPageLayout } from './PublicPageLayout'
import { HoverCard, SectionHeading } from './shared'
import { BreathingTimer, BREATHING_TECHNIQUES, type BreathingTechnique } from '@/components/BreathingTimer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CardContent } from '@/components/ui/card'

export function PracticePage() {
  const [selected, setSelected] = useState<BreathingTechnique | null>(null)

  return (
    <PublicPageLayout
      eyebrow="Take a moment"
      title="Meditation Practice"
      description="A short guided breathing exercise you can do right now, no sign-in needed. Pick a technique below and follow the circle for five minutes."
    >
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          {selected ? (
            <div className="rounded-2xl border bg-card px-4 py-8 sm:px-8">
              <BreathingTimer technique={selected} onChangeTechnique={() => setSelected(null)} />
            </div>
          ) : (
            <>
              <SectionHeading
                title="Choose a technique"
                description="Each session runs for 5 minutes. Follow the circle: breathe in as it grows, hold while it's still, and breathe out as it shrinks."
              />

              <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {BREATHING_TECHNIQUES.map((t) => (
                  <HoverCard key={t.id} className="flex flex-col">
                    <CardContent className="flex flex-1 flex-col gap-3 pt-6">
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Wind className="size-5" />
                        </span>
                        <Badge variant="outline" className="font-mono text-xs">
                          {t.pattern}
                        </Badge>
                      </div>
                      <p className="text-lg font-semibold">{t.name}</p>
                      <p className="flex-1 text-sm text-muted-foreground">{t.description}</p>
                      <Button className="mt-2 w-full" onClick={() => setSelected(t)}>
                        Start
                      </Button>
                    </CardContent>
                  </HoverCard>
                ))}
              </div>

              <div className="mt-10 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock className="size-4" />
                Every session is timed to 5 minutes.
              </div>
            </>
          )}
        </div>
      </section>
    </PublicPageLayout>
  )
}
