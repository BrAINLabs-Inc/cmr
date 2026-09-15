import type { ComponentType } from 'react'
import { Activity, Brain, Dna, ExternalLink, FileText, HeartPulse, Smile, Sparkles } from 'lucide-react'
import { PublicPageLayout } from './PublicPageLayout'
import { HoverCard, SectionHeading } from './shared'
import { CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const RESEARCH_AREAS: { title: string; description: string; icon: ComponentType<{ className?: string }> }[] = [
  {
    title: 'Neurophysiological & Cognitive Studies',
    description: 'Cognitive status and brain function in long-term meditators, EEG patterns, visual-evoked potentials, and peripheral nerve conduction.',
    icon: Brain,
  },
  {
    title: 'Cellular & Molecular Research',
    description:
      'Molecular basis of mind training: cellular signalling, neurochemical and epigenetic modifications, telomere length and telomerase activity, and circadian-rhythm gene expression (CRY1, CRY2, hTERT, hTR).',
    icon: Dna,
  },
  {
    title: 'Cardiovascular & Respiratory Function',
    description: 'Respiratory capacity, cardiovascular autonomic responses, isometric handgrip responses, and breath-holding capacity in experienced meditators.',
    icon: HeartPulse,
  },
  {
    title: 'Biochemical Parameters',
    description: 'Stress hormones (adrenaline, cortisol, glucagon), neurotransmitters (dopamine, serotonin, melatonin, GABA, glutamate), antioxidant capacity, and lipid profiles.',
    icon: Activity,
  },
  {
    title: 'Psychological & Wellbeing Measures',
    description: 'Mindfulness assessment, psychological resilience and distress, quality of life, social harmony, environmental consciousness, and post-traumatic stress resilience.',
    icon: Smile,
  },
  {
    title: 'Clinical Applications',
    description:
      '"MindDM": effects of meditation on physiological and metabolic parameters in type 2 diabetes; and studies on meditation effects on clinical outcomes in Parkinson’s disease.',
    icon: Sparkles,
  },
]

const PUBLICATIONS = [
  {
    title: 'Effect of long-term meditation on cognitive status and selected neurophysiological parameters',
    authors: 'Vithanage K, Dissanayake DWN, Chang T',
    year: '2026',
    doi: 'https://doi.org/10.1016/j.heliyon.2026.e44986',
  },
  {
    title: "Effects of meditation on physiological and metabolic parameters in patients with type 2 diabetes mellitus ('MindDM')",
    authors: 'Dalpatadu KPC, Galappatthy P, Katulanda P, Jayasinghe S',
    year: '2022',
    doi: 'https://doi.org/10.1186/s13063-022-06771-2',
  },
  {
    title: 'Higher Serum Antioxidant Capacity Levels and Its Association with Serum NOx Levels Among Long-term Experienced Meditators',
    authors: 'Thambyrajah JC, Handunnetti SM, Dilanthi HW, Dissanayake DWN',
    year: '2022',
    doi: 'https://doi.org/10.1007/s12671-022-01840-8',
  },
  {
    title: 'Impact of Meditation-Based Lifestyle Practices on Mindfulness, Wellbeing, and Plasma Telomerase Levels',
    authors: 'Dasanayaka NN, Sirisena ND, Samaranayake N',
    year: '2022',
    doi: 'https://doi.org/10.3389/fpsyg.2022.846085',
  },
  {
    title: 'Respiratory function in healthy long-term meditators: a systematic review',
    authors: 'Karunarathne LJU, Amarasiri WADL, Fernando ADA',
    year: '2023',
    doi: 'https://doi.org/10.1186/s13643-023-02412-0',
  },
  {
    title: 'Serum melatonin and serotonin levels in long-term skilled meditators',
    authors: 'Thambyrajah JC, Dilanthi HW, Handunnetti SM, Dissanayake DWN',
    year: '2023',
    doi: 'https://doi.org/10.1016/j.explore.2023.03.006',
  },
  {
    title: 'The development of a tool to identify skilled meditators among meditation practitioners (UoC-IISM)',
    authors: 'Outschoorn NO, Somarathne EASK, Dasanayaka NN, et al.',
    year: '2022',
    doi: 'https://doi.org/10.4038/jccpsl.v28i4.8542',
  },
  {
    title: 'The effects of meditation on length of telomeres in healthy individuals: a systematic review',
    authors: 'Dasanayaka NN, Sirisena ND, Samaranayake N',
    year: '2021',
    doi: 'https://doi.org/10.1186/s13643-021-01699-1',
  },
]

const EBOOKS = [
  {
    title: 'World Meditation Day 2024',
    cover: 'https://med.cmb.ac.lk/wp-content/uploads/2025/09/Coverpage-212x300.jpg',
    url: 'https://med.cmb.ac.lk/wp-content/uploads/2025/09/E-Book-Template_compressed.pdf',
  },
  {
    title: 'World Meditation Day 2025',
    cover: 'https://med.cmb.ac.lk/wp-content/uploads/2025/12/Coverpage-212x300.jpg',
    url: 'https://med.cmb.ac.lk/wp-content/uploads/2025/12/E-Book-Template_merged.pdf',
  },
]

export function ResearchPage() {
  return (
    <PublicPageLayout
      eyebrow="Evidence-based"
      title="Research"
      description="CMR investigates the physiological, psychological, and cellular effects of meditation, with a focus on Buddhist meditation practices among Sri Lankan populations."
    >
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading eyebrow="Focus areas" title="What we study" />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {RESEARCH_AREAS.map((area) => (
              <HoverCard key={area.title}>
                <CardContent className="pt-6">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <area.icon className="size-5" />
                  </div>
                  <p className="mt-3 font-medium">{area.title}</p>
                  <p className="mt-1.5 text-sm text-muted-foreground">{area.description}</p>
                </CardContent>
              </HoverCard>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y bg-muted/20 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Instruments"
            title="Identifying skilled meditators"
            description={
              'CMR developed the "University of Colombo Intake Interview to identify Skilled Meditators for scientific research (UoC-IISM)" and a Buddhist meditation experience questionnaire, used across its studies.'
            }
          />
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <SectionHeading eyebrow="Publications" title="Selected Publications" />
          <div className="mt-10 space-y-3">
            {PUBLICATIONS.map((pub) => (
              <a
                key={pub.doi}
                href={pub.doi}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-lg border p-4 transition-colors hover:border-primary/40"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium group-hover:text-primary">{pub.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {pub.authors} · {pub.year}
                    </p>
                  </div>
                  <ExternalLink className="mt-1 size-4 shrink-0 text-muted-foreground group-hover:text-primary" />
                </div>
              </a>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button variant="outline" asChild>
              <a href="https://cjms.sljol.info/" target="_blank" rel="noopener noreferrer">
                Ceylon Journal of Medical Science
                <ExternalLink className="size-4" />
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a
                href="https://med.cmb.ac.lk/wp-content/uploads/2024/08/2-Number-of-communications-abstract-published-1.pdf"
                target="_blank"
                rel="noopener noreferrer"
              >
                Conference Abstracts (33)
                <FileText className="size-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/20 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <SectionHeading eyebrow="World Meditation Day" title="Annual e-Books" />
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {EBOOKS.map((book) => (
              <a key={book.title} href={book.url} target="_blank" rel="noopener noreferrer">
                <HoverCard>
                  <CardContent className="flex items-center gap-4 pt-6">
                    <img src={book.cover} alt={book.title} className="h-24 w-auto rounded border object-cover" />
                    <div>
                      <p className="font-medium">{book.title}</p>
                      <p className="mt-1 flex items-center gap-1 text-sm text-primary">
                        Read the e-book
                        <ExternalLink className="size-3.5" />
                      </p>
                    </div>
                  </CardContent>
                </HoverCard>
              </a>
            ))}
          </div>
        </div>
      </section>
    </PublicPageLayout>
  )
}
