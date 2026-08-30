import {
  CloudLightning,
  CloudRain,
  Mountain,
  ThermometerSun,
  Tornado,
  Waves,
  type LucideIcon,
} from 'lucide-react'
import type { EventType, VerificationStatus } from '@/lib/types'

export interface EventTypeConfig {
  label: EventType
  icon: LucideIcon
  /** Raw color used for map markers and charts (Leaflet needs literal colors). */
  color: string
}

export const EVENT_CONFIG: Record<EventType, EventTypeConfig> = {
  Flood: { label: 'Flood', icon: Waves, color: '#3b9dff' },
  'Heavy Rain': { label: 'Heavy Rain', icon: CloudRain, color: '#38bdf8' },
  Cyclone: { label: 'Cyclone', icon: Tornado, color: '#a78bfa' },
  Storm: { label: 'Storm', icon: CloudLightning, color: '#818cf8' },
  Landslide: { label: 'Landslide', icon: Mountain, color: '#f59e0b' },
  Heatwave: { label: 'Heatwave', icon: ThermometerSun, color: '#f87171' },
}

export const EVENT_TYPES = Object.keys(EVENT_CONFIG) as EventType[]

export interface StatusConfig {
  label: string
  color: string
  /** Tailwind classes for badges. */
  className: string
}

export const STATUS_CONFIG: Record<VerificationStatus, StatusConfig> = {
  verified: {
    label: 'Verified',
    color: '#34d399',
    className: 'bg-success/15 text-success border-success/30',
  },
  pending: {
    label: 'Pending',
    color: '#fbbf24',
    className: 'bg-warning/15 text-warning border-warning/30',
  },
  'high-risk': {
    label: 'High Risk',
    color: '#f87171',
    className: 'bg-danger/15 text-danger border-danger/40',
  },
}

export function trustScoreColor(score: number): string {
  if (score >= 85) return 'text-success'
  if (score >= 65) return 'text-warning'
  return 'text-danger'
}

export const INDIAN_STATES = [
  'All States',
  'Andhra Pradesh',
  'Assam',
  'Delhi',
  'Himachal Pradesh',
  'Karnataka',
  'Kerala',
  'Maharashtra',
  'Odisha',
  'Rajasthan',
  'West Bengal',
]
