import { Navbar } from '@/components/navbar'

export default function Loading() {
  return (
    <main className="min-h-screen grid-texture">
      <Navbar />
      <div className="mx-auto max-w-[1400px] px-4 py-6 md:px-6">
        <div className="mb-6 h-8 w-96 max-w-full animate-pulse rounded bg-muted" />
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass h-32 animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="mb-4 h-14 animate-pulse rounded-lg bg-muted/50" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="h-[560px] animate-pulse rounded-lg bg-muted/40 lg:col-span-2" />
          <div className="h-[560px] animate-pulse rounded-lg bg-muted/40" />
        </div>
      </div>
    </main>
  )
}
