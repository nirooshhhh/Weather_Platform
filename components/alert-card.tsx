import { MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EVENT_CONFIG } from '@/lib/event-config'
import type { Alert } from '@/lib/types'
import { formatRelativeTime } from '@/lib/format'

const SEVERITY: Record<Alert['severity'], { label: string; className: string; bar: string }> = {
  critical: { label: 'Critical', className: 'text-danger', bar: 'bg-danger' },
  severe: { label: 'Severe', className: 'text-warning', bar: 'bg-warning' },
  moderate: { label: 'Moderate', className: 'text-info', bar: 'bg-info' },
}

export function AlertCard({ alert }: { alert: Alert }) {
  const config = EVENT_CONFIG[alert.type]
  const severity = SEVERITY[alert.severity]
  const Icon = config.icon
  return (
    <div className="glass relative flex gap-3 overflow-hidden rounded-md p-3.5">
      <span className={cn('absolute inset-y-0 left-0 w-1', severity.bar)} aria-hidden />
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md"
        style={{ background: `color-mix(in oklab, ${config.color} 18%, transparent)`, color: config.color }}
      >
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className={cn('text-[11px] font-semibold uppercase tracking-wider', severity.className)}>
            {severity.label}
          </span>
          <span className="shrink-0 text-[11px] text-muted-foreground">
            {formatRelativeTime(alert.datetime)}
          </span>
        </div>
        <p className="mt-0.5 truncate text-sm font-medium text-foreground">{alert.title}</p>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" aria-hidden />
          {alert.location}
        </p>
      </div>
    </div>
  )
}
