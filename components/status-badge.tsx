import { CheckCircle2, Clock, TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import { STATUS_CONFIG } from '@/lib/event-config'
import type { VerificationStatus } from '@/lib/types'

const ICONS = {
  verified: CheckCircle2,
  pending: Clock,
  'high-risk': TriangleAlert,
} as const

export function StatusBadge({
  status,
  className,
}: {
  status: VerificationStatus
  className?: string
}) {
  const config = STATUS_CONFIG[status]
  const Icon = ICONS[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-xs font-medium tracking-wide',
        config.className,
        className,
      )}
    >
      <Icon className="h-3 w-3" aria-hidden />
      {config.label}
    </span>
  )
}
