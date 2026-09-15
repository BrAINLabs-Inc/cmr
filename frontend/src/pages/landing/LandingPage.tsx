import { Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks/use-auth'
import { api } from '@/lib/api'
import type { PublicIntake } from '@/lib/types'
import { CMR_ACADEMIC_PROGRAMME_URL, CMR_EMAIL, CMR_WEBSITE_URL } from '@/lib/cmr-org-info'
import { SiteHeader, SiteFooter } from './SiteHeaderFooter'
import { HeroSection } from './HeroSection'
import { AboutSection } from './AboutSection'
import { ClosedNotice, ModulesSection, ObjectivesSection, EligibilityDurationSection } from './CourseContentSections'
import { HowToApplySection } from './HowToApplySection'
import { StudentFeaturesSection, ConfidentialitySection } from './StudentSections'

const FALLBACK_COURSE_TITLE = 'Translating the Science of Happiness and Meditation into Practice'

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
  const contactEmail = intake?.contact_email || CMR_EMAIL
  const websiteUrl = intake?.contact_website_url || CMR_WEBSITE_URL
  const academicProgrammeUrl = intake?.academic_programme_url || CMR_ACADEMIC_PROGRAMME_URL
  const applyUrl = typeof window !== 'undefined' ? `${window.location.origin}/apply` : '/apply'

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        <HeroSection intake={intake} intakeLoading={intakeLoading} courseTitle={courseTitle} />
        <ClosedNotice show={!intakeLoading && !intake} />
        <AboutSection />
        <ModulesSection intake={intake} />
        <ObjectivesSection intake={intake} />
        <EligibilityDurationSection intake={intake} />
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
