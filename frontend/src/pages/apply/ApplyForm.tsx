import { useState, type FormEvent } from 'react'
import { ExternalLink, Landmark, Loader2, Wallet } from 'lucide-react'
import { postForm, ApiError } from '@/lib/api'
import type { EducationQualification, HowHeard, PublicIntake } from '@/lib/types'
import { compose, email, required } from '@/lib/validators'
import { useValidatedField } from '@/hooks/use-validated-field'
import { FormField } from '@/components/form/FormField'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const APPLICATION_ILLUSTRATION = '/vectors/application.webp'

const MAX_DEGREE_DOCUMENTS = 5
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024
const ACCEPTED_FILE_TYPES = '.pdf,.doc,.docx,image/*'

const EDUCATION_OPTIONS: { value: EducationQualification; label: string }[] = [
  { value: 'undergraduate', label: 'Undergraduate' },
  { value: 'bachelor', label: "Bachelor's Degree" },
  { value: 'master', label: "Master's Degree" },
  { value: 'mphil', label: 'MPhil' },
  { value: 'phd', label: 'PhD' },
  { value: 'other', label: 'Other' },
]

const HOW_HEARD_OPTIONS: { value: HowHeard; label: string }[] = [
  { value: 'social_media', label: 'Social Media' },
  { value: 'website', label: 'Website' },
  { value: 'friends', label: 'Friends' },
  { value: 'other', label: 'Other' },
]

type TitleOption = 'Mr' | 'Mrs' | 'Ms' | 'Miss' | 'Dr' | 'Prof' | 'Rev' | 'other'

const TITLE_OPTIONS: { value: TitleOption; label: string }[] = [
  { value: 'Mr', label: 'Mr' },
  { value: 'Mrs', label: 'Mrs' },
  { value: 'Ms', label: 'Ms' },
  { value: 'Miss', label: 'Miss' },
  { value: 'Dr', label: 'Dr' },
  { value: 'Prof', label: 'Prof' },
  { value: 'Rev', label: 'Rev' },
  { value: 'other', label: 'Other' },
]

function validateFiles(files: File[], max: number): string | null {
  if (files.length === 0) return null
  if (files.length > max) return `Please select at most ${max} file${max === 1 ? '' : 's'}.`
  const tooLarge = files.find((f) => f.size > MAX_FILE_SIZE_BYTES)
  if (tooLarge) return `"${tooLarge.name}" is larger than 10 MB.`
  return null
}

export function ApplyForm({ intake, onSubmitted }: { intake: PublicIntake; onSubmitted: (reference: string) => void }) {
  const title = useValidatedField<TitleOption | ''>('' as const)
  const titleOther = useValidatedField('', title.value === 'other' ? required('Please specify your title.') : undefined)
  const fullName = useValidatedField('', required('Full name is required.'))
  const nameWithInitials = useValidatedField('', required('Please enter your name with initials.'))
  const residentialAddress = useValidatedField('', required('Residential address is required.'))
  const dateOfBirth = useValidatedField('', required('Date of birth is required.'))
  const gender = useValidatedField<'male' | 'female' | 'prefer_not_to_say' | ''>('' as const, required('Please select a gender.'))
  const nicOrPassport = useValidatedField('', required('NIC or passport number is required.'))
  const emailField = useValidatedField('', compose(required('Email address is required.'), email()))
  const phoneNumber = useValidatedField('', required('Phone number is required.'))
  const whatsappNumber = useValidatedField('')

  const currentOccupation = useValidatedField('', required('Current occupation is required.'))
  const educationQualification = useValidatedField<EducationQualification | ''>(
    '' as const,
    required('Please select your education qualification.')
  )
  const educationQualificationOther = useValidatedField(
    '',
    educationQualification.value === 'other' ? required('Please specify your qualification.') : undefined
  )
  const degreeName = useValidatedField('', required('Please enter your degree.'))
  const reasonForJoining = useValidatedField('')
  const [hasMeditationExperience, setHasMeditationExperience] = useState<'true' | 'false' | ''>('')
  const howHeard = useValidatedField<HowHeard | ''>('' as const, required('Please let us know how you heard about the course.'))
  const howHeardOther = useValidatedField('', howHeard.value === 'other' ? required('Please specify.') : undefined)

  const [degreeDocuments, setDegreeDocuments] = useState<File[]>([])
  const [degreeDocumentsError, setDegreeDocumentsError] = useState<string | null>(null)
  const [degreeDocumentsTouched, setDegreeDocumentsTouched] = useState(false)
  const [paymentSlip, setPaymentSlip] = useState<File | null>(null)
  const [paymentSlipError, setPaymentSlipError] = useState<string | null>(null)
  const [paymentSlipTouched, setPaymentSlipTouched] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const requiredFields = [
    titleOther,
    fullName,
    nameWithInitials,
    residentialAddress,
    dateOfBirth,
    gender,
    nicOrPassport,
    emailField,
    phoneNumber,
    currentOccupation,
    educationQualification,
    educationQualificationOther,
    degreeName,
    howHeard,
    howHeardOther,
  ]

  function handleDegreeDocumentsChange(files: File[]) {
    setDegreeDocuments(files)
    setDegreeDocumentsTouched(true)
    setDegreeDocumentsError(files.length === 0 ? 'Please upload at least one degree certificate or transcript.' : validateFiles(files, MAX_DEGREE_DOCUMENTS))
  }

  function handlePaymentSlipChange(file: File | null) {
    setPaymentSlip(file)
    setPaymentSlipTouched(true)
    if (!file) setPaymentSlipError('Please upload your payment slip.')
    else if (file.size > MAX_FILE_SIZE_BYTES) setPaymentSlipError('Payment slip must be under 10 MB.')
    else setPaymentSlipError(null)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    requiredFields.forEach((field) => field.markTouched())
    setDegreeDocumentsTouched(true)
    setPaymentSlipTouched(true)

    const degreeDocsError =
      degreeDocuments.length === 0
        ? 'Please upload at least one degree certificate or transcript.'
        : validateFiles(degreeDocuments, MAX_DEGREE_DOCUMENTS)
    setDegreeDocumentsError(degreeDocsError)

    const slipError = !paymentSlip
      ? 'Please upload your payment slip.'
      : paymentSlip.size > MAX_FILE_SIZE_BYTES
        ? 'Payment slip must be under 10 MB.'
        : null
    setPaymentSlipError(slipError)

    const hasFieldErrors = requiredFields.some((field) => !field.isValid)
    if (hasFieldErrors || degreeDocsError || slipError) {
      setError('Please fix the highlighted fields before submitting.')
      return
    }

    const formData = new FormData()
    formData.append('title', title.value === 'other' ? titleOther.value : title.value)
    formData.append('fullName', fullName.value)
    formData.append('nameWithInitials', nameWithInitials.value)
    formData.append('residentialAddress', residentialAddress.value)
    formData.append('dateOfBirth', dateOfBirth.value)
    formData.append('gender', gender.value)
    formData.append('nicOrPassport', nicOrPassport.value)
    formData.append('email', emailField.value)
    formData.append('phoneNumber', phoneNumber.value)
    if (whatsappNumber.value) formData.append('whatsappNumber', whatsappNumber.value)
    formData.append('currentOccupation', currentOccupation.value)
    formData.append('educationQualification', educationQualification.value)
    if (educationQualificationOther.value) formData.append('educationQualificationOther', educationQualificationOther.value)
    formData.append('degreeName', degreeName.value)
    if (reasonForJoining.value) formData.append('reasonForJoining', reasonForJoining.value)
    if (hasMeditationExperience) formData.append('hasMeditationExperience', hasMeditationExperience)
    formData.append('howHeard', howHeard.value)
    if (howHeardOther.value) formData.append('howHeardOther', howHeardOther.value)
    for (const file of degreeDocuments) formData.append('degreeDocuments', file)
    if (paymentSlip) formData.append('paymentSlip', paymentSlip)

    setSubmitting(true)
    try {
      const res = await postForm<{ applicationId: string; reference: string }>('/public/applications', formData)
      onSubmitted(res.reference)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not submit your application. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const hasPaymentDetails = Boolean(
    intake.fee_application_local ||
      intake.fee_application_foreign ||
      intake.payment_reference_code ||
      intake.payment_bank_name ||
      intake.payment_online_portal_url
  )

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div className="relative overflow-hidden rounded-xl border bg-primary/5 px-6 py-8 sm:px-8">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 opacity-60 [background-image:radial-gradient(var(--border)_1px,transparent_1px)] [background-size:26px_26px] [mask-image:radial-gradient(ellipse_70%_60%_at_100%_0%,black,transparent)]" />
          <div className="absolute -top-10 -right-10 size-56 rounded-full bg-primary/10 blur-3xl" />
        </div>
        <div className="flex items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
              Apply for {intake.course_title}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Intake {intake.intake_number}
              {intake.application_closing_date && <> · Closes {intake.application_closing_date}</>}
            </p>
          </div>
          <img
            src={APPLICATION_ILLUSTRATION}
            alt=""
            className="hidden h-40 w-40 shrink-0 object-contain sm:block md:h-56 md:w-56"
          />
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Wallet className="size-5 text-primary" />
            <CardTitle>Payment Instructions</CardTitle>
          </div>
          <CardDescription>Please make the application fee payment before submitting, and keep your slip ready to upload.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {hasPaymentDetails ? (
            <>
              {intake.fee_application_local && <p>Application fee (local): {intake.fee_application_local}</p>}
              {intake.fee_application_foreign && <p>Application fee (foreign): {intake.fee_application_foreign}</p>}
              {intake.payment_reference_code && (
                <p>
                  Reference / account number:{' '}
                  <span className="font-mono font-medium">{intake.payment_reference_code}</span>
                </p>
              )}
              {intake.payment_bank_name && (
                <p className="flex items-center gap-1.5">
                  <Landmark className="size-4 text-muted-foreground" />
                  Pay at any {intake.payment_bank_name} branch
                  {intake.payment_account_holder_name && <>, account holder: {intake.payment_account_holder_name}</>}
                </p>
              )}
              {intake.payment_online_portal_url && (
                <a
                  href={intake.payment_online_portal_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-primary hover:underline"
                >
                  <ExternalLink className="size-4" />
                  Pay online
                </a>
              )}
            </>
          ) : (
            <p className="text-muted-foreground">
              Payment details haven't been added for this intake yet. Please contact CMR before submitting if you're
              unsure how to pay.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField label="Title" htmlFor="title">
            <Select value={title.value} onValueChange={(v) => title.onChange(v)}>
              <SelectTrigger id="title" className="w-full">
                <SelectValue placeholder="Select…" />
              </SelectTrigger>
              <SelectContent>
                {TITLE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          {title.value === 'other' && (
            <FormField label="Please specify" htmlFor="titleOther" required error={titleOther.error}>
              <Input
                id="titleOther"
                value={titleOther.value}
                aria-invalid={!!titleOther.error}
                onChange={(e) => titleOther.onChange(e.target.value)}
                onBlur={titleOther.onBlur}
              />
            </FormField>
          )}
          <FormField label="Full Name (as on certificate)" htmlFor="fullName" required error={fullName.error}>
            <Input
              id="fullName"
              value={fullName.value}
              aria-invalid={!!fullName.error}
              onChange={(e) => fullName.onChange(e.target.value)}
              onBlur={fullName.onBlur}
            />
          </FormField>
          <FormField label="Name with Initials" htmlFor="nameWithInitials" required error={nameWithInitials.error}>
            <Input
              id="nameWithInitials"
              value={nameWithInitials.value}
              aria-invalid={!!nameWithInitials.error}
              onChange={(e) => nameWithInitials.onChange(e.target.value)}
              onBlur={nameWithInitials.onBlur}
            />
          </FormField>
          <FormField label="Date of Birth" htmlFor="dateOfBirth" required error={dateOfBirth.error}>
            <Input
              id="dateOfBirth"
              type="date"
              value={dateOfBirth.value}
              aria-invalid={!!dateOfBirth.error}
              onChange={(e) => dateOfBirth.onChange(e.target.value)}
              onBlur={dateOfBirth.onBlur}
            />
          </FormField>
          <FormField label="Gender" htmlFor="gender" required error={gender.error}>
            <Select
              value={gender.value}
              onValueChange={(v) => {
                gender.onChange(v)
                gender.markTouched()
              }}
            >
              <SelectTrigger id="gender" className="w-full" aria-invalid={!!gender.error}>
                <SelectValue placeholder="Select…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="NIC / Passport Number" htmlFor="nicOrPassport" required error={nicOrPassport.error}>
            <Input
              id="nicOrPassport"
              value={nicOrPassport.value}
              aria-invalid={!!nicOrPassport.error}
              onChange={(e) => nicOrPassport.onChange(e.target.value)}
              onBlur={nicOrPassport.onBlur}
            />
          </FormField>
          <FormField label="Residential Address" htmlFor="residentialAddress" required error={residentialAddress.error} className="sm:col-span-2">
            <Textarea
              id="residentialAddress"
              value={residentialAddress.value}
              aria-invalid={!!residentialAddress.error}
              onChange={(e) => residentialAddress.onChange(e.target.value)}
              onBlur={residentialAddress.onBlur}
            />
          </FormField>
          <FormField label="Email Address" htmlFor="email" required error={emailField.error}>
            <Input
              id="email"
              type="email"
              value={emailField.value}
              aria-invalid={!!emailField.error}
              onChange={(e) => emailField.onChange(e.target.value)}
              onBlur={emailField.onBlur}
            />
          </FormField>
          <FormField label="Phone Number" htmlFor="phoneNumber" required error={phoneNumber.error}>
            <Input
              id="phoneNumber"
              value={phoneNumber.value}
              aria-invalid={!!phoneNumber.error}
              onChange={(e) => phoneNumber.onChange(e.target.value)}
              onBlur={phoneNumber.onBlur}
            />
          </FormField>
          <FormField label="WhatsApp Number (if different)" htmlFor="whatsappNumber">
            <Input id="whatsappNumber" value={whatsappNumber.value} onChange={(e) => whatsappNumber.onChange(e.target.value)} />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Other Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField label="Current Occupation" htmlFor="currentOccupation" required error={currentOccupation.error} className="sm:col-span-2">
            <Input
              id="currentOccupation"
              value={currentOccupation.value}
              aria-invalid={!!currentOccupation.error}
              onChange={(e) => currentOccupation.onChange(e.target.value)}
              onBlur={currentOccupation.onBlur}
            />
          </FormField>
          <FormField label="Education Qualification" htmlFor="educationQualification" required error={educationQualification.error}>
            <Select
              value={educationQualification.value}
              onValueChange={(v) => {
                educationQualification.onChange(v)
                educationQualification.markTouched()
              }}
            >
              <SelectTrigger id="educationQualification" className="w-full" aria-invalid={!!educationQualification.error}>
                <SelectValue placeholder="Select…" />
              </SelectTrigger>
              <SelectContent>
                {EDUCATION_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          {educationQualification.value === 'other' && (
            <FormField label="Please specify" htmlFor="educationQualificationOther" required error={educationQualificationOther.error}>
              <Input
                id="educationQualificationOther"
                value={educationQualificationOther.value}
                aria-invalid={!!educationQualificationOther.error}
                onChange={(e) => educationQualificationOther.onChange(e.target.value)}
                onBlur={educationQualificationOther.onBlur}
              />
            </FormField>
          )}
          <FormField label="Degree (e.g. Bachelor of Science)" htmlFor="degreeName" required error={degreeName.error} className="sm:col-span-2">
            <Input
              id="degreeName"
              value={degreeName.value}
              aria-invalid={!!degreeName.error}
              onChange={(e) => degreeName.onChange(e.target.value)}
              onBlur={degreeName.onBlur}
            />
          </FormField>
          <FormField
            label="Degree Certificate, Transcript, or Confirmation Letter (up to 5 files, PDF/document/image, 10 MB each)"
            htmlFor="degreeDocuments"
            required
            error={degreeDocumentsTouched ? degreeDocumentsError : null}
            className="sm:col-span-2"
          >
            <Input
              id="degreeDocuments"
              type="file"
              multiple
              aria-invalid={degreeDocumentsTouched && !!degreeDocumentsError}
              accept={ACCEPTED_FILE_TYPES}
              onChange={(e) => handleDegreeDocumentsChange(Array.from(e.target.files ?? []))}
            />
          </FormField>
          <FormField label="Why do you want to join this course?" htmlFor="reasonForJoining" className="sm:col-span-2">
            <Textarea id="reasonForJoining" value={reasonForJoining.value} onChange={(e) => reasonForJoining.onChange(e.target.value)} />
          </FormField>
          <FormField label="Have you practiced meditation before?" htmlFor="hasMeditationExperience">
            <Select value={hasMeditationExperience} onValueChange={(v) => setHasMeditationExperience(v as 'true' | 'false')}>
              <SelectTrigger id="hasMeditationExperience" className="w-full">
                <SelectValue placeholder="Select…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="How did you hear about this course?" htmlFor="howHeard" required error={howHeard.error}>
            <Select
              value={howHeard.value}
              onValueChange={(v) => {
                howHeard.onChange(v)
                howHeard.markTouched()
              }}
            >
              <SelectTrigger id="howHeard" className="w-full" aria-invalid={!!howHeard.error}>
                <SelectValue placeholder="Select…" />
              </SelectTrigger>
              <SelectContent>
                {HOW_HEARD_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          {howHeard.value === 'other' && (
            <FormField label="Please specify" htmlFor="howHeardOther" required error={howHeardOther.error}>
              <Input
                id="howHeardOther"
                value={howHeardOther.value}
                aria-invalid={!!howHeardOther.error}
                onChange={(e) => howHeardOther.onChange(e.target.value)}
                onBlur={howHeardOther.onBlur}
              />
            </FormField>
          )}
          <FormField
            label="Payment Slip (PDF, document, or image, 10 MB max)"
            htmlFor="paymentSlip"
            required
            error={paymentSlipTouched ? paymentSlipError : null}
            className="sm:col-span-2"
          >
            <Input
              id="paymentSlip"
              type="file"
              aria-invalid={paymentSlipTouched && !!paymentSlipError}
              accept={ACCEPTED_FILE_TYPES}
              onChange={(e) => handlePaymentSlipChange(e.target.files?.[0] ?? null)}
            />
          </FormField>
        </CardContent>
      </Card>

      <Button type="submit" size="lg" disabled={submitting} className="w-full sm:w-auto">
        {submitting && <Loader2 className="size-4 animate-spin" />}
        {submitting ? 'Submitting…' : 'Submit Application'}
      </Button>
    </form>
  )
}
