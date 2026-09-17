import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { BrandMark } from '@/components/BrandMark'
import { DevCredit } from '@/components/DevCredit'
import { AuthLayout } from '@/components/AuthLayout'

const FORGOT_ILLUSTRATION = '/vectors/login.webp'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setSubmitting(false)
    if (error) setError(error.message)
    else setSent(true)
  }

  return (
    <AuthLayout
      illustration={FORGOT_ILLUSTRATION}
      eyebrow="Password reset"
      title="Get back into your diary"
      description="We'll email you a secure link to set a new password."
    >
      <BrandMark />
      <Card>
        <CardHeader>
          <CardTitle>Forgot your password?</CardTitle>
          <CardDescription>Enter the email you registered with and we'll send a reset link.</CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <Alert>
              <CheckCircle2 className="size-4" />
              <AlertDescription>
                If an account exists for {email}, a reset link is on its way. Check your inbox and spam folder.
              </AlertDescription>
            </Alert>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Sending…' : 'Send reset link'}
              </Button>
            </form>
          )}
          <p className="mt-4 text-center text-sm text-muted-foreground">
            <Link to="/login" className="underline underline-offset-4">
              Back to sign in
            </Link>
          </p>
        </CardContent>
      </Card>
      <DevCredit />
    </AuthLayout>
  )
}
