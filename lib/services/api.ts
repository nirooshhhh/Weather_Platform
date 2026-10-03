/**
 * WeatherPulse India — API service layer.
 *
 * These functions currently handle fetching data from the FastAPI backend.
 * Each function maps cleanly onto a FastAPI endpoint and maintains typed return shapes.
 */

import type {
  Alert,
  AnalyticsData,
  CitizenReportInput,
  DashboardStats,
  EventDetail,
  PendingReport,
  WeatherEvent,
  WeatherData,
} from '@/lib/types'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000'

function delay<T>(data: T, ms = 500): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms))
}

// ---------------------------------------------------------------------------
// Type Definitions for New Report Features
// ---------------------------------------------------------------------------

export interface NewReportInput {
  event_type: string
  title: string
  description?: string
  lat: number
  lng: number
}

export interface ReportItem {
  id: number
  event_type: string
  title: string
  description?: string
  lat: number
  lng: number
  upvotes: number
  status: string
  created_at: string
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** GET /api/dashboard/stats */
export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await fetch(`${API_BASE}/api/dashboard/stats`)

  if (!response.ok) {
    throw new Error('Failed to fetch dashboard statistics')
  }

  return response.json()
}

/** GET /api/alerts */
export async function getAlerts(): Promise<Alert[]> {
  const response = await fetch(`${API_BASE}/api/alerts`)

  if (!response.ok) {
    throw new Error('Failed to fetch alerts')
  }

  return response.json()
}

/** GET /api/events */
export async function getWeatherEvents(): Promise<WeatherEvent[]> {
  const response = await fetch(`${API_BASE}/api/events`)

  if (!response.ok) {
    throw new Error('Failed to fetch weather events')
  }

  return response.json()
}

/** GET /api/events/:id */
export async function getEventById(
  id: string,
): Promise<EventDetail | null> {
  const response = await fetch(`${API_BASE}/api/events/${id}`)

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error('Failed to fetch event details')
  }

  const event = await response.json()

  return {
    ...event,
    coordinatesLabel: `${event.lat.toFixed(4)}° N, ${event.lng.toFixed(4)}° E`,
    relatedReports: [],
    timeline: [],
  }
}

/** GET /api/analytics */
export async function getAnalytics(): Promise<AnalyticsData> {
  const response = await fetch(`${API_BASE}/api/analytics`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('Failed to fetch analytics data')
  }

  return response.json()
}

/** POST /api/reports/ (Legacy form compatibility) */
/** POST /api/reports/ (Legacy form compatibility) */
export async function submitCitizenReport(
  input: CitizenReportInput,
): Promise<{ id: string; status: 'received' }> {
  const response = await fetch(`${API_BASE}/api/reports/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      event_type: input.type || 'Flood',
      title: input.location ? `Report near ${input.location}` : 'Citizen Field Report',
      description: input.description || '',
      lat: typeof input.lat === 'number' && !isNaN(input.lat) ? input.lat : 9.9312,
      lng: typeof input.lng === 'number' && !isNaN(input.lng) ? input.lng : 76.2673,
    }),
  })

  if (!response.ok) {
    const errorDetail = await response.text()
    console.error('Report submission backend error:', errorDetail)
    throw new Error('Failed to submit citizen report')
  }

  return response.json()
}

/** POST /api/reports/ (New modal submission interface) */
export async function submitReport(report: NewReportInput): Promise<ReportItem> {
  const response = await fetch(`${API_BASE}/api/reports/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(report),
  })

  if (!response.ok) {
    throw new Error('Failed to submit report')
  }

  return response.json()
}

/** POST /api/reports/:id/upvote */
export async function upvoteReport(reportId: number): Promise<{ id: number; upvotes: number; status: string }> {
  const response = await fetch(`${API_BASE}/api/reports/${reportId}/upvote`, {
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error('Failed to upvote report')
  }

  return response.json()
}

/** GET /api/reports/ */
export async function fetchReports(): Promise<ReportItem[]> {
  const response = await fetch(`${API_BASE}/api/reports/`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('Failed to fetch reports')
  }

  return response.json()
}

/** GET /api/admin/reports?status=pending */
/** GET /api/reports/admin/reports?status=pending */
/** GET /api/reports/admin/reports?status=pending */
export async function getPendingReports(): Promise<PendingReport[]> {
  try {
    const response = await fetch(`${API_BASE}/api/reports/admin/reports?status=pending`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    return data.map((r: any) => ({
      id: String(r.id),
      type: r.event_type,
      location: `Lat: ${r.lat.toFixed(2)}, Lng: ${r.lng.toFixed(2)}`,
      source: 'Citizen Report',
      trustScore: r.trust_score, // Uses real verified percentage computed by telemetry & ML
      status: r.status,
      datetime: r.created_at,
      description: r.description || r.title,
      mlClassification: r.ml_classification,
    }))
  } catch (err) {
    console.error('Error fetching pending reports:', err)
    return []
  }
}

export async function verifyReport(
  id: string
): Promise<{ id: string; status: 'verified' }> {
  const response = await fetch(
    `${API_BASE}/api/reports/admin/reports/${id}/verify`,
    {
      method: 'POST',
    }
  )

  if (!response.ok) {
    throw new Error('Failed to verify report')
  }

  return response.json()
}

export async function rejectReport(
  id: string
): Promise<{ id: string; status: 'rejected' }> {
  const response = await fetch(
    `${API_BASE}/api/reports/admin/reports/${id}/reject`,
    {
      method: 'POST',
    }
  )

  if (!response.ok) {
    throw new Error('Failed to reject report')
  }

  return response.json()
}

/** GET /api/weather */
export async function getWeather(): Promise<WeatherData[]> {
  const response = await fetch(`${API_BASE}/api/weather`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('Failed to fetch weather data')
  }

  return response.json()
}