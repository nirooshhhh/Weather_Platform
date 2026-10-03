'use client'

import { useState } from 'react'
import { CheckCircle2, Upload, MapPin, Send, Loader2, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import ReportModal from '@/components/report-modal'
import { submitCitizenReport } from '@/lib/services/api'
import type { EventType } from '@/lib/types'

const EVENT_TYPES: EventType[] = [
  'Flood',
  'Heavy Rain',
  'Cyclone',
  'Storm',
  'Landslide',
  'Heatwave',
]

export default function ReportPage() {
  const [isReportOpen, setIsReportOpen] = useState(false)

  const [type, setType] = useState<EventType>('Flood')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [datetime, setDatetime] = useState('')
  const [mediaName, setMediaName] = useState('')

  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [reportId, setReportId] = useState('')

  const [error, setError] = useState('')

  async function getMyLocation() {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.')
      return
    }

    setError('')
    setLocationLoading(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        // Always keep exact GPS coordinates
        setLatitude(latitude)
        setLongitude(longitude)

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
            {
              headers: {
                Accept: 'application/json',
              },
            }
          )

          if (!response.ok) {
            throw new Error('Reverse geocoding failed')
          }

          const data = await response.json()
          const address = data.address || {}

          const city =
            address.city ||
            address.town ||
            address.municipality ||
            address.city_district ||
            address.county ||
            address.village ||
            ''

          const state = address.state || ''

          if (city && state) {
            setLocation(`${city}, ${state}`)
          } else if (state) {
            setLocation(state)
          } else {
            setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
          }
        } catch (err) {
          console.error('Reverse geocoding error:', err)
          setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
        } finally {
          setLocationLoading(false)
        }
      },
      (error) => {
        console.error('Geolocation error:', error)
        setError('Unable to get your location. Please allow location access and try again.')
        setLocationLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      }
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    setError('')

    if (!description || !location || !datetime) {
      setError('Please fill in all required fields.')
      return
    }

    try {
      setLoading(true)

      const result = await submitCitizenReport({
        type,
        description,
        location,
        lat: latitude ?? 0,
        lng: longitude ?? 0,
        datetime,
        mediaName,
      })

      setReportId(result.id)
      setSubmitted(true)
    } catch (err) {
      console.error(err)
      setError('Unable to submit the report. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-3xl items-center px-4 py-12">
        <div className="glass w-full rounded-xl p-8 text-center md:p-12">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle2 className="h-9 w-9 text-emerald-500" />
          </div>

          <h1 className="text-2xl font-semibold">Report Submitted Successfully</h1>

          <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
            Thank you for helping improve weather and disaster intelligence across India. Your
            report has been received and will be reviewed against live telemetry.
          </p>

          <div className="mx-auto mt-6 max-w-sm rounded-lg border border-border bg-secondary/40 p-4">
            <p className="text-xs text-muted-foreground">Report ID</p>
            <p className="mt-1 font-mono text-sm font-medium">{reportId}</p>

            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-amber-400">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              Pending verification
            </div>
          </div>

          <div className="mt-7 flex justify-center gap-3">
            <Link
              href="/"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              Back to Dashboard
            </Link>

            <button
              onClick={() => {
                setSubmitted(false)
                setReportId('')
                setDescription('')
                setLocation('')
                setDatetime('')
                setMediaName('')
              }}
              className="rounded-md border border-border bg-secondary px-4 py-2 text-sm font-medium transition hover:bg-secondary/70"
            >
              Submit Another
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="relative mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-12">
      {/* Header Bar Actions */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Citizen Reporting
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Report a Weather or Disaster Event
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Help WeatherPulse India identify and verify events happening in your area. Reports are
            reviewed before being marked as verified.
          </p>
        </div>

        {/* Quick Report Modal Trigger */}
        <button
          onClick={() => setIsReportOpen(true)}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-amber-500/20 px-4 py-2.5 text-xs font-semibold text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all"
        >
          <AlertTriangle className="h-4 w-4" />
          🚨 Quick Incident Report
        </button>
      </div>

      {/* Main Report Form */}
      <form onSubmit={handleSubmit} className="glass rounded-xl p-5 md:p-7">
        <div className="grid gap-6">
          {/* Event type */}
          <div>
            <label className="mb-2 block text-sm font-medium">Event Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as EventType)}
              className="w-full rounded-md border border-border bg-secondary/50 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
            >
              {EVENT_TYPES.map((eventType) => (
                <option key={eventType} value={eventType}>
                  {eventType}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you observed..."
              rows={5}
              required
              className="w-full resize-none rounded-md border border-border bg-secondary/50 px-3 py-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Location */}
          <div>
            <label className="mb-2 block text-sm font-medium">Location</label>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, State or use your current location"
                  required
                  className="w-full rounded-md border border-border bg-secondary/50 py-2.5 pl-10 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
                />
              </div>

              <button
                type="button"
                onClick={getMyLocation}
                disabled={locationLoading}
                className="inline-flex items-center gap-2 rounded-md border border-border bg-secondary px-3 py-2.5 text-sm font-medium hover:bg-secondary/70 disabled:opacity-60"
              >
                {locationLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MapPin className="h-4 w-4" />
                )}
                {locationLoading ? 'Locating...' : 'Use My Location'}
              </button>
            </div>

            {latitude !== null && longitude !== null && (
              <p className="mt-2 text-xs text-emerald-400">
                Location detected: {latitude.toFixed(5)}, {longitude.toFixed(5)}
              </p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="mb-2 block text-sm font-medium">Date & Time</label>
            <input
              type="datetime-local"
              value={datetime}
              onChange={(e) => setDatetime(e.target.value)}
              required
              className="w-full rounded-md border border-border bg-secondary/50 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Media */}
          <div>
            <label className="mb-2 block text-sm font-medium">Photo / Video</label>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-secondary/20 px-6 py-8 text-center transition hover:bg-secondary/40">
              <Upload className="mb-3 h-6 w-6 text-muted-foreground" />
              <span className="text-sm font-medium">Upload supporting media</span>
              <span className="mt-1 text-xs text-muted-foreground">JPG, PNG or video files</span>

              <input
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  setMediaName(file?.name ?? '')
                }}
              />

              {mediaName && (
                <span className="mt-3 text-xs text-primary">{mediaName}</span>
              )}
            </label>
          </div>

          {error && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Submit Report
              </>
            )}
          </button>
        </div>
      </form>

      {/* Field Incident Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        onReportSubmitted={() => {
          console.log('Incident report successfully submitted via modal.')
        }}
      />
    </main>
  )
}