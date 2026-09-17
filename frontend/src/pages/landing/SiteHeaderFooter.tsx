import { Link, NavLink } from 'react-router-dom'
import { ExternalLink, Mail, Menu, MapPin, NotebookPen, Phone } from 'lucide-react'
import {
  CMR_ACADEMIC_PROGRAMME_URL,
  CMR_ADDRESS,
  CMR_EMAIL,
  CMR_MAP_URL,
  CMR_PHONE_NUMBERS,
  CMR_SHORT_NAME,
  CMR_TWITTER_URL,
  CMR_WEBSITE_URL,
  CMR_YOUTUBE_URL,
} from '@/lib/cmr-org-info'
import { Button } from '@/components/ui/button'
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import cmrLogo from '@/assets/cmr-logo.png'
import brainLabsIcon from '@/assets/brainlabs-icon.webp'

// Board Members / Research / Services / Archives / Contact are temporarily
// down on this site, so those nav entries point out to the live pages on
// med.cmb.ac.lk instead of local routes.
export const PUBLIC_NAV = [
  { label: 'Home', to: '/', external: false },
  { label: 'Practice', to: '/practice', external: false },
  { label: 'Board Members', to: 'https://med.cmb.ac.lk/cmr/board-members/', external: true },
  { label: 'Research', to: 'https://med.cmb.ac.lk/cmr/research/', external: true },
  { label: 'Services', to: 'https://med.cmb.ac.lk/cmr/services/', external: true },
  { label: 'Archives', to: 'https://med.cmb.ac.lk/cmr/archives/', external: true },
  { label: 'Contact', to: 'https://med.cmb.ac.lk/cmr/contacts-2/', external: true },
] as const

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 xl:grid xl:grid-cols-[1fr_auto_1fr]">
        <Link to="/" className="flex shrink-0 items-center gap-2.5 justify-self-start">
          <img src={cmrLogo} alt={CMR_SHORT_NAME} className="size-8 rounded-full" />
          <span className="hidden text-sm font-semibold tracking-tight sm:inline sm:text-base">{CMR_SHORT_NAME}</span>
        </Link>

        {/* Full inline nav only appears from xl: seven items plus the brand
            name and both header buttons don't reliably fit at lg, so
            everything below xl falls back to the menu sheet instead of
            risking an overflowing header row. flex-wrap is a cheap safety
            net in case it's ever still tight right at that breakpoint. */}
        <nav className="hidden flex-wrap items-center gap-5 justify-self-center xl:flex">
          {PUBLIC_NAV.map((item) =>
            item.external ? (
              <a
                key={item.to}
                href={item.to}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
                <ExternalLink className="size-3" />
              </a>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end
                className={({ isActive }) =>
                  cn(
                    'text-sm font-medium whitespace-nowrap transition-colors hover:text-foreground',
                    isActive ? 'text-foreground' : 'text-muted-foreground'
                  )
                }
              >
                {item.label}
              </NavLink>
            )
          )}
        </nav>

        <div className="flex items-center gap-2 justify-self-end">
          <div className="hidden items-center gap-2 sm:flex">
            <Button variant="ghost" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link to="/apply">Apply Now</Link>
            </Button>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="xl:hidden" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex w-3/4 flex-col p-0 sm:max-w-xs">
              <SheetHeader className="border-b">
                <SheetTitle className="flex items-center gap-2.5">
                  <img src={cmrLogo} alt="" className="size-7 rounded-full" />
                  {CMR_SHORT_NAME}
                </SheetTitle>
              </SheetHeader>

              <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
                {PUBLIC_NAV.map((item) =>
                  item.external ? (
                    <SheetClose key={item.to} asChild>
                      <a
                        href={item.to}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-md px-3 py-2.5 text-base font-medium text-muted-foreground transition-colors hover:bg-muted"
                      >
                        {item.label}
                        <ExternalLink className="size-3.5" />
                      </a>
                    </SheetClose>
                  ) : (
                    <SheetClose key={item.to} asChild>
                      <NavLink
                        to={item.to}
                        end
                        className={({ isActive }) =>
                          cn(
                            'rounded-md px-3 py-2.5 text-base font-medium transition-colors hover:bg-muted',
                            isActive ? 'bg-muted text-foreground' : 'text-muted-foreground'
                          )
                        }
                      >
                        {item.label}
                      </NavLink>
                    </SheetClose>
                  )
                )}
              </nav>

              <div className="flex flex-col gap-2 border-t p-4 sm:hidden">
                <SheetClose asChild>
                  <Button variant="outline" asChild>
                    <Link to="/login">Sign In</Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button asChild>
                    <Link to="/apply">Apply Now</Link>
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

export function SiteFooter({
  contactEmail = CMR_EMAIL,
  websiteUrl = CMR_WEBSITE_URL,
  academicProgrammeUrl = CMR_ACADEMIC_PROGRAMME_URL,
  courseTitle,
}: {
  contactEmail?: string
  websiteUrl?: string
  academicProgrammeUrl?: string
  courseTitle?: string
}) {
  return (
    <footer className="border-t bg-muted/30 py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-2.5">
              <img src={cmrLogo} alt="" className="size-8 rounded-full" />
              <span className="font-semibold">{CMR_SHORT_NAME}</span>
            </div>
            <p className="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground">
              <MapPin className="mt-0.5 size-3.5 shrink-0" />
              <a href={CMR_MAP_URL} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                {CMR_ADDRESS}
              </a>
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Phone className="size-3.5 shrink-0" />
              {CMR_PHONE_NUMBERS[0]}
            </p>
            <div className="mt-3 flex items-center gap-3">
              <a href={CMR_TWITTER_URL} target="_blank" rel="noopener noreferrer" aria-label="Twitter / X" className="text-muted-foreground hover:text-foreground">
                <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
                  <path d="M18.9 2H22l-7.6 8.7L23.4 22h-7l-5.5-7.2L4.6 22H1.5l8.1-9.3L1 2h7.2l5 6.6L18.9 2Zm-1.2 18h1.7L7.4 4h-1.8l12.1 16Z" />
                </svg>
              </a>
              <a href={CMR_YOUTUBE_URL} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-muted-foreground hover:text-foreground">
                <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
                  <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.5V8.5l6.3 3.5-6.3 3.5Z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 text-sm">
            <p className="mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Explore</p>
            {PUBLIC_NAV.filter((item) => item.to !== '/').map((item) =>
              item.external ? (
                <a
                  key={item.to}
                  href={item.to}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                >
                  {item.label}
                  <ExternalLink className="size-3" />
                </a>
              ) : (
                <Link key={item.to} to={item.to} className="text-muted-foreground hover:text-foreground">
                  {item.label}
                </Link>
              )
            )}
          </div>

          <div className="flex flex-col gap-1.5 text-sm">
            <p className="mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Get in touch</p>
            <a href={`mailto:${contactEmail}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
              <Mail className="size-4" />
              {contactEmail}
            </a>
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="size-4" />
              med.cmb.ac.lk/cmr
            </a>
            <a
              href={academicProgrammeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <NotebookPen className="size-4" />
              Academic programme page
            </a>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-2 border-t pt-6 text-center text-xs text-muted-foreground">
          <p>
            {courseTitle ? `Certificate Course on ${courseTitle} · ` : ''}
            Faculty of Medicine, University of Colombo
          </p>
          <p className="flex items-center gap-1.5">
            Developed by
            <a
              href="https://brainlabsinc.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-foreground"
            >
              <img src={brainLabsIcon} alt="" className="h-5 w-5 object-contain" />
              <span className="font-medium text-foreground">BrainLabs</span>
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
