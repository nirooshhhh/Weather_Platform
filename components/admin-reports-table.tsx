'use client'

import { useState } from 'react'
import {
  Check,
  Eye,
  Loader2,
  X,
  ShieldCheck,
} from 'lucide-react'

import {
  rejectReport,
  verifyReport,
} from '@/lib/services/api'

import type { PendingReport } from '@/lib/types'


export function AdminReportsTable({
  initialReports,
}: {
  initialReports: PendingReport[]
}) {
  const [reports, setReports] = useState(initialReports)

  const [loadingId, setLoadingId] = useState<string | null>(null)

  const [selectedReport, setSelectedReport] =
    useState<PendingReport | null>(null)


  async function handleVerify(id: string) {
    try {
      setLoadingId(id)

      await verifyReport(id)

      setReports((current) =>
        current.filter((report) => report.id !== id)
      )
    } catch (error) {
      console.error(error)
      alert('Failed to verify report.')
    } finally {
      setLoadingId(null)
    }
  }


  async function handleReject(id: string) {
    try {
      setLoadingId(id)

      await rejectReport(id)

      setReports((current) =>
        current.filter((report) => report.id !== id)
      )
    } catch (error) {
      console.error(error)
      alert('Failed to reject report.')
    } finally {
      setLoadingId(null)
    }
  }


  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">

        <table className="w-full text-sm">

          <thead className="border-b border-border bg-secondary/20">

            <tr className="text-left text-xs text-muted-foreground">

              <th className="px-5 py-3 font-medium">
                Event
              </th>

              <th className="px-5 py-3 font-medium">
                Location
              </th>

              <th className="px-5 py-3 font-medium">
                Source
              </th>

              <th className="px-5 py-3 font-medium">
                Trust
              </th>

              <th className="px-5 py-3 font-medium">
                ML Classification
              </th>

              <th className="px-5 py-3 font-medium">
                Status
              </th>

              <th className="px-5 py-3 text-right font-medium">
                Actions
              </th>

            </tr>

          </thead>


          <tbody className="divide-y divide-border">

            {reports.map((report) => (

              <tr
                key={report.id}
                className="transition-colors hover:bg-secondary/20"
              >

                <td className="px-5 py-4">

                  <div className="font-medium">
                    {report.type}
                  </div>

                  <div className="mt-1 max-w-[240px] truncate text-xs text-muted-foreground">
                    {report.description}
                  </div>

                </td>


                <td className="px-5 py-4 text-muted-foreground">
                  {report.location}
                </td>


                <td className="px-5 py-4">
                  {report.source}
                </td>


                <td className="px-5 py-4">

                  <span
                    className={
                      report.trustScore >= 80
                        ? 'font-semibold text-success'
                        : report.trustScore >= 60
                          ? 'font-semibold text-warning'
                          : 'font-semibold text-danger'
                    }
                  >
                    {report.trustScore}%
                  </span>

                </td>


                <td className="px-5 py-4 text-xs text-muted-foreground">
                  {report.mlClassification}
                </td>


                <td className="px-5 py-4">

                  <span className="inline-flex items-center rounded-full border border-warning/30 bg-warning/10 px-2.5 py-1 text-[11px] font-medium text-warning">
                    {report.status}
                  </span>

                </td>


                <td className="px-5 py-4">

                  <div className="flex justify-end gap-2">

                    <button
                      onClick={() => setSelectedReport(report)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-secondary"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </button>


                    <button
                      disabled={loadingId === report.id}
                      onClick={() => handleVerify(report.id)}
                      className="inline-flex items-center gap-1.5 rounded-md bg-success px-2.5 py-1.5 text-xs font-semibold text-success-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                    >

                      {loadingId === report.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Check className="h-3.5 w-3.5" />
                      )}

                      Approve
                    </button>


                    <button
                      disabled={loadingId === report.id}
                      onClick={() => handleReject(report.id)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-danger/30 bg-danger/10 px-2.5 py-1.5 text-xs font-semibold text-danger transition-colors hover:bg-danger/20 disabled:opacity-50"
                    >

                      <X className="h-3.5 w-3.5" />

                      Reject
                    </button>

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>


        {reports.length === 0 && (

          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">

            <ShieldCheck className="mb-3 h-8 w-8 text-success" />

            <p className="font-medium">
              All reports reviewed
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              There are currently no reports waiting for verification.
            </p>

          </div>

        )}

      </div>


      {/* Mobile cards */}
      <div className="space-y-3 p-3 md:hidden">

        {reports.map((report) => (

          <div
            key={report.id}
            className="rounded-lg border border-border bg-card/50 p-4"
          >

            <div className="flex items-start justify-between gap-3">

              <div>
                <p className="font-semibold">
                  {report.type}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {report.location}
                </p>
              </div>

              <span className="text-sm font-semibold text-warning">
                {report.trustScore}%
              </span>

            </div>


            <p className="mt-3 text-sm text-muted-foreground">
              {report.description}
            </p>


            <div className="mt-4 flex gap-2">

              <button
                onClick={() => setSelectedReport(report)}
                className="flex-1 rounded-md border border-border px-3 py-2 text-xs font-medium"
              >
                View
              </button>

              <button
                disabled={loadingId === report.id}
                onClick={() => handleVerify(report.id)}
                className="flex-1 rounded-md bg-success px-3 py-2 text-xs font-semibold text-success-foreground disabled:opacity-50"
              >
                Approve
              </button>

              <button
                disabled={loadingId === report.id}
                onClick={() => handleReject(report.id)}
                className="flex-1 rounded-md bg-danger/10 px-3 py-2 text-xs font-semibold text-danger disabled:opacity-50"
              >
                Reject
              </button>

            </div>

          </div>

        ))}

      </div>


      {/* Details modal */}
      {selectedReport && (

        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">

          <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-border bg-card shadow-2xl">

            <div className="flex items-center justify-between border-b border-border px-5 py-4">

              <div>
                <p className="text-xs uppercase tracking-wider text-primary">
                  Report Details
                </p>

                <h2 className="mt-1 text-lg font-semibold">
                  {selectedReport.type}
                </h2>
              </div>

              <button
                onClick={() => setSelectedReport(null)}
                className="rounded-md p-2 hover:bg-secondary"
              >
                <X className="h-5 w-5" />
              </button>

            </div>


            <div className="space-y-5 p-5">

              <div className="grid grid-cols-2 gap-4">

                <Detail
                  label="Location"
                  value={selectedReport.location}
                />

                <Detail
                  label="Source"
                  value={selectedReport.source}
                />

                <Detail
                  label="Trust Score"
                  value={`${selectedReport.trustScore}%`}
                />

                <Detail
                  label="ML Classification"
                  value={selectedReport.mlClassification}
                />

              </div>


              <div>

                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Description
                </p>

                <p className="text-sm leading-6">
                  {selectedReport.description}
                </p>

              </div>


              {selectedReport.mediaUrl && (

                <div>

                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Submitted Media
                  </p>

                  <img
                    src={selectedReport.mediaUrl}
                    alt={`${selectedReport.type} report`}
                    className="max-h-72 w-full rounded-lg border border-border object-cover"
                  />

                </div>

              )}

            </div>


            <div className="flex justify-end gap-2 border-t border-border px-5 py-4">

              <button
                onClick={() => setSelectedReport(null)}
                className="rounded-md border border-border px-4 py-2 text-sm"
              >
                Close
              </button>

              <button
                disabled={loadingId === selectedReport.id}
                onClick={async () => {
                  await handleVerify(selectedReport.id)
                  setSelectedReport(null)
                }}
                className="rounded-md bg-success px-4 py-2 text-sm font-semibold text-success-foreground disabled:opacity-50"
              >
                Approve Report
              </button>

            </div>

          </div>

        </div>

      )}

    </>
  )
}


function Detail({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium">
        {value}
      </p>
    </div>
  )
}