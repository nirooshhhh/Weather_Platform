import { getAnalytics, getDashboardStats } from '@/lib/services/api'
import { AnalyticsClient } from '@/components/analytics-client'
import { StatCard } from '@/components/stat-card'
import { Layers, ShieldCheck, Clock, TriangleAlert } from 'lucide-react'

export const metadata = {
  title: 'Analytics — WeatherPulse India',
  description: 'Big-data analytics and trends for weather and disaster events across India.',
}

export default async function AnalyticsPage() {
  const [analytics, stats] = await Promise.all([getAnalytics(), getDashboardStats()])

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-8 md:px-6">
      <header className="mb-6">
        <p className="mb-1 text-xs font-medium uppercase tracking-[0.14em] text-primary">
          Big Data Analytics
        </p>
        <h1 className="text-pretty text-3xl font-bold tracking-tight md:text-4xl">
          Weather Intelligence Analytics
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Aggregated trends across {stats.totalEvents.toLocaleString()} events ingested from
          government feeds, news, social media, and citizen reports.
        </p>
      </header>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Events" value={stats.totalEvents} delta={stats.totalDelta} icon={Layers} accent="#3b9dff" />
        <StatCard label="Verified Reports" value={stats.verifiedReports} delta={stats.verifiedDelta} icon={ShieldCheck} accent="#34d399" />
        <StatCard label="Pending Reports" value={stats.pendingReports} delta={stats.pendingDelta} icon={Clock} accent="#fbbf24" />
        <StatCard label="High Risk Events" value={stats.highRiskEvents} delta={stats.highRiskDelta} icon={TriangleAlert} accent="#f87171" />
      </div>

      <AnalyticsClient data={analytics} />
    </main>
  )
}
