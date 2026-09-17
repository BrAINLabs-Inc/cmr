import { Outlet, useLocation } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { AppSidebar } from './AppSidebar'
import { studentNav, adminNav } from './nav-config'
import { useAuth } from '@/hooks/use-auth'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { UserProfileDialog } from '@/components/UserProfileDialog'

function pageTitle(pathname: string, role: 'student' | 'admin' | null) {
  const nav = role === 'admin' ? adminNav : studentNav
  const match = nav.find((item) => (item.end ? pathname === item.url : pathname.startsWith(item.url)))
  if (match) return match.title
  if (pathname.startsWith('/diary/')) return 'Weekly Diary'
  return 'CMR Digital Diary'
}

export function AppShell() {
  const { role, signOut } = useAuth()
  const location = useLocation()

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="truncate text-sm font-medium text-foreground">{pageTitle(location.pathname, role)}</h1>
          <div className="ml-auto flex items-center gap-2">
            <UserProfileDialog />
            <Button variant="outline" size="icon" className="rounded-full" aria-label="Sign out" onClick={() => signOut()}>
              <LogOut className="size-4" />
            </Button>
          </div>
        </header>
        <main className="relative flex-1 overflow-hidden px-3 py-5 sm:px-6 sm:py-8">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 hidden sm:block">
            <div className="absolute -right-40 -top-24 aspect-square w-[32rem] rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -right-16 bottom-0 aspect-square w-[22rem] rounded-full bg-emerald-400/10 blur-3xl" />
            <div className="absolute inset-y-0 right-0 w-[36rem] [background-image:radial-gradient(var(--border)_1px,transparent_1px)] [background-size:26px_26px] [mask-image:linear-gradient(to_left,black,transparent)] opacity-40" />
          </div>
          <div className="relative mx-auto w-full max-w-6xl">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
