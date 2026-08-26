import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

type AuthLayoutProps = {
  illustration: string
  eyebrow: string
  title: string
  description: string
  reverse?: boolean
  children: ReactNode
}

export function AuthLayout({ illustration, eyebrow, title, description, reverse = false, children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-svh flex-col bg-background lg:flex-row">
      <div
        className={cn(
          'relative hidden flex-col items-center justify-center gap-8 overflow-hidden bg-primary/5 px-12 lg:flex lg:w-1/2',
          reverse && 'lg:order-2'
        )}
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 [background-image:radial-gradient(var(--border)_1px,transparent_1px)] [background-size:26px_26px] opacity-30" />
          <div className="absolute -top-24 left-1/4 -z-10 aspect-square w-[28rem] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-16 right-0 -z-10 aspect-square w-[20rem] rounded-full bg-emerald-400/10 blur-3xl" />
        </div>

        <div className="relative">
          <div aria-hidden className="pointer-events-none absolute inset-8 -z-10 rounded-full bg-primary/10 blur-3xl" />
          <img src={illustration} alt="" className="w-full max-w-md object-contain" />
        </div>

        <div className="max-w-sm text-center">
          <p className="text-sm font-medium text-primary">{eyebrow}</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-balance">{title}</h2>
          <p className="mt-2 text-sm text-muted-foreground text-balance">{description}</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-4 py-6 sm:px-6 sm:py-8 lg:px-12">
        <Link
          to="/"
          className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to home
        </Link>
        <div className="flex flex-1 items-center justify-center py-6">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
    </div>
  )
}
