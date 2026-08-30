/**
 * WeatherPulse India — API service layer.
 *
 * These functions currently return realistic mock data with a simulated
 * network delay. Each function is structured to map cleanly onto a future
 * FastAPI backend. Replace the body of each function with a `fetch()` call to
 * the corresponding endpoint (see the comment above each function) and keep
 * the same return shape.
 */

import type {
  Alert,
  AnalyticsData,
  CitizenReportInput,
  DashboardStats,
  EventDetail,
  PendingReport,
  WeatherEvent,
} from '@/lib/types'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '' // e.g. https://api.weatherpulse.in

function delay<T>(data: T, ms = 500): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms))
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const EVENTS: WeatherEvent[] = [
  {
    id: 'evt-1001',
    type: 'Flood',
    title: 'Severe urban flooding in low-lying areas',
    state: 'Kerala',
    city: 'Kochi',
    lat: 9.9312,
    lng: 76.2673,
    datetime: '2026-08-28T06:20:00+05:30',
    description:
      'Continuous heavy downpour over 36 hours has inundated several wards. Water levels rising near the backwaters; multiple relief camps opened.',
    source: 'Government',
    sourceName: 'Kerala State Disaster Management Authority',
    trustScore: 96,
    status: 'verified',
    mediaUrl: '/media/flood.png',
    mlClassification: 'Flood — Urban Inundation',
    mlConfidence: 0.97,
    affectedPopulation: 48000,
  },
  {
    id: 'evt-1002',
    type: 'Cyclone',
    title: 'Cyclonic storm approaching eastern coast',
    state: 'Odisha',
    city: 'Puri',
    lat: 19.8135,
    lng: 85.8312,
    datetime: '2026-08-28T04:10:00+05:30',
    description:
      'A deep depression has intensified into a cyclonic storm over the Bay of Bengal. Landfall expected within 18 hours with wind speeds up to 120 km/h.',
    source: 'Government',
    sourceName: 'India Meteorological Department',
    trustScore: 98,
    status: 'high-risk',
    mediaUrl: '/media/cyclone.png',
    mlClassification: 'Cyclone — Severe',
    mlConfidence: 0.99,
    affectedPopulation: 210000,
  },
  {
    id: 'evt-1003',
    type: 'Heavy Rain',
    title: 'Intense rainfall triggers waterlogging',
    state: 'Maharashtra',
    city: 'Mumbai',
    lat: 19.076,
    lng: 72.8777,
    datetime: '2026-08-28T07:45:00+05:30',
    description:
      'Red alert issued as the city records 210mm rain in 12 hours. Local train services disrupted on the Western line.',
    source: 'News Website',
    sourceName: 'National Weather Wire',
    trustScore: 82,
    status: 'verified',
    mediaUrl: '/media/heavy-rain.png',
    mlClassification: 'Heavy Rainfall — Extreme',
    mlConfidence: 0.91,
    affectedPopulation: 95000,
  },
  {
    id: 'evt-1004',
    type: 'Landslide',
    title: 'Landslide blocks national highway',
    state: 'Himachal Pradesh',
    city: 'Manali',
    lat: 32.2396,
    lng: 77.1887,
    datetime: '2026-08-27T22:30:00+05:30',
    description:
      'A hillside slope collapsed onto NH-3 following prolonged rain. Traffic diverted; rescue teams clearing debris.',
    source: 'Citizen Report',
    sourceName: 'Verified citizen — R. Thakur',
    trustScore: 64,
    status: 'pending',
    mediaUrl: '/media/landslide.png',
    mlClassification: 'Landslide — Debris Flow',
    mlConfidence: 0.78,
    affectedPopulation: 3200,
  },
  {
    id: 'evt-1005',
    type: 'Heatwave',
    title: 'Prolonged heatwave conditions persist',
    state: 'Rajasthan',
    city: 'Jaisalmer',
    lat: 26.9157,
    lng: 70.9083,
    datetime: '2026-08-27T15:00:00+05:30',
    description:
      'Temperatures crossed 47°C for the third consecutive day. Health advisory issued for outdoor workers.',
    source: 'Government',
    sourceName: 'India Meteorological Department',
    trustScore: 93,
    status: 'verified',
    mediaUrl: '/media/heatwave.png',
    mlClassification: 'Heatwave — Severe',
    mlConfidence: 0.94,
    affectedPopulation: 27000,
  },
  {
    id: 'evt-1006',
    type: 'Storm',
    title: 'Thunderstorm with lightning reported',
    state: 'West Bengal',
    city: 'Kolkata',
    lat: 22.5726,
    lng: 88.3639,
    datetime: '2026-08-28T05:30:00+05:30',
    description:
      'Squally thunderstorm with frequent lightning. Several trees uprooted in the southern suburbs.',
    source: 'Social Media',
    sourceName: 'Aggregated social signals',
    trustScore: 58,
    status: 'pending',
    mediaUrl: '/media/storm.png',
    mlClassification: 'Thunderstorm — Moderate',
    mlConfidence: 0.72,
    affectedPopulation: 12000,
  },
  {
    id: 'evt-1007',
    type: 'Flood',
    title: 'River breaches embankment',
    state: 'Assam',
    city: 'Guwahati',
    lat: 26.1445,
    lng: 91.7362,
    datetime: '2026-08-28T03:15:00+05:30',
    description:
      'The Brahmaputra crossed the danger mark, breaching an embankment and submerging farmland across several villages.',
    source: 'Government',
    sourceName: 'Assam State Disaster Management Authority',
    trustScore: 95,
    status: 'high-risk',
    mediaUrl: '/media/flood.png',
    mlClassification: 'Flood — Riverine',
    mlConfidence: 0.96,
    affectedPopulation: 132000,
  },
  {
    id: 'evt-1008',
    type: 'Heavy Rain',
    title: 'Monsoon surge over Western Ghats',
    state: 'Karnataka',
    city: 'Madikeri',
    lat: 12.4244,
    lng: 75.7382,
    datetime: '2026-08-27T20:00:00+05:30',
    description:
      'Orange alert as heavy to very heavy rainfall lashes the Kodagu region. Reservoir inflow rising sharply.',
    source: 'News Website',
    sourceName: 'National Weather Wire',
    trustScore: 79,
    status: 'verified',
    mediaUrl: '/media/heavy-rain.png',
    mlClassification: 'Heavy Rainfall — High',
    mlConfidence: 0.88,
    affectedPopulation: 18000,
  },
  {
    id: 'evt-1009',
    type: 'Storm',
    title: 'Dust storm reduces visibility',
    state: 'Delhi',
    city: 'New Delhi',
    lat: 28.6139,
    lng: 77.209,
    datetime: '2026-08-27T18:40:00+05:30',
    description:
      'A sudden dust storm brought visibility down to under 500m. Flights briefly delayed at the airport.',
    source: 'Social Media',
    sourceName: 'Aggregated social signals',
    trustScore: 61,
    status: 'pending',
    mediaUrl: '/media/storm.png',
    mlClassification: 'Dust Storm — Moderate',
    mlConfidence: 0.75,
    affectedPopulation: 40000,
  },
  {
    id: 'evt-1010',
    type: 'Cyclone',
    title: 'Coastal wind warning issued',
    state: 'Andhra Pradesh',
    city: 'Visakhapatnam',
    lat: 17.6868,
    lng: 83.2185,
    datetime: '2026-08-28T02:00:00+05:30',
    description:
      'Fishermen advised not to venture into the sea as a low pressure system strengthens off the coast.',
    source: 'Government',
    sourceName: 'India Meteorological Department',
    trustScore: 90,
    status: 'verified',
    mediaUrl: '/media/cyclone.png',
    mlClassification: 'Cyclone — Developing',
    mlConfidence: 0.85,
    affectedPopulation: 56000,
  },
]

const ALERTS: Alert[] = [
  {
    id: 'alt-1',
    type: 'Cyclone',
    title: 'Cyclonic storm — landfall imminent',
    location: 'Puri, Odisha',
    severity: 'critical',
    datetime: '2026-08-28T04:10:00+05:30',
  },
  {
    id: 'alt-2',
    type: 'Flood',
    title: 'Brahmaputra breaches embankment',
    location: 'Guwahati, Assam',
    severity: 'critical',
    datetime: '2026-08-28T03:15:00+05:30',
  },
  {
    id: 'alt-3',
    type: 'Heavy Rain',
    title: 'Red alert — extreme rainfall',
    location: 'Mumbai, Maharashtra',
    severity: 'severe',
    datetime: '2026-08-28T07:45:00+05:30',
  },
  {
    id: 'alt-4',
    type: 'Heatwave',
    title: 'Severe heatwave advisory',
    location: 'Jaisalmer, Rajasthan',
    severity: 'moderate',
    datetime: '2026-08-27T15:00:00+05:30',
  },
]

const ANALYTICS: AnalyticsData = {
  eventsOverTime: [
    { date: 'Aug 21', events: 34, verified: 21 },
    { date: 'Aug 22', events: 41, verified: 27 },
    { date: 'Aug 23', events: 38, verified: 25 },
    { date: 'Aug 24', events: 52, verified: 33 },
    { date: 'Aug 25', events: 61, verified: 44 },
    { date: 'Aug 26', events: 73, verified: 51 },
    { date: 'Aug 27', events: 88, verified: 62 },
    { date: 'Aug 28', events: 96, verified: 68 },
  ],
  typeDistribution: [
    { type: 'Flood', value: 118 },
    { type: 'Heavy Rain', value: 96 },
    { type: 'Cyclone', value: 42 },
    { type: 'Storm', value: 61 },
    { type: 'Landslide', value: 28 },
    { type: 'Heatwave', value: 37 },
  ],
  stateWise: [
    { state: 'Assam', events: 62 },
    { state: 'Kerala', events: 54 },
    { state: 'Maharashtra', events: 49 },
    { state: 'Odisha', events: 41 },
    { state: 'West Bengal', events: 38 },
    { state: 'Karnataka', events: 33 },
    { state: 'Rajasthan', events: 27 },
    { state: 'Himachal Pradesh', events: 21 },
  ],
  verification: [
    { name: 'Verified', value: 248 },
    { name: 'Pending', value: 96 },
    { name: 'High Risk', value: 38 },
  ],
  highRiskTrend: [
    { month: 'Mar', highRisk: 8, total: 120 },
    { month: 'Apr', highRisk: 12, total: 156 },
    { month: 'May', highRisk: 19, total: 188 },
    { month: 'Jun', highRisk: 31, total: 240 },
    { month: 'Jul', highRisk: 44, total: 312 },
    { month: 'Aug', highRisk: 38, total: 382 },
  ],
}

function toPendingReport(e: WeatherEvent): PendingReport {
  return {
    id: e.id,
    type: e.type,
    location: `${e.city}, ${e.state}`,
    source: e.source,
    trustScore: e.trustScore,
    status: e.status,
    datetime: e.datetime,
    description: e.description,
    mlClassification: e.mlClassification,
    mediaUrl: e.mediaUrl,
  }
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
  // return fetch(`${API_BASE}/api/analytics`).then((r) => r.json())
  return delay(ANALYTICS)
}

/** POST /api/reports */
export async function submitCitizenReport(
  input: CitizenReportInput,
): Promise<{ id: string; status: 'received' }> {
  const response = await fetch(`${API_BASE}/api/reports`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: input.type,
      description: input.description,
      location: input.location,
      lat: input.lat,
      lng: input.lng,
      datetime: input.datetime,
      media_name: input.mediaName,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to submit citizen report')
  }

  return response.json()
}

/** GET /api/admin/reports?status=pending */
export async function getPendingReports(): Promise<PendingReport[]> {
  const response = await fetch(
    `${API_BASE}/api/admin/reports?status=pending`,
    {
      cache: 'no-store',
    }
  )

  if (!response.ok) {
    throw new Error('Failed to fetch pending reports')
  }

  return response.json()
}

export async function verifyReport(
  id: string
): Promise<{ id: string; status: 'verified' }> {
  const response = await fetch(
    `${API_BASE}/api/admin/reports/${id}/verify`,
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
    `${API_BASE}/api/admin/reports/${id}/reject`,
    {
      method: 'POST',
    }
  )

  if (!response.ok) {
    throw new Error('Failed to reject report')
  }

  return response.json()
}
