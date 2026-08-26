import type { ComponentType } from 'react'
import { CircleHelp, HeartHandshake, History, LayoutDashboard, Lock, Mail, NotebookPen, User } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const FEATURES: { title: string; description: string; icon: ComponentType<{ className?: string }> }[] = [
  {
    title: 'Dashboard',
    description: "This week's prompt, your progress, and a quick way to start writing.",
    icon: LayoutDashboard,
  },
  {
    title: 'Write Diary',
    description: 'A rich text editor for this week\'s reflection. Drafts autosave as you type.',
    icon: NotebookPen,
  },
  {
    title: 'Weekly Check-in',
    description: 'Optional: meditation log, mood, gratitude, and a weekly intention.',
    icon: HeartHandshake,
  },
  {
    title: 'Previous Entries',
    description: 'Every week at a glance, with its status, so you can look back anytime.',
    icon: History,
  },
  {
    title: 'Your Profile',
    description: 'Click the icon in the top-right corner of any page to see your account.',
    icon: User,
  },
]

const STEPS = [
  'A new week opens automatically, every 7 days.',
  'Write when you can. Drafts autosave, and you can save manually too.',
  'Submit when ready. Submitted entries lock, so review before you do.',
]

export function HelpPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <CircleHelp className="size-5 text-primary" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Help &amp; Guidelines</h1>
          <p className="text-sm text-muted-foreground">A quick tour of your Weekly Digital Diary.</p>
        </div>
      </div>

      <Card>
        <CardContent className="space-y-3 pt-6">
          {STEPS.map((step, i) => (
            <div key={step} className="flex items-start gap-3">
              <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {i + 1}
              </div>
              <p className="text-sm text-muted-foreground">{step}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {FEATURES.map((feature) => (
          <Card key={feature.title}>
            <CardContent className="flex gap-3 pt-6">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <feature.icon className="size-4" />
              </div>
              <div>
                <h3 className="text-sm font-medium">{feature.title}</h3>
                <p className="mt-0.5 text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-start gap-3 pt-6">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Lock className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-medium">Your diary is private</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Entries are visible only to you and authorized CMR staff, never other students. You can also mark
              any entry as excluded from research, right from within that entry.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-start gap-3 pt-6">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Mail className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-medium">Still need help?</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Reach out anytime at{' '}
              <a href="mailto:cmr@med.cmb.ac.lk" className="font-medium text-primary underline underline-offset-4">
                cmr@med.cmb.ac.lk
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
