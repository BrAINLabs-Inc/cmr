import { Link } from 'react-router-dom'
import { ArrowRight, Calendar, ExternalLink, GraduationCap, MapPin, MessageCircle, PlayCircle, Wallet } from 'lucide-react'
import { PublicPageLayout } from './PublicPageLayout'
import { HoverCard } from './shared'
import { Button } from '@/components/ui/button'
import { CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function ServicesPage() {
  return (
    <PublicPageLayout
      eyebrow="What we offer"
      title="Services"
      description="From free weekly sessions open to everyone, to a structured certificate course, CMR offers several ways to bring meditation research into practice."
    >
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <HoverCard className="overflow-hidden">
              <img
                src="https://med.cmb.ac.lk/wp-content/uploads/2024/05/1140x400-Meditation.jpg"
                alt="Meditation Programme"
                className="h-40 w-full object-cover"
              />
              <CardContent className="pt-6">
                <Badge variant="outline">Free · On-site &amp; Online</Badge>
                <p className="mt-3 text-lg font-semibold">Meditation Programme</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Structured meditation instruction responding to pandemic-era psychological distress, with regular
                  retreats and sessions conducted by experienced instructors for students, academics, and
                  non-academics at the University of Colombo.
                </p>
                <a
                  href="https://youtu.be/-TqfZPHuXcs?si=4REHG950q6l8ORRs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  <PlayCircle className="size-4" />
                  Watch recorded sessions
                </a>
              </CardContent>
            </HoverCard>

            <HoverCard className="overflow-hidden">
              <img
                src="https://med.cmb.ac.lk/wp-content/uploads/2024/06/1140x400-Meditation-1.jpg"
                alt="Weekly Meditation Session"
                className="h-40 w-full object-cover"
              />
              <CardContent className="pt-6">
                <Badge variant="outline">Free · Open to all</Badge>
                <p className="mt-3 text-lg font-semibold">Weekly Meditation Session</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  A guided meditation session conducted by Prof. Wasantha Gunathunga to manage stress, find inner
                  peace, and improve mental function while cultivating self-awareness and compassion.
                </p>
                <div className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                  <p className="flex items-center gap-1.5">
                    <Calendar className="size-4 shrink-0" />
                    Every Thursday, 12:30 PM
                  </p>
                  <a
                    href="https://maps.app.goo.gl/JCPHs5e5rComYU5j7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 hover:text-foreground"
                  >
                    <MapPin className="size-4 shrink-0" />
                    CMR, Old Anatomy Building, No. 25, Kynsey Road, Colombo 08
                  </a>
                </div>
              </CardContent>
            </HoverCard>

            <HoverCard className="overflow-hidden">
              <img
                src="https://med.cmb.ac.lk/wp-content/uploads/2024/07/652e124e7a0c9-bannerImage-1.jpg"
                alt="චිත්තාවකාශ (Mind Space)"
                className="h-40 w-full object-cover"
              />
              <CardContent className="pt-6">
                <Badge variant="outline">Sinhala · Via Zoom</Badge>
                <p className="mt-3 text-lg font-semibold">චිත්තාවකාශ (Mind Space)</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Philosophical and scientific discussions paired with meditation practice, coordinated by meditation
                  instructor Upul Nishantha Gamage.
                </p>
                <div className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                  <p className="flex items-center gap-1.5">
                    <Calendar className="size-4 shrink-0" />
                    Third Saturday of each month, 4:00 PM
                  </p>
                  <a
                    href="https://chat.whatsapp.com/Etst0pBO588EA8t5UTvaLE"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-primary hover:underline"
                  >
                    <MessageCircle className="size-4 shrink-0" />
                    Join the WhatsApp group
                  </a>
                </div>
              </CardContent>
            </HoverCard>

            <HoverCard className="overflow-hidden border-primary/30">
              <img
                src="https://med.cmb.ac.lk/wp-content/uploads/2024/09/Certificate-course-on.jpg"
                alt="Certificate Course on Translating the Science of Happiness and Meditation into Practice"
                className="h-40 w-full object-cover"
              />
              <CardContent className="pt-6">
                <Badge className="gap-1">
                  <GraduationCap className="size-3" />
                  Certificate Course
                </Badge>
                <p className="mt-3 text-lg font-semibold">Translating the Science of Happiness and Meditation into Practice</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  A six-month professional development programme (150 direct teaching hours, 10 credits) for degree
                  holders (administrators, professionals, academics, postgraduate students, and teachers), held on
                  Saturdays, 9:00 AM–4:00 PM.
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Wallet className="size-4 shrink-0" />
                  Free of charge, funded by the Rekhi Foundation for Happiness
                </div>
                <Button asChild className="mt-4">
                  <Link to="/apply">
                    See current intake &amp; apply
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </CardContent>
            </HoverCard>
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/20 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <p className="text-sm font-medium text-primary">Recordings</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Watch past sessions</h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Recorded meditation sessions and past programme content are available on CMR's YouTube channel.
          </p>
          <Button variant="outline" asChild className="mt-6">
            <a href="https://www.youtube.com/channel/UCZmjXEkSf9HCf7wTSTzfcEg" target="_blank" rel="noopener noreferrer">
              Open YouTube Channel
              <ExternalLink className="size-4" />
            </a>
          </Button>
        </div>
      </section>
    </PublicPageLayout>
  )
}
