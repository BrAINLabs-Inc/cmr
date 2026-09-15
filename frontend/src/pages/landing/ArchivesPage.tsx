import { ExternalLink } from 'lucide-react'
import { PublicPageLayout } from './PublicPageLayout'
import { SectionHeading, HoverCard } from './shared'
import { CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const ARTICLES = [
  {
    title: "Sri Lanka celebrates the UN's first World Meditation Day!",
    source: 'Daily News',
    date: 'December 2024',
    url: 'https://www.dailynews.lk/2024/12/23/featured/693086/',
  },
  {
    title: 'Mind over matter: Meditation as a therapeutic tool',
    source: 'The Island',
    url: 'https://island.lk/?page_cat=article-details&code_title=208800',
  },
  {
    title: 'Theravada meditation tradition for holistic human health',
    source: 'Eleven Myanmar',
    url: 'https://elevenmyanmar.com/news/theravada-meditation-tradition-for-holistic-human-health',
  },
  {
    title: 'Centre for Meditation Research at University of Colombo; revealing to world how meditation can heal',
    source: 'Financial Times (Sri Lanka)',
    url: 'https://www.ft.lk/harmony_page/Centre-for-Meditation-Research-at-University-of-Colombo-revealing-to-world-how-meditation-can-heal/10523-776823',
  },
  {
    title: 'Colombo Uni. to host program on "Embodied Intelligence, Buddhist Meditation Practice, and AI Tech Entrepreneurship"',
    source: 'Financial Times (Sri Lanka)',
    url: 'https://www.ft.lk/business/Colombo-Uni-to-host-program-on-Embodied-Intelligence-Buddhist-Meditation-Practice-and-AI-Tech-Entrepreneurship/34-781042',
  },
]

const EVENTS = [
  {
    title: 'Meditation Programme',
    date: 'May 2024',
    photo: 'https://med.cmb.ac.lk/wp-content/uploads/2024/05/DSC_5167.jpg',
  },
  {
    title: 'Harmony in Hustle: Nurturing spirituality in the workplace',
    date: 'May 2024',
    photo: 'https://med.cmb.ac.lk/wp-content/uploads/2024/05/01-1024x768.jpg',
  },
  {
    title: 'Certificate Course Inauguration',
    date: 'June 2024',
    photo: 'https://med.cmb.ac.lk/wp-content/uploads/2024/06/DSC00699-1024x768.jpg',
  },
  {
    title: 'Introduction to Insight: Exploration of Metacognition',
    date: 'July 2024',
    photo: 'https://med.cmb.ac.lk/wp-content/uploads/2024/07/DSC007721-1024x768.jpg',
  },
  {
    title: 'World Meditation Day 2024: Virtual Global Symposium',
    date: 'December 2024',
    photo: 'https://med.cmb.ac.lk/wp-content/uploads/2024/12/Screenshot-193-1024x576.png',
  },
  {
    title: 'The Science of Meditation with Ven. Ajahn Brahm',
    date: 'May 2025',
    photo: 'https://med.cmb.ac.lk/wp-content/uploads/2025/05/LA24762-1024x681.jpg',
  },
  {
    title: 'Certificate Course Inauguration and Awards',
    date: 'June 2025',
    photo: 'https://med.cmb.ac.lk/wp-content/uploads/2025/06/0D4A8457-1024x683.jpg',
  },
  {
    title: 'Embodied Intelligence, Buddhist Meditation & AI Tech Entrepreneurship',
    date: 'September 2025',
    photo: 'https://med.cmb.ac.lk/wp-content/uploads/2025/09/0D4A9909-1024x683.jpg',
  },
  {
    title: '2nd World Meditation Day Global Conference',
    date: 'June 2026',
    photo: 'https://med.cmb.ac.lk/wp-content/uploads/2026/06/0D4A4882-1024x683.jpg',
  },
  {
    title: 'Certificate Course Inauguration and Awards Ceremony',
    date: 'July 2026',
    photo: 'https://med.cmb.ac.lk/wp-content/uploads/2026/07/0D4A6743-Copy-1024x683.jpg',
  },
]

export function ArchivesPage() {
  return (
    <PublicPageLayout
      eyebrow="Looking back"
      title="Archives"
      description="Past media coverage and events from the Centre for Meditation Research."
    >
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <SectionHeading eyebrow="In the news" title="Articles" description="Media coverage of CMR's work, from national press to international outlets." />
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {ARTICLES.map((article, i) => (
              <a
                key={article.title}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn('group block', i === ARTICLES.length - 1 && ARTICLES.length % 2 === 1 && 'sm:col-span-2')}
              >
                <HoverCard className="flex h-full flex-col">
                  <CardContent className="flex flex-1 flex-col pt-6">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold tracking-wide text-primary uppercase">{article.source}</span>
                      {article.date && <span className="text-xs text-muted-foreground">{article.date}</span>}
                    </div>
                    <p className="mt-3 flex-1 text-base leading-snug font-medium text-balance group-hover:text-primary">
                      {article.title}
                    </p>
                    <span className="mt-4 flex items-center gap-1.5 text-sm font-medium text-primary">
                      Read article
                      <ExternalLink className="size-3.5" />
                    </span>
                  </CardContent>
                </HoverCard>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/20 py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <SectionHeading eyebrow="Gallery" title="Past Events" />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {EVENTS.map((event) => (
              <HoverCard key={event.title} className="overflow-hidden">
                <img src={event.photo} alt={event.title} className="h-44 w-full object-cover" loading="lazy" />
                <CardContent className="pt-4">
                  <p className="font-medium">{event.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{event.date}</p>
                </CardContent>
              </HoverCard>
            ))}
          </div>
        </div>
      </section>
    </PublicPageLayout>
  )
}
