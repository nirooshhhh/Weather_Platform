'use client'

import { useState } from 'react'
import { submitReport } from '@/lib/services/api'

export default function ReportModal({
  isOpen,
  onClose,
  onReportSubmitted,
}: {
  isOpen: boolean
  onClose: () => void
  onReportSubmitted?: () => void
}) {
  const [eventType, setEventType] = useState('Flood')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [lat, setLat] = useState('9.9312')
  const [lng, setLng] = useState('76.2673')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await submitReport({
        event_type: eventType,
        title,
        description,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      })
      setTitle('')
      setDescription('')
      onClose()
      if (onReportSubmitted) onReportSubmitted()
    } catch (err: any) {
      setError(err.message || 'Error submitting report')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl bg-slate-900 border border-slate-800 p-6 text-slate-100 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-1">Submit Field Report</h2>
        <p className="text-xs text-slate-400 mb-4">
          Report live disaster events in your vicinity to assist community response.
        </p>

        {error && (
          <div className="mb-4 rounded-md bg-red-500/10 border border-red-500/30 p-2 text-xs text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium mb-1 text-slate-300">Disaster Event Type</label>
            <select
              suppressHydrationWarning
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 p-2 text-slate-200 outline-none focus:border-cyan-500"
            >
              <option value="Flood">Flood</option>
              <option value="Heavy Rain">Heavy Rain</option>
              <option value="Storm">Storm</option>
              <option value="Heatwave">Heatwave</option>
              <option value="Landslide">Landslide</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1 text-slate-300">Title / Subject</label>
            <input
              type="text"
              required
              placeholder="e.g., Waterlogging on Main Road"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 p-2 text-slate-200 outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block font-medium mb-1 text-slate-300">Description</label>
            <textarea
              rows={3}
              placeholder="Provide details about severity, road blockages, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 p-2 text-slate-200 outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1 text-slate-300">Latitude</label>
              <input
                type="number"
                step="any"
                required
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="w-full rounded-lg bg-slate-800 border border-slate-700 p-2 text-slate-200 outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-slate-300">Longitude</label>
              <input
                type="number"
                step="any"
                required
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="w-full rounded-lg bg-slate-800 border border-slate-700 p-2 text-slate-200 outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-cyan-600 text-white font-medium hover:bg-cyan-500 transition-colors disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}