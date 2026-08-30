'use client'

import { useEffect, useState } from 'react'
import {
  Brain,
  Clock,
  MapPin,
  Navigation,
  Radio,
  Users,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { EVENT_CONFIG, trustScoreColor } from '@/lib/event-config'
import { getEventById } from '@/lib/services/api'
import { StatusBadge } from '@/components/status-badge'
import { formatDateTime, formatNumber } from '@/lib/format'
import type { EventDetail } from '@/lib/types'

export function EventDetailsPanel({
  eventId,
  onClose,
}: {
  eventId: string | null
  onClose: () => void
}) {
  const [detail, setDetail] = useState<EventDetail | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!eventId) return
    let active = true
    setLoading(true)
    setDetail(null)
    getEventById(eventId).then((d) => {
      if (active) {
        setDetail(d)
        setLoading(false)
      }
    })
    return () => {
      active = false
    }
  }, [eventId])

  const open = eventId !== null

  return (
    <>
      <div
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-[900] bg-background/60 backdrop-blur-sm transition-opacity',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        aria-hidden
      />
      <aside
        role="dialog"
        aria-label="Event details"
        aria-modal="true"
        className={cn(
          'fixed right-0 top-0 z-[1000] flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-2xl transition-transform duration-300',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {loading && <PanelSkeleton onClose={onClose} />}
        {!loading && detail && <PanelContent detail={detail} onClose={onClose} />}
        {!loading && eventId && !detail && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
            <p className="text-sm text-muted-foreground">Could not load this event.</p>
            <button
              onClick={onClose}
              className="rounded-md bg-secondary px-4 py-2 text-sm font-medium"
            >
              Close
            </button>
          </div>
        )}
      </aside>
    </>
  )
}

function PanelHeader({ onClose, title }: { onClose: () => void; title: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border px-5 py-4">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {title}
      </span>
      <button
        onClick={onClose}
        aria-label="Close panel"
        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

function PanelSkeleton({ onClose }: { onClose: () => void }) {
  return (
    <>
      <PanelHeader onClose={onClose} title="Loading event" />
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        <div className="h-44 w-full animate-pulse rounded-lg bg-muted" />
        <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-20 w-full animate-pulse rounded bg-muted" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-16 animate-pulse rounded bg-muted" />
          <div className="h-16 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </>
  )
}

function PanelContent({ detail, onClose }: { detail: EventDetail; onClose: () => void }) {
  const config = EVENT_CONFIG[detail.type]
  const Icon = config.icon
  return (
    <>
      <PanelHeader onClose={onClose} title="Event details" />
      <div className="flex-1 overflow-y-auto">
        {detail.mediaUrl && (
          <div className="relative h-48 w-full overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={detail.mediaUrl || '/placeholder.svg'}
              alt={`${detail.type} at ${detail.city}, ${detail.state}`}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
            <div className="absolute bottom-3 left-4 flex items-center gap-2">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-md"
                style={{ background: config.color, color: '#0b1220' }}
              >
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <span className="text-sm font-semibold" style={{ color: config.color }}>
                {detail.type}
              </span>
            </div>
          </div>
        )}

        <div className="space-y-5 p-5">
          <div>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold leading-snug text-balance">{detail.title}</h2>
              <StatusBadge status={detail.status} />
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" aria-hidden />
              {detail.city}, {detail.state}
            </p>
          </div>

          <p className="text-sm leading-relaxed text-foreground/90">{detail.description}</p>

          {/* Trust + ML */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border bg-secondary/40 p-3">
              <span className="text-xs text-muted-foreground">Trust Score</span>
              <p className={cn('mt-1 font-mono text-2xl font-semibold', trustScoreColor(detail.trustScore))}>
                {detail.trustScore}
                <span className="text-sm text-muted-foreground">/100</span>
              </p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-current"
                  style={{ width: `${detail.trustScore}%` }}
                />
              </div>
            </div>
            <div className="rounded-lg border border-border bg-secondary/40 p-3">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Brain className="h-3.5 w-3.5" /> ML Classification
              </span>
              <p className="mt-1 text-sm font-medium leading-tight">{detail.mlClassification}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Confidence{' '}
                <span className="font-mono font-semibold text-foreground">
                  {(detail.mlConfidence * 100).toFixed(0)}%
                </span>
              </p>
            </div>
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-lg border border-border p-4 text-sm">
            <Meta icon={Clock} label="Date & time" value={formatDateTime(detail.datetime)} />
            <Meta icon={Radio} label="Source" value={detail.sourceName} />
            <Meta icon={Navigation} label="Coordinates" value={detail.coordinatesLabel} mono />
            {detail.affectedPopulation !== undefined && (
              <Meta
                icon={Users}
                label="Affected"
                value={`~${formatNumber(detail.affectedPopulation)}`}
              />
            )}
          </div>

          {/* Timeline */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Verification Timeline
            </h3>
            <ol className="relative space-y-4 border-l border-border pl-5">
              {detail.timeline.map((t, i) => (
                <li key={i} className="relative">
                  <span
                    className={cn(
                      'absolute -left-[26px] top-1 h-3 w-3 rounded-full border-2 border-background',
                      i === detail.timeline.length - 1 ? 'bg-primary' : 'bg-muted-foreground',
                    )}
                  />
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-sm text-foreground">{t.label}</p>
                    <span className="shrink-0 font-mono text-[11px] text-muted-foreground">{t.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{t.actor}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* Related reports */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Related Reports ({detail.relatedReports.length})
            </h3>
            <div className="space-y-2">
              {detail.relatedReports.map((r) => (
                <div key={r.id} className="rounded-md border border-border bg-secondary/40 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-primary">{r.source}</span>
                    <span className="text-[11px] text-muted-foreground">
                      Trust{' '}
                      <span className={cn('font-mono font-semibold', trustScoreColor(r.trustScore))}>
                        {r.trustScore}
                      </span>
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{r.snippet}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function Meta({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: typeof Clock
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div>
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" aria-hidden />
        {label}
      </span>
      <p className={cn('mt-0.5 text-sm text-foreground', mono && 'font-mono text-xs')}>{value}</p>
    </div>
  )
}
