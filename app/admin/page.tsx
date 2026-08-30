import {
  getPendingReports,
  getDashboardStats,
} from '@/lib/services/api'
import { AdminReportsTable } from '@/components/admin-reports-table'
import {
  ShieldCheck,
  Clock,
  TriangleAlert,
  FileCheck2,
} from 'lucide-react'

export const metadata = {
  title: 'Admin — WeatherPulse India',
  description: 'WeatherPulse India report verification administration.',
}

export default async function AdminPage() {
  const [reports, stats] = await Promise.all([
    getPendingReports(),
    getDashboardStats(),
  ])

  const highRisk = reports.filter(
    (report) => report.status === 'high-risk'
  ).length

  const verified = reports.filter(
    (report) => report.status === 'verified'
  ).length

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-8 md:px-6">

      {/* Header */}
      <header className="mb-8">
        <div className="mb-2 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />

          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Administration
          </span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Report Verification Center
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Review incoming weather and disaster reports, inspect ML
          classifications and trust scores, and verify reliable information
          before it is published.
        </p>
      </header>

      {/* Admin statistics */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <AdminStat
          label="Pending Reports"
          value={stats.pendingReports}
          icon={Clock}
          accent="text-warning"
        />

        <AdminStat
          label="Verified Reports"
          value={stats.verifiedReports}
          icon={ShieldCheck}
          accent="text-success"
        />

        <AdminStat
          label="High Risk"
          value={stats.highRiskEvents}
          icon={TriangleAlert}
          accent="text-danger"
        />

        <AdminStat
          label="Reports Awaiting Review"
          value={reports.length}
          icon={FileCheck2}
          accent="text-primary"
        />

      </div>

      {/* Reports */}
      <section className="glass overflow-hidden rounded-xl">

        <div className="border-b border-border px-5 py-4">
          <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">

            <div>
              <h2 className="text-base font-semibold">
                Incoming Reports
              </h2>

              <p className="text-xs text-muted-foreground">
                Review and verify citizen, social media and other incoming
                reports.
              </p>
            </div>

            <div className="mt-2 text-xs text-muted-foreground md:mt-0">
              {reports.length} reports loaded
            </div>

          </div>
        </div>

        <AdminReportsTable initialReports={reports} />

      </section>

    </main>
  )
}


/* -------------------------------------------------------------------------- */
/* Admin Stat                                                                  */
/* -------------------------------------------------------------------------- */

function AdminStat({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string
  value: number
  icon: React.ElementType
  accent: string
}) {
  return (
    <div className="glass rounded-xl p-5">

      <div className="mb-4 flex items-center justify-between">

        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>

        <Icon className={`h-5 w-5 ${accent}`} />

      </div>

      <p className="text-2xl font-bold tracking-tight">
        {value.toLocaleString()}
      </p>

    </div>
  )
}