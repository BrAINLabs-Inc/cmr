import type { ComponentType } from 'react'
import {
  Bold,
  CalendarCheck2,
  CircleHelp,
  History,
  LayoutDashboard,
  Lock,
  NotebookPen,
  Sparkles,
  User,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const STEPS: { title: string; description: string }[] = [
  {
    title: 'A new week opens automatically',
    description:
      "CMR sets the course calendar, and a fresh week opens for writing every 7 days. You'll always see the current week highlighted on your Dashboard.",
  },
  {
    title: 'Write freely, save as you go',
    description:
      "Head to Write Diary and reflect on your experiences, thoughts, feelings, meditation practice, or anything else on your mind that week. Your draft autosaves a few seconds after you stop typing. You can also save manually at any time.",
  },
  {
    title: 'Submit when you’re ready',
    description:
      'Once you’re happy with an entry, submit it. Submitted entries are locked for editing, so take your time with drafts before you do.',
  },
  {
    title: 'Look back whenever you like',
    description:
      'My Entries lists every week you’ve written or been asked to write, with its status at a glance: submitted, drafted, or not yet started.',
  },
]

const FEATURES: { title: string; description: string; icon: ComponentType<{ className?: string }> }[] = [
  {
    title: 'Dashboard',
    description: "Your home base: see this week's prompt, your CTA to start writing, and a progress snapshot across all open weeks.",
    icon: LayoutDashboard,
  },
  {
    title: 'Write Diary',
    description:
      'A distraction-free editor with rich formatting (bold, italics, underline, bullet and numbered lists, quotes, dividers, links, and text alignment) so you can write the way that feels natural.',
    icon: NotebookPen,
  },
  {
    title: 'My Entries',
    description: 'A running history of every week, submitted or not, so you can revisit past reflections at any time.',
    icon: History,
  },
  {
    title: 'Your Profile',
    description: 'Click the profile icon in the top-right corner of any page to see your account details: name, email, and student ID.',
    icon: User,
  },
]

const FAQ: { question: string; answer: string }[] = [
  {
    question: 'Can I edit an entry after I submit it?',
    answer: 'No. Submitting locks that week’s entry. Make sure you’re happy with it first; saving a draft never locks anything.',
  },
  {
    question: 'What happens if I miss a week?',
    answer:
      'The week stays visible in My Entries as "Not submitted." You can still open and write it any time while it remains part of the open course weeks.',
  },
  {
    question: 'Who can read my diary?',
    answer: 'Only you and authorized CMR staff, never other students, and never shared publicly without your consent.',
  },
  {
    question: 'Do I need to write a certain amount?',
    answer: 'No minimum or maximum. Write as much or as little as genuinely reflects your week. A live word count sits under the editor if you’re curious.',
  },
]

export function HelpPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <CircleHelp className="size-5 text-primary" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Help &amp; Guidelines</h1>
          <p className="text-sm text-muted-foreground">A quick introduction to your Weekly Digital Diary and how it works.</p>
        </div>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex flex-col items-start gap-3 pt-6 sm:flex-row sm:items-center">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="size-5" />
          </div>
          <div>
            <p className="font-medium">Welcome to your Weekly Digital Diary</p>
            <p className="mt-1 text-sm text-muted-foreground">
              A private, weekly space to reflect on your experiences throughout the course: your thoughts, feelings,
              meditation practice, and anything else worth writing down. Here's how it all fits together.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CalendarCheck2 className="size-4 text-primary" />
          <h2 className="text-lg font-semibold tracking-tight">How it works</h2>
        </div>
        <div className="space-y-3">
          {STEPS.map((step, i) => (
            <div key={step.title} className="flex gap-4 rounded-lg border p-4">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {i + 1}
              </div>
              <div>
                <p className="font-medium">{step.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Bold className="size-4 text-primary" />
          <h2 className="text-lg font-semibold tracking-tight">Where everything is</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <Card key={feature.title}>
              <CardContent className="flex gap-4 pt-6">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="size-5" />
                </div>
                <div>
                  <h3 className="font-medium">{feature.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Lock className="size-4 text-primary" />
          <h2 className="text-lg font-semibold tracking-tight">Frequently asked questions</h2>
        </div>
        <Card>
          <CardContent className="divide-y pt-6">
            {FAQ.map((item) => (
              <div key={item.question} className="py-4 first:pt-0 last:pb-0">
                <p className="font-medium">{item.question}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.answer}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Still need help?</CardTitle>
          <CardDescription>Reach out to the Centre for Meditation Research directly. We're happy to help.</CardDescription>
        </CardHeader>
        <CardContent>
          <a href="mailto:cmr@med.cmb.ac.lk" className="text-sm font-medium text-primary underline underline-offset-4">
            cmr@med.cmb.ac.lk
          </a>
        </CardContent>
      </Card>
    </div>
  )
}
