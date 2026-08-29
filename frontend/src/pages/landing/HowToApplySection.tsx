import { Link } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { Award, ExternalLink } from 'lucide-react'
import type { PublicIntake } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SectionHeading, WaveDivider } from './shared'

const APPLY_STEPS = [
  { title: 'Complete the application', description: 'Fill in the application form with your personal and education details.' },
  {
    title: 'Pay the application fee',
    description: 'Use the account details shown on the form, and keep your payment slip ready to upload.',
  },
  { title: 'Submit your application', description: 'Upload your documents and payment slip, and submit before the closing date.' },
]

export function HowToApplySection({ intake, applyUrl }: { intake: PublicIntake | null; applyUrl: string }) {
  if (!intake || intake.status !== 'open') return null

  return (
    <>
      <WaveDivider flip />
      <section className="bg-muted py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <SectionHeading eyebrow="Applications open" title="How to Apply" />
          <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_auto]">
            <div className="space-y-6">
              {APPLY_STEPS.map((step, i) => (
                <div key={step.title} className="flex gap-4">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-medium">{step.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
              <div className="flex gap-4">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-background text-muted-foreground">
                  <Award className="size-4" />
                </div>
                <div>
                  <p className="font-medium">Selection Method</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Candidates will be selected based on an interview following an initial review of applications.
                  </p>
                </div>
              </div>
              <Button size="lg" asChild className="mt-2">
                <Link to="/apply">
                  Open Application Form
                  <ExternalLink className="size-4" />
                </Link>
              </Button>
            </div>

            <Card className="h-fit">
              <CardContent className="flex flex-col items-center gap-3 pt-6">
                <div className="rounded-lg border bg-white p-3">
                  <QRCodeSVG value={applyUrl} size={144} />
                </div>
                <p className="text-center text-xs text-muted-foreground">Scan to open the application form</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  )
}
