'use client'

import { Search, SlidersHorizontal, X } from 'lucide-react'
import { EVENT_TYPES, INDIAN_STATES } from '@/lib/event-config'
import type { EventType, VerificationStatus } from '@/lib/types'

export interface Filters {
  query: string
  state: string
  type: EventType | 'all'
  status: VerificationStatus | 'all'
  date: string
}

export const DEFAULT_FILTERS: Filters = {
  query: '',
  state: 'All States',
  type: 'all',
  status: 'all',
  date: '',
}

const selectClass =
  'h-9 rounded-md border border-input bg-secondary/60 px-3 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30'

export function FilterBar({
  filters,
  onChange,
}: {
  filters: Filters
  onChange: (next: Filters) => void
}) {
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    onChange({ ...filters, [key]: value })

  const isDirty =
    filters.query !== '' ||
    filters.state !== 'All States' ||
    filters.type !== 'all' ||
    filters.status !== 'all' ||
    filters.date !== ''

  return (
    <div className="glass flex flex-wrap items-center gap-2 rounded-lg p-2.5">
      <div className="flex items-center gap-1.5 pl-1 pr-1 text-muted-foreground">
        <SlidersHorizontal className="h-4 w-4" aria-hidden />
        <span className="text-xs font-medium uppercase tracking-wider">Filters</span>
      </div>

      <div className="relative min-w-[180px] flex-1">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={filters.query}
          onChange={(e) => set('query', e.target.value)}
          placeholder="Search location or event..."
          aria-label="Search location or event"
          className="h-9 w-full rounded-md border border-input bg-secondary/60 pl-8 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
      </div>

      <select
        aria-label="Filter by state"
        className={selectClass}
        value={filters.state}
        onChange={(e) => set('state', e.target.value)}
      >
        {INDIAN_STATES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <select
        aria-label="Filter by event type"
        className={selectClass}
        value={filters.type}
        onChange={(e) => set('type', e.target.value as Filters['type'])}
      >
        <option value="all">All Event Types</option>
        {EVENT_TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      <select
        aria-label="Filter by verification status"
        className={selectClass}
        value={filters.status}
        onChange={(e) => set('status', e.target.value as Filters['status'])}
      >
        <option value="all">All Statuses</option>
        <option value="verified">Verified</option>
        <option value="pending">Pending</option>
        <option value="high-risk">High Risk</option>
      </select>

      <input
        type="date"
        aria-label="Filter by date"
        className={selectClass}
        value={filters.date}
        onChange={(e) => set('date', e.target.value)}
      />

      {isDirty && (
        <button
          type="button"
          onClick={() => onChange(DEFAULT_FILTERS)}
          className="flex h-9 items-center gap-1 rounded-md px-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <X className="h-4 w-4" aria-hidden />
          Clear
        </button>
      )}
    </div>
  )
}
