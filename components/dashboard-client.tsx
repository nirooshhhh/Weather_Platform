'use client'

import { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import {
  ArrowUpRight,
  Layers,
  Loader2,
  MapPinOff,
  ShieldCheck,
  TriangleAlert,
  Clock,
} from 'lucide-react'

import { StatCard } from '@/components/stat-card'
import { FilterBar, DEFAULT_FILTERS, type Filters } from '@/components/filter-bar'
import { AlertCard } from '@/components/alert-card'
import { ReportCard } from '@/components/report-card'
import { EventDetailsPanel } from '@/components/event-details-panel'
import { EVENT_CONFIG } from '@/lib/event-config'

import type {
  Alert,
  DashboardStats,
  WeatherData,
  WeatherEvent,
} from '@/lib/types'

const WeatherMap = dynamic(() => import('@/components/weather-map'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-secondary/30">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  ),
})

export function DashboardClient({
  events,
  stats,
  alerts,
  weather,
}: {
  events: WeatherEvent[]
  stats: DashboardStats
  alerts: Alert[]
  weather: WeatherData[]
}) {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (filters.type !== 'all' && e.type !== filters.type) return false
      if (filters.status !== 'all' && e.status !== filters.status) return false
      if (filters.state !== 'All States' && e.state !== filters.state) return false
      if (filters.date && !e.datetime.startsWith(filters.date)) return false

      if (filters.query) {
        const q = filters.query.toLowerCase()
        const hay = `${e.title} ${e.city} ${e.state} ${e.type}`.toLowerCase()

        if (!hay.includes(q)) return false
      }

      return true
    })
  }, [events, filters])

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 md:px-6">

      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance md:text-3xl">
            National Weather &amp; Disaster Monitor
          </h1>

          <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground text-pretty">
            Real-time weather and disaster intelligence aggregated from government feeds, news,
            social signals, and citizen reports — verified by ML and mapped across India.
          </p>
        </div>

        <Link
          href="/analytics"
          className="inline-flex w-fit items-center gap-1.5 rounded-md border border-border bg-secondary/50 px-3.5 py-2 text-sm font-medium transition-colors hover:bg-secondary"
        >
          View analytics
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Events"
          value={stats.totalEvents}
          delta={stats.totalDelta}
          icon={Layers}
          accent="#3b9dff"
        />

        <StatCard
          label="Verified Reports"
          value={stats.verifiedReports}
          delta={stats.verifiedDelta}
          icon={ShieldCheck}
          accent="#34d399"
        />

        <StatCard
          label="Pending Reports"
          value={stats.pendingReports}
          delta={stats.pendingDelta}
          icon={Clock}
          accent="#fbbf24"
        />

        <StatCard
          label="High Risk Events"
          value={stats.highRiskEvents}
          delta={stats.highRiskDelta}
          icon={TriangleAlert}
          accent="#f87171"
        />
      </div>

      {/* Filters */}
      <div className="mb-4">
        <FilterBar
          filters={filters}
          onChange={setFilters}
        />
      </div>

      {/* Map + Live Alerts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

        {/* Map */}
        <div className="relative overflow-hidden rounded-lg border border-border lg:col-span-2">
          <div className="relative h-[420px] w-full md:h-[560px]">

            {filtered.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 bg-secondary/20 text-center">
                <MapPinOff className="h-8 w-8 text-muted-foreground" />

                <div>
                  <p className="text-sm font-medium">
                    No events match your filters
                  </p>

                  <button
                    onClick={() => setFilters(DEFAULT_FILTERS)}
                    className="mt-2 text-sm text-primary hover:underline"
                  >
                    Reset filters
                  </button>
                </div>
              </div>
            ) : (
              <WeatherMap
                events={filtered}
                weather={weather}
                selectedId={selectedId}
                onSelect={(event) => setSelectedId(event.id)}
              />
            )}

            {/* Event Legend */}
            <div className="glass pointer-events-none absolute bottom-3 left-3 z-[600] rounded-md p-3">
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Event types
              </p>

              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {Object.values(EVENT_CONFIG).map((c) => (
                  <span
                    key={c.label}
                    className="flex items-center gap-1.5 text-[11px] text-foreground"
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: c.color }}
                    />

                    {c.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Event Counter */}
            <div className="absolute right-3 top-3 z-[600] flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-2.5 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur">
              {filtered.length} of {events.length} events shown
            </div>

          </div>
        </div>

        {/* Live Alerts */}
        <div className="flex flex-col gap-4">
          <section className="glass flex min-h-0 flex-col rounded-lg p-4">

            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold">

                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-danger" />
                </span>

                Live Alerts
              </h2>

              <Link
                href="/alerts"
                className="text-xs text-primary hover:underline"
              >
                View all
              </Link>
            </div>

            <div className="space-y-2.5">
              {alerts.map((a) => (
                <AlertCard
                  key={a.id}
                  alert={a}
                />
              ))}
            </div>

          </section>
        </div>
      </div>

      {/* Recent Reports */}
      <section className="mt-6">

        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Recent Reports
          </h2>

          <Link
            href="/reports"
            className="text-sm text-primary hover:underline"
          >
            View all reports
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-2 rounded-lg border border-border bg-card/40 p-2 md:grid-cols-2 xl:grid-cols-3">

          {filtered.slice(0, 6).map((e) => (
            <ReportCard
              key={e.id}
              event={e}
              active={selectedId === e.id}
              onClick={() => setSelectedId(e.id)}
            />
          ))}

          {filtered.length === 0 && (
            <p className="col-span-full py-8 text-center text-sm text-muted-foreground">
              No reports to display.
            </p>
          )}

        </div>
      </section>

      {/* Event Details */}
      <EventDetailsPanel
        eventId={selectedId}
        onClose={() => setSelectedId(null)}
      />

    </div>
  )
}