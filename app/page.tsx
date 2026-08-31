import { Navbar } from '@/components/navbar'
import { DashboardClient } from '@/components/dashboard-client'
import {
  getAlerts,
  getDashboardStats,
  getWeatherEvents,
  getWeather,
} from '@/lib/services/api'

export default async function DashboardPage() {
  const [events, stats, alerts, weather] = await Promise.all([
    getWeatherEvents(),
    getDashboardStats(),
    getAlerts(),
    getWeather(),
  ])

  return (
    <main className="min-h-screen grid-texture">
      <Navbar />
      <DashboardClient events={events} stats={stats} alerts={alerts} weather={weather} />
    </main>
  )
}
