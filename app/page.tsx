import { Navbar } from '@/components/navbar'
import { DashboardClient } from '@/components/dashboard-client'
import { getAlerts, getDashboardStats, getWeatherEvents } from '@/lib/services/api'

export default async function DashboardPage() {
  const [events, stats, alerts] = await Promise.all([
    getWeatherEvents(),
    getDashboardStats(),
    getAlerts(),
  ])

  return (
    <main className="min-h-screen grid-texture">
      <Navbar />
      <DashboardClient events={events} stats={stats} alerts={alerts} />
    </main>
  )
}
