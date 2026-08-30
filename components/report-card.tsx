import { MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EVENT_CONFIG, trustScoreColor } from '@/lib/event-config'
import { StatusBadge } from '@/components/status-badge'
import { formatRelativeTime } from '@/lib/format'
import type { WeatherEvent } from '@/lib/types'

export function ReportCard({
  event,
  active,
  onClick,
}: {
  event: WeatherEvent
  active?: boolean
  onClick?: () => void
}) {
  const config = EVENT_CONFIG[event.type]
  const Icon = config.icon
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex w-full gap-3 rounded-md border border-transparent p-3 text-left transition-colors',
        active ? 'border-primary/40 bg-secondary' : 'hover:border-border hover:bg-secondary/50',
      )}
    >
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md"
        style={{ background: `color-mix(in oklab, ${config.color} 18%, transparent)`, color: config.color }}
      >
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-medium text-foreground">{event.title}</span>
          <span className="shrink-0 text-[11px] text-muted-foreground">
            {formatRelativeTime(event.datetime)}
          </span>
        </div>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" aria-hidden />
          {event.city}, {event.state}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <StatusBadge status={event.status} />
          <span className="text-[11px] text-muted-foreground">
            Trust <span className={cn('font-mono font-semibold', trustScoreColor(event.trustScore))}>
              {event.trustScore}
            </span>
          </span>
        </div>
      </div>
    </button>
  )
}
