import { Link } from 'react-router-dom'
import { ExternalLink, Mail, NotebookPen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import cmrLogo from '@/assets/cmr-logo.png'

export function SiteHeader() {
  return (
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
            <Link to="/apply">Apply Now</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

export function SiteFooter({
  contactEmail,
  websiteUrl,
  academicProgrammeUrl,
  courseTitle,
}: {
  contactEmail: string
  websiteUrl: string
  academicProgrammeUrl: string
  courseTitle: string
}) {
  return (
    <footer className="border-t bg-muted py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left">
          <div>
            <div className="flex items-center justify-center gap-2.5 sm:justify-start">
              <img src={cmrLogo} alt="" className="size-8 rounded-full" />
              <span className="font-semibold">Centre for Meditation Research</span>
            </div>
            <p className="mt-2 max-w-sm text-xs text-muted-foreground">Faculty of Medicine, University of Colombo</p>
          </div>

          <div className="flex flex-col items-center gap-1.5 text-sm sm:items-start">
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

        <p className="mt-8 border-t pt-6 text-center text-xs text-muted-foreground">Certificate Course on {courseTitle}</p>
      </div>
    </footer>
  )
}
