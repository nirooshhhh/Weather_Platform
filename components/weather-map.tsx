'use client'

import { useMemo } from 'react'
import L from 'leaflet'
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  Popup,
} from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import 'leaflet/dist/leaflet.css'

import { EVENT_CONFIG, STATUS_CONFIG } from '@/lib/event-config'
import type { WeatherData, WeatherEvent } from '@/lib/types'

// Fix default Leaflet icon paths in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

/* =========================================================
   DISASTER MARKER HTML
========================================================= */

function markerHtml(event: WeatherEvent): string {
  const color = EVENT_CONFIG[event.type]?.color || '#3b9dff'
  const isHighRisk = event.status === 'high-risk'

  const ring =
    event.status === 'pending'
      ? `border:2px dashed ${STATUS_CONFIG.pending.color};`
      : `border:2px solid ${
          event.status === 'verified'
            ? STATUS_CONFIG.verified.color
            : STATUS_CONFIG['high-risk'].color
        };`

  const ping = isHighRisk
    ? `<span
        style="
          position:absolute;
          inset:0;
          border-radius:9999px;
          background:${color};
          animation:marker-ping 1.6s cubic-bezier(0,0,0.2,1) infinite;
        "
      ></span>`
    : ''

  return `
    <div style="position:relative;width:22px;height:22px;">
      ${ping}

      <span
        style="
          position:relative;
          display:flex;
          width:22px;
          height:22px;
          border-radius:9999px;
          ${ring}
          background:${color};
          box-shadow:0 0 12px ${color}99;
        "
      ></span>
    </div>
  `
}

/* =========================================================
   WEATHER MARKER HTML
========================================================= */

function weatherMarkerHtml(weather: WeatherData): string {
  let icon = '🌤️'
  const code = weather.weatherCode

  if (code === 0) icon = '☀️'
  else if (code >= 1 && code <= 3) icon = '⛅'
  else if (code === 45 || code === 48) icon = '🌫️'
  else if (code >= 51 && code <= 57) icon = '🌦️'
  else if (code >= 61 && code <= 67) icon = '🌧️'
  else if (code >= 71 && code <= 77) icon = '❄️'
  else if (code >= 80 && code <= 82) icon = '🌦️'
  else if (code >= 85 && code <= 86) icon = '🌨️'
  else if (code >= 95 && code <= 99) icon = '⛈️'

  const tempVal = weather.temperature !== undefined ? Math.round(weather.temperature) : 'N/A'

  return `
    <div
      style="
        width:42px;
        height:28px;
        padding:2px 4px;
        border-radius:8px;
        background:rgba(255,255,255,0.95);
        border:1px solid rgba(59,157,255,0.4);
        box-shadow:0 2px 6px rgba(0,0,0,0.25);
        display:flex;
        align-items:center;
        justify-content:center;
        gap:3px;
        line-height:1;
        font-family:sans-serif;
      "
    >
      <span style="font-size:12px;">${icon}</span>
      <span style="font-size:11px;font-weight:700;color:#111827;white-space:nowrap;">
        ${tempVal}°
      </span>
    </div>
  `
}

/* =========================================================
   FLY TO SELECTED DISASTER
========================================================= */

function FlyToSelection({ event }: { event: WeatherEvent | null }) {
  const map = useMap()

  if (event) {
    const lat = (event as any).lat ?? (event as any).latitude
    const lng = (event as any).lng ?? (event as any).longitude

    if (lat !== undefined && lng !== undefined) {
      map.flyTo([lat, lng], 6, { duration: 0.8 })
    }
  }

  return null
}

/* =========================================================
   WEATHER MAP COMPONENT
========================================================= */

export default function WeatherMap({
  events = [],
  weather = [],
  selectedId,
  onSelect,
}: {
  events?: WeatherEvent[]
  weather?: WeatherData[]
  selectedId?: string | null
  onSelect?: (event: WeatherEvent) => void
}) {
  // Safely filter disaster events that contain valid coordinates
  const validEvents = useMemo(() => {
    return (events || []).filter((event) => {
      const lat = (event as any)?.lat ?? (event as any)?.latitude
      const lng = (event as any)?.lng ?? (event as any)?.longitude
      return typeof lat === 'number' && !isNaN(lat) && typeof lng === 'number' && !isNaN(lng)
    })
  }, [events])

  // Safely filter weather items that contain valid coordinates
  const validWeather = useMemo(() => {
    return (weather || []).filter((item) => {
      const lat = item?.lat
      const lng = item?.lng
      return typeof lat === 'number' && !isNaN(lat) && typeof lng === 'number' && !isNaN(lng)
    })
  }, [weather])

  /* Disaster marker icons */
  const icons = useMemo(() => {
    return Object.fromEntries(
      validEvents.map((event) => [
        event.id,
        L.divIcon({
          html: markerHtml(event),
          className: '',
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        }),
      ])
    )
  }, [validEvents])

  /* Weather marker icons */
  const weatherIcons = useMemo(() => {
    return Object.fromEntries(
      validWeather.map((item) => [
        item.id,
        L.divIcon({
          html: weatherMarkerHtml(item),
          className: '',
          iconSize: [42, 28],
          iconAnchor: [21, 14],
        }),
      ])
    )
  }, [validWeather])

  const selected = validEvents.find((event) => event.id === selectedId) ?? null

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
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Clustered Weather Markers */}
      <MarkerClusterGroup
        chunkedLoading
        maxClusterRadius={40}
        spiderfyOnMaxZoom={true}
        showCoverageOnHover={false}
      >
        {validWeather.map((item) => (
          <Marker
            key={`weather-${item.id}`}
            position={[item.lat, item.lng]}
            icon={weatherIcons[item.id]}
          >
            <Popup>
              <div className="min-w-[210px] p-1 text-slate-800">
                <h3 className="text-base font-semibold">
                  {item.nearestPlace?.city ?? item.city ?? 'Unknown location'}
                  {item.nearestPlace?.state || item.state ? `, ${item.nearestPlace?.state || item.state}` : ''}
                </h3>

                <p className="mt-0.5 text-xs text-slate-500">Current Weather</p>

                <div className="mt-2 space-y-1 text-xs text-slate-700">
                  <p>🌡️ Temperature: <strong>{item.temperature}°C</strong></p>
                  <p>💧 Humidity: <strong>{item.humidity}%</strong></p>
                  <p>🌤️ Condition: <strong>{item.condition || item.weather}</strong></p>
                  <p>💨 Wind: <strong>{item.windSpeed} km/h</strong></p>
                  <p>🌧️ Precipitation: <strong>{item.precipitation} mm</strong></p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200 text-xs space-y-1">
                  <p>🤖 AI Classification: <strong>{item.classification || 'Normal Weather'}</strong></p>
                  <p>
                    ⚠️ Risk Level:{' '}
                    <strong
                      className={
                        item.risk === 'critical'
                          ? 'text-red-600 font-bold'
                          : item.risk === 'high'
                          ? 'text-orange-600 font-bold'
                          : 'text-emerald-600 font-bold'
                      }
                    >
                      {(item.risk || 'low').toUpperCase()}
                    </strong>
                  </p>
                  <p>🎯 AI Confidence: <strong>{item.confidence ? `${Math.round(item.confidence * 100)}%` : '90%'}</strong></p>
                </div>

                <p className="mt-2 text-[10px] text-slate-400">
                  Updated: {item.updatedAt}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>

      {/* Disaster Event Markers */}
      {validEvents.map((event) => {
        const lat = (event as any).lat ?? (event as any).latitude
        const lng = (event as any).lng ?? (event as any).longitude

        return (
          <Marker
            key={`event-${event.id}`}
            position={[lat, lng]}
            icon={icons[event.id]}
            eventHandlers={{
              click: () => onSelect && onSelect(event),
            }}
          />
        )
      })}

      <FlyToSelection event={selected} />
    </MapContainer>
  )
}