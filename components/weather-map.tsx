'use client'

import { useMemo } from 'react'
import L from 'leaflet'
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { EVENT_CONFIG, STATUS_CONFIG } from '@/lib/event-config'
import type { WeatherEvent } from '@/lib/types'

function markerHtml(event: WeatherEvent): string {
  const color = EVENT_CONFIG[event.type].color
  const isHighRisk = event.status === 'high-risk'
  const ring =
    event.status === 'pending'
      ? `border:2px dashed ${STATUS_CONFIG.pending.color};`
      : `border:2px solid ${event.status === 'verified' ? STATUS_CONFIG.verified.color : STATUS_CONFIG['high-risk'].color};`
  const ping = isHighRisk
    ? `<span style="position:absolute;inset:0;border-radius:9999px;background:${color};animation:marker-ping 1.6s cubic-bezier(0,0,0.2,1) infinite;"></span>`
    : ''
  return `
    <div style="position:relative;width:22px;height:22px;">
      ${ping}
      <span style="position:relative;display:flex;width:22px;height:22px;border-radius:9999px;${ring}background:${color};box-shadow:0 0 12px ${color}99;"></span>
    </div>`
}

function FlyToSelection({ event }: { event: WeatherEvent | null }) {
  const map = useMap()
  if (event) {
    map.flyTo([event.lat, event.lng], 6, { duration: 0.8 })
  }
  return null
}

export default function WeatherMap({
  events,
  selectedId,
  onSelect,
}: {
  events: WeatherEvent[]
  selectedId?: string | null
  onSelect: (event: WeatherEvent) => void
}) {
  const icons = useMemo(
    () =>
      Object.fromEntries(
        events.map((e) => [
          e.id,
          L.divIcon({
            html: markerHtml(e),
            className: '',
            iconSize: [22, 22],
            iconAnchor: [11, 11],
          }),
        ]),
      ),
    [events],
  )

  const selected = events.find((e) => e.id === selectedId) ?? null

  return (
    <MapContainer
      center={[22.9, 80]}
      zoom={5}
      minZoom={4}
      maxZoom={9}
      scrollWheelZoom
      className="h-full w-full"
      style={{ background: 'var(--background)' }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {events.map((event) => (
        <Marker
          key={event.id}
          position={[event.lat, event.lng]}
          icon={icons[event.id]}
          eventHandlers={{ click: () => onSelect(event) }}
        />
      ))}
      <FlyToSelection event={selected} />
    </MapContainer>
  )
}
