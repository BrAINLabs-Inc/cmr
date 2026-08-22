import { Outlet, useLocation } from 'react-router-dom'
import { AppSidebar } from './AppSidebar'
import { studentNav, adminNav } from './nav-config'
import { useAuth } from '@/hooks/use-auth'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'

function pageTitle(pathname: string, role: 'student' | 'admin' | null) {
  const nav = role === 'admin' ? adminNav : studentNav
  const match = nav.find((item) => (item.end ? pathname === item.url : pathname.startsWith(item.url)))
  if (match) return match.title
  if (pathname.startsWith('/diary/')) return 'Weekly Diary'
  return 'CMR Digital Diary'
}

export function AppShell() {
  const { role } = useAuth()
  const location = useLocation()

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-sm font-medium text-foreground">{pageTitle(location.pathname, role)}</h1>
        </header>
        <main className="flex-1 px-6 py-8">
          <div className="mx-auto w-full max-w-5xl">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
