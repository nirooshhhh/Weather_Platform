import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: number | string
  delta?: number
  icon: LucideIcon
  accent: string
  loading?: boolean
}

export function StatCard({ label, value, delta, icon: Icon, accent, loading }: StatCardProps) {
  const positive = (delta ?? 0) >= 0
  return (
    <div className="glass relative overflow-hidden rounded-lg p-5">
      <div
        className="absolute right-0 top-0 h-24 w-24 -translate-y-6 translate-x-6 rounded-full opacity-20 blur-2xl"
        style={{ background: accent }}
        aria-hidden
      />
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span
          className="flex h-9 w-9 items-center justify-center rounded-md"
          style={{ background: `color-mix(in oklab, ${accent} 18%, transparent)`, color: accent }}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </span>
      </div>
      {loading ? (
        <div className="mt-3 h-9 w-24 animate-pulse rounded bg-muted" />
      ) : (
        <p className="mt-2 font-mono text-3xl font-semibold tracking-tight">{value}</p>
      )}
      {delta !== undefined && !loading && (
        <div className="mt-2 flex items-center gap-1 text-xs">
          <span
            className={cn(
              'inline-flex items-center gap-0.5 font-medium',
              positive ? 'text-success' : 'text-danger',
            )}
          >
            {positive ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            {Math.abs(delta)}%
          </span>
          <span className="text-muted-foreground">vs last week</span>
        </div>
      )}
    </div>
  )
}
