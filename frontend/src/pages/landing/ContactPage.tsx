import type { ReactNode } from 'react'
import { ExternalLink, Mail, MapPin, Phone, Printer } from 'lucide-react'
import {
  CMR_ADDRESS,
  CMR_EMAIL,
  CMR_FAX,
  CMR_MAP_URL,
  CMR_PHONE_NUMBERS,
  CMR_PROJECT_MANAGER_EMAIL,
  CMR_TWITTER_URL,
  CMR_YOUTUBE_URL,
} from '@/lib/cmr-org-info'
import { PublicPageLayout } from './PublicPageLayout'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const MAP_EMBED_SRC = `https://www.google.com/maps?q=${encodeURIComponent(CMR_ADDRESS)}&output=embed`

function ContactRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof MapPin
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4" />
      </div>
      <div>
        <p className="text-sm font-medium">{label}</p>
        <div className="mt-0.5 text-sm text-muted-foreground">{children}</div>
      </div>
    </div>
  )
}

export function ContactPage() {
  return (
    <PublicPageLayout
      eyebrow="Get in touch"
      title="Contact Us"
      description="Reach the Centre for Meditation Research at the Faculty of Medicine, University of Colombo."
    >
      <section className="py-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-6">
            <ContactRow icon={MapPin} label="Address">
              <a href={CMR_MAP_URL} target="_blank" rel="noopener noreferrer" className="hover:text-foreground hover:underline">
                {CMR_ADDRESS}
              </a>
            </ContactRow>

            <ContactRow icon={Phone} label="Phone">
              {CMR_PHONE_NUMBERS.map((number) => (
                <p key={number}>{number}</p>
              ))}
            </ContactRow>

            <ContactRow icon={Printer} label="Fax">
              {CMR_FAX}
            </ContactRow>

            <Separator />

            <ContactRow icon={Mail} label="General Enquiries">
              <a href={`mailto:${CMR_EMAIL}`} className="text-primary hover:underline">
                {CMR_EMAIL}
              </a>
            </ContactRow>

            <ContactRow icon={Mail} label="Project Manager">
              <a href={`mailto:${CMR_PROJECT_MANAGER_EMAIL}`} className="text-primary hover:underline">
                {CMR_PROJECT_MANAGER_EMAIL}
              </a>
            </ContactRow>

            <Separator />

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href={CMR_TWITTER_URL} target="_blank" rel="noopener noreferrer">
                  Twitter / X
                  <ExternalLink className="size-3.5" />
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={CMR_YOUTUBE_URL} target="_blank" rel="noopener noreferrer">
                  YouTube
                  <ExternalLink className="size-3.5" />
                </a>
              </Button>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="min-h-72 flex-1 overflow-hidden rounded-lg border">
              <iframe
                title="CMR location map"
                src={MAP_EMBED_SRC}
                className="size-full min-h-72"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <a
              href={CMR_MAP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-1.5 text-sm text-primary hover:underline"
            >
              Open in Google Maps
              <ExternalLink className="size-3.5" />
            </a>
          </div>
        </div>
      </section>
    </PublicPageLayout>
  )
}
