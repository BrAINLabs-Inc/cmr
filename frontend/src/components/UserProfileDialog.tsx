import { IdCard, Mail, ShieldCheck, User } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import type { Admin, Student } from '@/lib/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}

function isStudent(profile: Student | Admin): profile is Student {
  return 'student_number' in profile
}

export function UserProfileDialog() {
  const { profile, role } = useAuth()
  if (!profile) return null

  const name = 'name' in profile && profile.name ? profile.name : profile.email
  const student = isStudent(profile) ? profile : null
  const admin = isStudent(profile) ? null : profile

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full" aria-label="View profile">
          <User className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="sr-only">Your profile</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-3 pb-2 text-center">
          <Avatar className="size-16">
            <AvatarFallback className="text-lg">{initials(name || '?')}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-base font-semibold">{name}</p>
            <Badge variant="outline" className="mt-1 capitalize">
              {role}
            </Badge>
          </div>
        </div>

        <div className="space-y-3 border-t pt-4 text-sm">
          <div className="flex items-center gap-3">
            <Mail className="size-4 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground">{profile.email}</span>
          </div>
          {student && (
            <>
              <div className="flex items-center gap-3">
                <IdCard className="size-4 shrink-0 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Student ID: <span className="text-foreground">{student.student_number}</span>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="size-4 shrink-0 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Status: <span className="text-foreground capitalize">{student.status}</span>
                </span>
              </div>
            </>
          )}
          {admin && (
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-4 shrink-0 text-muted-foreground" />
              <span className="text-muted-foreground">
                Role: <span className="text-foreground capitalize">{admin.role}</span>
              </span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
