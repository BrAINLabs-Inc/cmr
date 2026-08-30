import type { ReactNode } from 'react'
import { SiteHeader, SiteFooter } from './SiteHeaderFooter'

// Shared shell for the informational pages that mirror the real CMR site's
// structure (Board Members, Research, Services, Archives, Contact): a
// title strip plus consistent header/footer, so each page only supplies
// its own content.
export function PublicPageLayout({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        <section className="border-b bg-muted/30 py-14">
          <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
            {eyebrow && <p className="text-sm font-medium text-primary">{eyebrow}</p>}
            <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
            {description && <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">{description}</p>}
          </div>
        </section>

        {children}
      </main>

      <SiteFooter />
    </div>
  )
}
