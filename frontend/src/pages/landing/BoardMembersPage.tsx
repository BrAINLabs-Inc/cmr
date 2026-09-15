import { ExternalLink, Mail } from 'lucide-react'
import { PublicPageLayout } from './PublicPageLayout'
import { HoverCard, SectionHeading } from './shared'
import { CMR_DEAN, CMR_DEAN_PHOTO, CMR_DIRECTOR, CMR_DIRECTOR_PHOTO } from '@/lib/cmr-org-info'
import { CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

const LEADERSHIP = [
  {
    name: CMR_DIRECTOR,
    role: 'Director',
    photo: CMR_DIRECTOR_PHOTO,
    profileUrl: 'https://www.res.cmb.ac.lk/medicine/dilshani-dissanayake/',
  },
  {
    name: 'Dr. Jeevani Herath',
    role: 'Deputy Director (Services)',
    photo: 'https://med.cmb.ac.lk/wp-content/uploads/2024/05/Dr.-Jeewani-300x300.jpg',
    profileUrl: 'https://www.res.cmb.ac.lk/social.science.education/j.herath/',
  },
  {
    name: 'Dr. Kumarangie Vithanage',
    role: 'Deputy Director (Research)',
    photo: 'https://med.cmb.ac.lk/wp-content/uploads/2024/05/Dr.-Kumarangi-300x300.jpg',
    profileUrl: 'https://www.res.cmb.ac.lk/medicine/kumarangi-vithanage/',
  },
  {
    name: 'Dr. Santushi Amarasuriya',
    role: 'Deputy Director (Training)',
    photo: 'https://med.cmb.ac.lk/wp-content/uploads/2024/05/Dr.-Santhushi-300x300.jpg',
    profileUrl: 'https://www.res.cmb.ac.lk/medicine/santushi-amarasuriya/',
  },
]

const BOARD_MEMBERS = [
  { name: CMR_DEAN, role: 'Senior Advisory Board Member', photo: CMR_DEAN_PHOTO },
  { name: 'Dr. Satinder Singh Rekhi', role: 'Board Member', photo: 'https://med.cmb.ac.lk/wp-content/uploads/2024/08/New-Project-300x300.jpg' },
  { name: 'Emeritus Prof. Saroj Jayasinghe', role: 'Board Member', photo: 'https://med.cmb.ac.lk/wp-content/uploads/2024/05/Prof.-Saroj-150x150.jpg' },
  { name: 'Prof. Chandrika Wijeyaratne', role: 'Board Member', photo: 'https://med.cmb.ac.lk/wp-content/uploads/2024/05/Prof.-Chandrika-300x300.jpg' },
  { name: 'Prof. Wasantha Gunathunga', role: 'Board Member', photo: 'https://med.cmb.ac.lk/wp-content/uploads/2024/05/Prof.-Wasantha-300x300.jpg' },
  {
    name: 'Prof. Priyadarshanie Galapaththy',
    role: 'Board Member',
    photo: 'https://med.cmb.ac.lk/wp-content/uploads/2026/01/IMG_1510-1-300x300.jpg',
  },
  {
    name: 'Prof. Erandathie Lokupitiya',
    role: 'Board Member',
    photo: 'https://med.cmb.ac.lk/wp-content/uploads/2026/01/Gemini_Generated_Image_mmo3u8mmo3u8mmo3-300x300.jpg',
  },
  {
    name: 'Vidya Jyothi Prof. Prasad Katulanda',
    role: 'Board Member',
    photo: 'https://med.cmb.ac.lk/wp-content/uploads/2024/05/Prof.-Prasad-300x300.jpg',
  },
  { name: 'Prof. Nilakshi Samaranayake', role: 'Board Member', photo: 'https://med.cmb.ac.lk/wp-content/uploads/2024/05/Prof.-Nilakshi-300x300.jpg' },
  { name: 'Prof. Iresha Lakshman', role: 'Board Member', photo: 'https://med.cmb.ac.lk/wp-content/uploads/2024/05/Prof.-Iresha-300x300.jpg' },
  {
    name: 'Prof. Sashika Manorathne',
    role: 'Board Member',
    photo: 'https://med.cmb.ac.lk/wp-content/uploads/2024/08/sashika-abeydeera-manoratne-02-300x300.jpg',
  },
  { name: 'Prof. Nirmalie Pallewatta', role: 'Board Member', photo: 'https://med.cmb.ac.lk/wp-content/uploads/2024/08/Prof-Pallewatta1.jpg' },
  { name: 'Prof. Chamari Weeraratne', role: 'Board Member', photo: 'https://med.cmb.ac.lk/wp-content/uploads/2024/08/profile.jpg' },
  { name: 'Dr. Chamila Dalpatadu', role: 'Board Member', photo: 'https://med.cmb.ac.lk/wp-content/uploads/2024/05/Dr.-Chamila-300x300.jpg' },
  {
    name: 'Dr. Dilanthi Hewa Warawitage',
    role: 'Board Member',
    photo: 'https://med.cmb.ac.lk/wp-content/uploads/2024/05/Dr.-Dilanthi-300x300.jpg',
  },
]

const STAFF_PHOTO =
  'https://med.cmb.ac.lk/wp-content/uploads/2025/11/WhatsApp-Image-2025-11-06-at-14.45.46_a3b98500-1-225x300.jpg'

function PersonCard({ name, role, photo, profileUrl }: { name: string; role: string; photo: string; profileUrl?: string }) {
  return (
    <HoverCard>
      <CardContent className="flex flex-col items-center gap-4 pt-8 pb-8 text-center">
        <Avatar className="size-28">
          <AvatarImage src={photo} alt={name} />
          <AvatarFallback className="text-xl">{name.slice(0, 2)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{name}</p>
          <p className="mt-1 text-sm text-muted-foreground">{role}</p>
        </div>
        {profileUrl && (
          <Button variant="outline" size="sm" asChild>
            <a href={profileUrl} target="_blank" rel="noopener noreferrer">
              View Profile
              <ExternalLink className="size-3.5" />
            </a>
          </Button>
        )}
      </CardContent>
    </HoverCard>
  )
}

export function BoardMembersPage() {
  return (
    <PublicPageLayout
      eyebrow="Who we are"
      title="Board Members"
      description="The Centre for Meditation Research is guided by a Director, a Board of Management, and a small operations team."
    >
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading eyebrow="Leadership" title="Director & Deputy Directors" />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {LEADERSHIP.map((person) => (
              <PersonCard key={person.name} {...person} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-y bg-muted/20 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading eyebrow="Governance" title="Board of Management" />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {BOARD_MEMBERS.map((member) => (
              <PersonCard key={member.name} {...member} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <SectionHeading eyebrow="Operations" title="Staff" />
          <div className="mt-8 inline-flex flex-col items-center gap-2">
            <Avatar className="size-24">
              <AvatarImage src={STAFF_PHOTO} alt="Mr. Lakdinu Samaranayake" />
              <AvatarFallback className="text-xl">LS</AvatarFallback>
            </Avatar>
            <p className="mt-1 font-medium">Mr. Lakdinu Samaranayake</p>
            <p className="text-sm text-muted-foreground">Project Manager</p>
            <a href="mailto:lakdinu@med.cmb.ac.lk" className="mt-1 flex items-center gap-1.5 text-sm text-primary hover:underline">
              <Mail className="size-4" />
              lakdinu@med.cmb.ac.lk
            </a>
          </div>
        </div>
      </section>
    </PublicPageLayout>
  )
}
