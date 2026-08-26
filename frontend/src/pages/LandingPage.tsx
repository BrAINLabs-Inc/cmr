import type { ComponentType, ReactNode } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BarChart3,
  Brain,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flower2,
  GraduationCap,
  Heart,
  Leaf,
  Lock,
  Mail,
  MapPin,
  NotebookPen,
  Palette,
  PenLine,
  Save,
  Scale,
  ShieldCheck,
  Sparkles,
  Wallet,
  Wind,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import cmrLogo from '@/assets/cmr-logo.png'

const HOME_ILLUSTRATION = '/vectors/home1.webp'
const COURSE_TITLE = 'Translating the Science of Happiness and Meditation into Practice'
const REGISTRATION_URL = 'https://forms.gle/QtLDVkx5Q4vnW4ot7'
const CMR_WEBSITE = 'https://med.cmb.ac.lk/cmr/'
const ACADEMIC_PROGRAMME_URL = 'https://med.cmb.ac.lk/academic-programs/tshmp/'
const CONTACT_EMAIL = 'cmr@med.cmb.ac.lk'

const MODULES = [
  'Emotions and emotionally driven actions',
  'Science of happiness into practice',
  'Science of meditation into practice',
  'Creativity, art and drama in happiness',
  'The science of happiness and meditation into practice',
  'Wisdom, morality and well-being',
]

const OBJECTIVES = [
  'Create awareness of the science of happiness and meditation.',
  'Explore the methods used to create happiness along with the scientific basis.',
  'Know the effects of meditation on total well-being.',
  'Understand and practice different methods of meditation.',
  'Promote translating the knowledge of the science of happiness and meditation into practice.',
]

const FACTS: { label: string; value: string; icon: ComponentType<{ className?: string }> }[] = [
  { label: 'Duration', value: '08 Months, Part-time', icon: Clock },
  { label: 'Mode', value: 'Hybrid', icon: MapPin },
  { label: 'Course Fee', value: 'Free of Charge', icon: Wallet },
  { label: 'Lectures', value: 'Saturdays, 9am–4pm', icon: Calendar },
]

const APPLY_STEPS = [
  { title: 'Access the form', description: 'Click "Apply Now" or scan the QR code to open the registration form.' },
  {
    title: 'Pay the application fee',
    description: 'Use the account details provided in the form, and keep your payment slip ready to upload.',
  },
  { title: 'Submit your application', description: 'Duly complete the registration form and submit it before the closing date.' },
]

const FEATURES: { title: string; description: string; icon: ComponentType<{ className?: string }> }[] = [
  {
    title: 'A weekly space to reflect',
    description: "A dedicated page opens each week for free-form writing about your experiences, thoughts, and practice, with no rigid format required.",
    icon: PenLine,
  },
  {
    title: 'Never lose a draft',
    description: 'Your writing autosaves as you go, so a closed tab or a dropped connection never costs you your reflection.',
    icon: Save,
  },
  {
    title: 'Private by design',
    description: 'Entries are visible only to you and authorized CMR staff, never to other students, and never public.',
    icon: ShieldCheck,
  },
  {
    title: 'Track your journey',
    description: "See every week at a glance: what's open, what's submitted, and what still needs your attention.",
    icon: BarChart3,
  },
]

function SectionHeading({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      {eyebrow && <p className="text-sm font-medium text-primary">{eyebrow}</p>}
      <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
      {description && <p className="mt-3 text-muted-foreground">{description}</p>}
    </div>
  )
}

function WaveDivider({ flip }: { flip?: boolean }) {
  return (
    <div aria-hidden className={cn('relative h-12 w-full overflow-hidden bg-background sm:h-16', flip && 'bg-muted')}>
      <svg
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
        className={cn('absolute inset-0 h-full w-full text-muted', flip && 'text-background')}
      >
        <path d="M0,40 C280,95 520,10 760,35 C1020,62 1200,12 1440,45 L1440,100 L0,100 Z" fill="currentColor" />
      </svg>
    </div>
  )
}

function HoverCard({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <Card className={cn('transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/5', className)}>
      {children}
    </Card>
  )
}

export function LandingPage() {
  const { loading, session, role } = useAuth()

  if (!loading && session && role) {
    return <Navigate to={role === 'admin' ? '/admin' : '/dashboard'} replace />
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <img src={cmrLogo} alt="Centre for Meditation Research" className="size-8 rounded-full" />
            <span className="text-sm font-semibold tracking-tight sm:text-base">Centre for Meditation Research</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <a href={REGISTRATION_URL} target="_blank" rel="noopener noreferrer">
                Apply Now
              </a>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-0 [background-image:radial-gradient(var(--border)_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.35]" />
            <div className="absolute -top-40 left-[8%] aspect-square w-[36rem] rounded-full bg-primary/20 opacity-70 blur-3xl" />
            <div className="absolute top-10 right-[4%] aspect-square w-[26rem] rounded-full bg-emerald-400/10 blur-3xl" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
          </div>

          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:gap-16">
            <div className="text-center lg:text-left">
              <div className="mb-6 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                <Badge className="gap-1.5 rounded-full px-3 py-1">
                  <span className="size-1.5 rounded-full bg-primary-foreground" />
                  03rd Intake · Now On
                </Badge>
                <Badge variant="outline" className="rounded-full px-3 py-1 text-amber-700 dark:text-amber-400">
                  Closing Date Extended: 01st June 2026
                </Badge>
              </div>

              <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">Certificate Course</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-5xl">{COURSE_TITLE}</h1>
              <svg
                aria-hidden
                viewBox="0 0 200 12"
                className="mx-auto mt-3 h-3 w-40 text-primary/40 lg:mx-0"
                preserveAspectRatio="none"
              >
                <path d="M2,8 C40,0 70,10 100,6 C130,2 160,10 198,4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
              <p className="mx-auto mt-5 max-w-2xl text-balance text-muted-foreground sm:text-lg lg:mx-0">
                Centre for Meditation Research · Faculty of Medicine · University of Colombo
              </p>
              <p className="mt-2 text-sm text-muted-foreground">Funded by the Rekhi Foundation for Happiness</p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
                <Button size="lg" asChild>
                  <a href={REGISTRATION_URL} target="_blank" rel="noopener noreferrer">
                    Apply Now
                    <ArrowRight className="size-4" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/login">Already enrolled? Sign in to your diary</Link>
                </Button>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div aria-hidden className="pointer-events-none absolute inset-8 -z-10 rounded-full bg-primary/10 blur-3xl" />

              <img src={HOME_ILLUSTRATION} alt="" className="mx-auto w-full max-w-md" />

              <div
                aria-hidden
                className="animate-float absolute top-2 -left-2 flex size-12 items-center justify-center rounded-2xl border border-primary/20 bg-background/90 text-primary shadow-sm backdrop-blur sm:-left-6"
                style={{ animationDelay: '0s', animationDuration: '6s' }}
              >
                <Flower2 className="size-6" />
              </div>
              <div
                aria-hidden
                className="animate-float absolute top-8 right-2 flex size-11 items-center justify-center rounded-2xl border border-primary/20 bg-background/90 text-primary shadow-sm backdrop-blur sm:right-0"
                style={{ animationDelay: '1.1s', animationDuration: '7s' }}
              >
                <Leaf className="size-5" />
              </div>
              <div
                aria-hidden
                className="animate-float absolute bottom-4 left-6 flex size-12 items-center justify-center rounded-2xl border border-primary/20 bg-background/90 text-primary shadow-sm backdrop-blur sm:left-10"
                style={{ animationDelay: '0.6s', animationDuration: '6.5s' }}
              >
                <Wind className="size-6" />
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {FACTS.map((fact) => (
                <HoverCard key={fact.label}>
                  <CardContent className="flex flex-col items-center gap-2.5 pt-6 text-center">
                    <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <fact.icon className="size-5" />
                    </div>
                    <p className="text-sm font-medium">{fact.value}</p>
                    <p className="text-xs text-muted-foreground">{fact.label}</p>
                  </CardContent>
                </HoverCard>
              ))}
            </div>
          </div>
        </section>

        <WaveDivider flip />

        <section className="bg-muted py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionHeading eyebrow="Curriculum" title="Course Modules" description="The course comprises six modules." />
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {MODULES.map((module, i) => {
                const icons = [Heart, Sparkles, Brain, Palette, GraduationCap, Scale]
                const Icon = icons[i] ?? BadgeCheck
                return (
                  <HoverCard key={module} className="relative overflow-visible">
                    <div className="absolute -top-3 -left-3 flex size-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground shadow-sm">
                      {i + 1}
                    </div>
                    <CardContent className="flex gap-4 pt-6">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="size-5" />
                      </div>
                      <p className="font-medium">{module}</p>
                    </CardContent>
                  </HoverCard>
                )
              })}
            </div>
          </div>
        </section>

        <WaveDivider />

        <section className="py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <SectionHeading eyebrow="Why this course" title="General Objectives" />
            <div className="relative mt-10 space-y-6 pl-2">
              <div aria-hidden className="absolute top-1 bottom-1 left-[15px] w-px bg-border" />
              {OBJECTIVES.map((objective) => (
                <div key={objective} className="relative flex gap-4">
                  <div className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background text-primary">
                    <CheckCircle2 className="size-4" />
                  </div>
                  <span className="pt-1 text-muted-foreground">{objective}</span>
                </div>
              ))}
            </div>
            <p className="mt-8 text-sm text-muted-foreground">
              Successful participants will develop skills, attitudes and attributes to enhance their efficiency,
              productivity and cohesiveness. The knowledge and skills will contribute to their sustainability in the
              pathway for physical and spiritual development. The certificate would be a recognition for achieving
              such status.
            </p>
          </div>
        </section>

        <WaveDivider flip />

        <section className="bg-muted py-20">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-2">
            <HoverCard>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <GraduationCap className="size-5 text-primary" />
                  <h3 className="text-lg font-semibold">Who Can Apply?</h3>
                </div>
                <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                  <li>Academics, administrators, researchers in relevant fields and interested professionals.</li>
                  <li>Candidates should have a degree from a recognized university in Sri Lanka or abroad.</li>
                </ul>
                <div className="mt-4 rounded-lg border bg-background p-3 text-sm">
                  <p className="font-medium">Special Category</p>
                  <p className="mt-1 text-muted-foreground">
                    Undergraduate students already registered for a degree programme at a recognized university in
                    Sri Lanka or abroad.
                  </p>
                </div>
              </CardContent>
            </HoverCard>

            <HoverCard>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Clock className="size-5 text-primary" />
                  <h3 className="text-lg font-semibold">Duration &amp; Mode</h3>
                </div>
                <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                  <li>08 months, part-time (July 2026 to March 2027).</li>
                  <li>Includes a 2-day residential meditation retreat.</li>
                  <li>Hybrid: primarily onsite, with selected online sessions.</li>
                  <li>Online sessions are available for foreign participants.</li>
                </ul>
                <div className="mt-4 flex items-center gap-2 rounded-lg border bg-background p-3 text-sm">
                  <Calendar className="size-4 shrink-0 text-primary" />
                  <span>Commencing <span className="font-medium text-foreground">11th July 2026</span></span>
                </div>
              </CardContent>
            </HoverCard>
          </div>
        </section>

        <WaveDivider />

        <section className="py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <SectionHeading eyebrow="Cost" title="Fees" />
            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              <HoverCard className="border-primary/30 bg-primary/5">
                <CardContent className="pt-6">
                  <Wallet className="size-5 text-primary" />
                  <p className="mt-3 font-medium">Course Fee</p>
                  <p className="mt-1 text-2xl font-semibold">Free</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    LKR 50,000 sponsored per participant by the Rekhi Foundation.
                  </p>
                </CardContent>
              </HoverCard>
              <HoverCard>
                <CardContent className="pt-6">
                  <Wallet className="size-5 text-primary" />
                  <p className="mt-3 font-medium">Application Fee</p>
                  <p className="mt-1 text-sm text-muted-foreground">Locals: LKR 1,000</p>
                  <p className="text-sm text-muted-foreground">Foreigners: USD 5</p>
                  <p className="mt-2 text-xs text-muted-foreground">Non-refundable</p>
                </CardContent>
              </HoverCard>
              <HoverCard>
                <CardContent className="pt-6">
                  <Wallet className="size-5 text-primary" />
                  <p className="mt-3 font-medium">Registration Fee</p>
                  <p className="mt-1 text-sm text-muted-foreground">Locals: LKR 10,000</p>
                  <p className="text-sm text-muted-foreground">Foreigners: USD 50</p>
                </CardContent>
              </HoverCard>
            </div>
          </div>
        </section>

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
                  <a href={REGISTRATION_URL} target="_blank" rel="noopener noreferrer">
                    Open Registration Form
                    <ExternalLink className="size-4" />
                  </a>
                </Button>
              </div>

              <Card className="h-fit">
                <CardContent className="flex flex-col items-center gap-3 pt-6">
                  <div className="rounded-lg border bg-white p-3">
                    <QRCodeSVG value={REGISTRATION_URL} size={144} />
                  </div>
                  <p className="text-center text-xs text-muted-foreground">Scan to open the registration form</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <WaveDivider />

        <section className="py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionHeading
              eyebrow="For enrolled students"
              title="Your Weekly Digital Diary"
              description="Once you're part of the course, this portal is where you'll keep a private weekly reflection throughout the programme."
            />
            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              {FEATURES.map((feature) => (
                <HoverCard key={feature.title}>
                  <CardContent className="flex gap-4 pt-6">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <feature.icon className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">{feature.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </CardContent>
                </HoverCard>
              ))}
            </div>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" variant="outline" asChild>
                <Link to="/login">
                  <Lock className="size-4" />
                  Sign in to your diary
                </Link>
              </Button>
              <Button size="lg" variant="ghost" asChild>
                <Link to="/register">
                  First time here? Create your account
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden border-t py-16">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 flex justify-center">
            <div className="aspect-square w-[28rem] rounded-full bg-primary/10 blur-3xl" />
          </div>
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <svg viewBox="0 0 64 64" className="mx-auto size-14 text-primary" aria-hidden>
              <circle cx="32" cy="32" r="30" fill="currentColor" opacity="0.1" />
              <path
                d="M32 14 L47 21 V31 C47 40 40.5 47.5 32 50 C23.5 47.5 17 40 17 31 V21 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <path
                d="M25 31.5 L30 36.5 L39.5 26.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h2 className="mt-5 text-2xl font-semibold tracking-tight">Your entries are confidential</h2>
            <p className="mt-3 text-muted-foreground">
              Diary entries are only accessible to you and authorized CMR administrators or research personnel,
              never to other students, and never used or shared without appropriate consent.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t bg-muted py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left">
            <div>
              <div className="flex items-center justify-center gap-2.5 sm:justify-start">
                <img src={cmrLogo} alt="" className="size-8 rounded-full" />
                <span className="font-semibold">Centre for Meditation Research</span>
              </div>
              <p className="mt-2 max-w-sm text-xs text-muted-foreground">
                Faculty of Medicine, University of Colombo
              </p>
            </div>

            <div className="flex flex-col items-center gap-1.5 text-sm sm:items-start">
              <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
                <Mail className="size-4" />
                {CONTACT_EMAIL}
              </a>
              <a
                href={CMR_WEBSITE}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="size-4" />
                med.cmb.ac.lk/cmr
              </a>
              <a
                href={ACADEMIC_PROGRAMME_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <NotebookPen className="size-4" />
                Academic programme page
              </a>
            </div>
          </div>

          <p className="mt-8 border-t pt-6 text-center text-xs text-muted-foreground">
            Certificate Course on {COURSE_TITLE}
          </p>
        </div>
      </footer>
    </div>
  )
}
