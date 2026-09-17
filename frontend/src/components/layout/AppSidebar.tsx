import { NavLink, useLocation } from 'react-router-dom'
import { Flower2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import cmrLogo from '@/assets/cmr-logo.png'
import { studentNav, adminNav } from './nav-config'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'

const APP_VERSION = 'v1.0.0'

export function AppSidebar() {
  const { role } = useAuth()
  const location = useLocation()
  const nav = role === 'admin' ? adminNav : studentNav

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <NavLink to={role === 'admin' ? '/admin' : '/dashboard'}>
                <img src={cmrLogo} alt="" className="aspect-square size-8 shrink-0 rounded-full" />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">CMR Digital Diary</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {role === 'admin' ? 'Admin console' : 'Weekly reflection'}
                  </span>
                </div>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{role === 'admin' ? 'Administration' : 'Menu'}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map((item) => {
                const isActive = item.end ? location.pathname === item.url : location.pathname.startsWith(item.url)
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <NavLink to={item.url} end={item.end}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {role === 'student' && (
          <div className="mx-1 mb-1 flex flex-col items-center gap-2 rounded-lg border border-sidebar-border bg-primary/5 px-3 py-4 text-center group-data-[collapsible=icon]:hidden">
            <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Flower2 className="size-5" />
            </div>
            <p className="text-xs leading-relaxed text-sidebar-foreground/80">
              Take a few minutes each week to reflect, be aware and grow.
            </p>
          </div>
        )}
        <p className="px-2 pb-1 text-center text-xs text-sidebar-foreground/50 group-data-[collapsible=icon]:hidden">
          {APP_VERSION}
        </p>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
