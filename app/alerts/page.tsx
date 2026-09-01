import { Navbar } from '@/components/navbar'
import { AlertCard } from '@/components/alert-card'
import { getAlerts } from '@/lib/services/api'

export const metadata = {
  title: 'Live Alerts — WeatherPulse India',
  description: 'Live weather and disaster alerts across India.',
}

export default async function AlertsPage() {
  const alerts = await getAlerts()

  return (
    <main className="min-h-screen grid-texture">
      <Navbar />

      <div className="mx-auto max-w-[1400px] px-4 py-8 md:px-6">

        {/* Header */}
        <header className="mb-8">
          <div className="mb-2 flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-danger" />
            </span>

            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-danger">
              Live Monitoring
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Live Alerts
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Verified weather and disaster alerts generated from WeatherPulse
            India event data.
          </p>
        </header>

        {/* Alert count */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Active Alerts
          </h2>

          <span className="text-xs text-muted-foreground">
            {alerts.length} alerts
          </span>
        </div>

        {/* Alerts */}
        {alerts.length === 0 ? (
          <div className="glass rounded-xl p-12 text-center">
            <p className="font-medium">
              No active alerts
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              There are currently no verified or high-risk weather events.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {alerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}