'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Activity, Radio, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const NAV = [
  { href: '/', label: 'Dashboard' },
  { href: '/alerts', label: 'Live Alerts' },
  { href: '/analytics', label: 'Analytics' },
  { href: '/reports', label: 'Reports' },
]

export function Navbar() {
  const pathname = usePathname()
  return (
    <header className="sticky top-0 z-[500] border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-6 px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Activity className="h-5 w-5" aria-hidden />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-[15px] font-semibold tracking-tight">
              WeatherPulse<span className="text-primary"> India</span>
            </span>
            <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              National Weather Intelligence
            </span>
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {NAV.map((item) => {
            const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <span className="hidden items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1.5 text-xs font-medium text-success sm:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            <Radio className="h-3.5 w-3.5" aria-hidden />
            Live feed active
          </span>
          <Button
            render={<Link href="/admin" />}
            nativeButton={false}
            variant="ghost"
            size="sm"
            className="hidden md:inline-flex"
          >
            <ShieldCheck className="h-4 w-4" aria-hidden />
            Admin
          </Button>
          <Button render={<Link href="/report" />} nativeButton={false} size="sm">
            Submit Report
          </Button>
        </div>
      </div>
    </header>
  )
}
