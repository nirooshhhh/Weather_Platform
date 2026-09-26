export type EventType = 'Flood' | 'Heavy Rain' | 'Cyclone' | 'Storm' | 'Landslide' | 'Heatwave'

export type VerificationStatus = 'verified' | 'pending' | 'high-risk'

export type SourceType = 'Government' | 'Social Media' | 'News Website' | 'Citizen Report'

export interface WeatherEvent {
  id: string
  type: EventType
  title: string
  state: string
  city: string
  lat: number
  lng: number
  datetime: string
  description: string
  source: SourceType
  sourceName: string
  trustScore: number
  status: VerificationStatus
  mediaUrl?: string
  mlClassification: string
  mlConfidence: number
  affectedPopulation?: number
}

export interface RelatedReport {
  id: string
  source: SourceType
  snippet: string
  datetime: string
  trustScore: number
}

export interface TimelineEntry {
  time: string
  label: string
  actor: string
}

export interface EventDetail extends WeatherEvent {
  relatedReports: RelatedReport[]
  timeline: TimelineEntry[]
  coordinatesLabel: string
}

export interface DashboardStats {
  totalEvents: number
  verifiedReports: number
  pendingReports: number
  highRiskEvents: number
  totalDelta: number
  verifiedDelta: number
  pendingDelta: number
  highRiskDelta: number
}

export interface Alert {
  id: string
  type: EventType
  title: string
  location: string
  severity: 'critical' | 'severe' | 'moderate'
  datetime: string
}

export interface AnalyticsData {
  eventsOverTime: { date: string; events: number; verified: number }[]
  typeDistribution: { type: EventType; value: number }[]
  stateWise: { state: string; events: number }[]
  verification: { name: string; value: number }[]
  highRiskTrend: { month: string; highRisk: number; total: number }[]
}

export interface CitizenReportInput {
  type: EventType
  description: string
  location: string
  lat?: number | null
  lng?: number | null
  datetime: string
  mediaName?: string
}

export interface PendingReport {
  id: string
  type: EventType
  location: string
  source: SourceType
  trustScore: number
  status: VerificationStatus
  datetime: string
  description: string
  mlClassification: string
  mediaUrl?: string
}

export interface WeatherData {
  id: string
  city: string
  state: string
  nearestPlace?: {
  city: string
  state: string
  lat: number
  lng: number
}
  lat: number
  lng: number
  temperature: number
  humidity: number
  windSpeed: number
  precipitation: number
  weatherCode: number
  condition: string
  updatedAt: string
  weather: string
  classification?: string
  risk?: 'low' | 'high' | 'critical'
  confidence?: number
}