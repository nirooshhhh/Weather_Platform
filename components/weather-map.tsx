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
import 'leaflet/dist/leaflet.css'

import { EVENT_CONFIG, STATUS_CONFIG } from '@/lib/event-config'
import type { WeatherData, WeatherEvent } from '@/lib/types'

/* =========================================================
   DISASTER MARKER
========================================================= */

function markerHtml(event: WeatherEvent): string {
  const color = EVENT_CONFIG[event.type].color
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
   WEATHER MARKER
========================================================= */

function weatherMarkerHtml(weather: WeatherData): string {
  let icon = '🌤️'
  let label = 'Weather'

  const code = weather.weatherCode

  if (code === 0) {
    icon = '☀️'
    label = 'Clear'
  } else if (code >= 1 && code <= 3) {
    icon = '⛅'
    label = 'Cloudy'
  } else if (code === 45 || code === 48) {
    icon = '🌫️'
    label = 'Fog'
  } else if (code >= 51 && code <= 57) {
    icon = '🌦️'
    label = 'Drizzle'
  } else if (code >= 61 && code <= 67) {
    icon = '🌧️'
    label = 'Rain'
  } else if (code >= 71 && code <= 77) {
    icon = '❄️'
    label = 'Snow'
  } else if (code >= 80 && code <= 82) {
    icon = '🌦️'
    label = 'Rain Showers'
  } else if (code >= 85 && code <= 86) {
    icon = '🌨️'
    label = 'Snow Showers'
  } else if (code >= 95 && code <= 99) {
    icon = '⛈️'
    label = 'Thunderstorm'
  }

  return `
    <div
      title="${label}"
      style="
        width:34px;
        height:34px;
        border-radius:9999px;
        background:white;
        border:2px solid #3b9dff;
        box-shadow:0 2px 10px rgba(0,0,0,0.25);
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:17px;
      "
    >
      ${icon}
    </div>
  `
}

/* =========================================================
   FLY TO SELECTED DISASTER
========================================================= */

function FlyToSelection({
  event,
}: {
  event: WeatherEvent | null
}) {
  const map = useMap()

  if (event) {
    map.flyTo([event.lat, event.lng], 6, {
      duration: 0.8,
    })
  }

  return null
}

/* =========================================================
   WEATHER MAP
========================================================= */

export default function WeatherMap({
  events,
  weather,
  selectedId,
  onSelect,
}: {
  events: WeatherEvent[]
  weather: WeatherData[]
  selectedId?: string | null
  onSelect: (event: WeatherEvent) => void
}) {
  /* -------------------------------------------------------
     Disaster marker icons
  ------------------------------------------------------- */

  const icons = useMemo(
    () =>
      Object.fromEntries(
        events.map((event) => [
          event.id,
          L.divIcon({
            html: markerHtml(event),
            className: '',
            iconSize: [22, 22],
            iconAnchor: [11, 11],
          }),
        ]),
      ),
    [events],
  )

  /* -------------------------------------------------------
     Weather marker icons
  ------------------------------------------------------- */

  const weatherIcons = useMemo(
    () =>
      Object.fromEntries(
        weather.map((item) => [
          item.id,
          L.divIcon({
            html: weatherMarkerHtml(item),
            className: '',
            iconSize: [34, 34],
            iconAnchor: [17, 17],
          }),
        ]),
      ),
    [weather],
  )

  const selected =
    events.find((event) => event.id === selectedId) ?? null

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
      {/* =====================================================
          BASE MAP
      ===================================================== */}

      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* =====================================================
          WEATHER MARKERS
      ===================================================== */}

      {weather.map((item) => (
        <Marker
          key={`weather-${item.id}`}
          position={[item.lat, item.lng]}
          icon={weatherIcons[item.id]}
        >
          <Popup>
            <div className="min-w-[200px]">
              <h3 className="text-base font-semibold">
                {item.city}, {item.state}
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                Current Weather
              </p>

              <div className="mt-3 space-y-1.5 text-sm">
                <p>
                  🌡️ Temperature:{' '}
                  <strong>{item.temperature}°C</strong>
                </p>

                <p>
                  💧 Humidity:{' '}
                  <strong>{item.humidity}%</strong>
                </p>

                <p>
                  🌤️ Condition:{' '}
                  <strong>{item.condition || item.weather}</strong>
                </p>

                <p>
                  💨 Wind:{' '}
                  <strong>{item.windSpeed} km/h</strong>
                </p>

                <p>
                  🌧️ Precipitation:{' '}
                  <strong>{item.precipitation} mm</strong>
                </p>
              </div>

              <p className="mt-3 text-[10px] text-gray-400">
                Updated: {item.updatedAt}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* =====================================================
          DISASTER EVENT MARKERS
      ===================================================== */}

      {events.map((event) => (
        <Marker
          key={`event-${event.id}`}
          position={[event.lat, event.lng]}
          icon={icons[event.id]}
          eventHandlers={{
            click: () => onSelect(event),
          }}
        />
      ))}

      {/* =====================================================
          FLY TO SELECTED EVENT
      ===================================================== */}

      <FlyToSelection event={selected} />
    </MapContainer>
  )
}