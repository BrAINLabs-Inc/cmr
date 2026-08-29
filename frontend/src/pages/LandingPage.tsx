import { Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks/use-auth'
import { api } from '@/lib/api'
import type { PublicIntake } from '@/lib/types'
import { SiteHeader, SiteFooter } from './landing/SiteHeaderFooter'
import { HeroSection } from './landing/HeroSection'
import { ClosedNotice, ModulesSection, ObjectivesSection, EligibilityDurationSection, FeesSection } from './landing/CourseContentSections'
import { HowToApplySection } from './landing/HowToApplySection'
import { StudentFeaturesSection, ConfidentialitySection } from './landing/StudentSections'

const FALLBACK_COURSE_TITLE = 'Translating the Science of Happiness and Meditation into Practice'
const FALLBACK_CMR_WEBSITE = 'https://med.cmb.ac.lk/cmr/'
const FALLBACK_ACADEMIC_PROGRAMME_URL = 'https://med.cmb.ac.lk/academic-programs/tshmp/'
const FALLBACK_CONTACT_EMAIL = 'cmr@med.cmb.ac.lk'

export function LandingPage() {
  const { loading, session, role } = useAuth()

  const { data, isLoading: intakeLoading } = useQuery({
    queryKey: ['public-intake'],
    queryFn: () => api.get<{ intake: PublicIntake | null }>('/public/intake'),
  })

  if (!loading && session && role) {
    return <Navigate to={role === 'admin' ? '/admin' : '/dashboard'} replace />
  }

  const intake = data?.intake ?? null
  const courseTitle = intake?.course_title ?? FALLBACK_COURSE_TITLE
  const contactEmail = intake?.contact_email || FALLBACK_CONTACT_EMAIL
  const websiteUrl = intake?.contact_website_url || FALLBACK_CMR_WEBSITE
  const academicProgrammeUrl = intake?.academic_programme_url || FALLBACK_ACADEMIC_PROGRAMME_URL
  const applyUrl = typeof window !== 'undefined' ? `${window.location.origin}/apply` : '/apply'

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        <HeroSection intake={intake} intakeLoading={intakeLoading} courseTitle={courseTitle} />
        <ClosedNotice show={!intakeLoading && !intake} />
        <ModulesSection intake={intake} />
        <ObjectivesSection intake={intake} />
        <EligibilityDurationSection intake={intake} />
        <FeesSection intake={intake} />
        <HowToApplySection intake={intake} applyUrl={applyUrl} />
        <StudentFeaturesSection />
        <ConfidentialitySection />
      </main>

      <SiteFooter
        contactEmail={contactEmail}
        websiteUrl={websiteUrl}
        academicProgrammeUrl={academicProgrammeUrl}
        courseTitle={courseTitle}
      />
    </div>
  )
}
