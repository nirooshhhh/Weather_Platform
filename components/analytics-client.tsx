'use client'

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { TrendingUp, ShieldCheck, MapPinned, Activity } from 'lucide-react'
import type { AnalyticsData } from '@/lib/types'
import { EVENT_CONFIG } from '@/lib/event-config'

const CHART_COLORS = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
  'var(--color-primary)',
]

const VERIFY_COLORS: Record<string, string> = {
  Verified: 'var(--color-success)',
  Pending: 'var(--color-warning)',
  'High Risk': 'var(--color-destructive)',
}

function ChartCard({
  title,
  subtitle,
  icon: Icon,
  children,
  className,
}: {
  title: string
  subtitle: string
  icon: React.ElementType
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      className={`flex flex-col rounded-xl border border-border bg-card p-5 ${className ?? ''}`}
    >
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary text-primary">
          <Icon className="h-4.5 w-4.5" aria-hidden />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  )
}

function TooltipBox({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      {label && <p className="mb-1 font-medium text-foreground">{label}</p>}
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-2 text-muted-foreground">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="capitalize">{p.name}</span>
          <span className="ml-auto font-mono font-medium text-foreground">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

const AXIS = {
  stroke: 'var(--color-muted-foreground)',
  fontSize: 11,
  tickLine: false,
  axisLine: false,
}

export function AnalyticsClient({ data }: { data: AnalyticsData }) {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <ChartCard
        title="Event Volume Over Time"
        subtitle="Detected vs ML-verified events, last 8 days"
        icon={TrendingUp}
        className="lg:col-span-2"
      >
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data.eventsOverTime} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="gEvents" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gVerified" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-success)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--color-success)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" {...AXIS} />
            <YAxis {...AXIS} width={44} />
            <Tooltip content={<TooltipBox />} cursor={{ stroke: 'var(--color-border)' }} />
            <Area
              type="monotone"
              dataKey="events"
              stroke="var(--color-primary)"
              strokeWidth={2}
              fill="url(#gEvents)"
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="verified"
              stroke="var(--color-success)"
              strokeWidth={2}
              fill="url(#gVerified)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Event Type Distribution"
        subtitle="Share of total detected events by category"
        icon={Activity}
      >
        <div className="flex items-center gap-4">
          <ResponsiveContainer width="55%" height={220}>
            <PieChart>
              <Pie
                data={data.typeDistribution}
                dataKey="value"
                nameKey="type"
                innerRadius={52}
                outerRadius={90}
                paddingAngle={2}
                stroke="var(--color-card)"
                strokeWidth={2}
                isAnimationActive={false}
              >
                {data.typeDistribution.map((entry, i) => (
                  <Cell key={entry.type} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<TooltipBox />} />
            </PieChart>
          </ResponsiveContainer>
          <ul className="flex flex-1 flex-col gap-2">
            {data.typeDistribution.map((entry, i) => (
              <li key={entry.type} className="flex items-center gap-2 text-xs">
                <span
                  className="h-2.5 w-2.5 rounded-sm"
                  style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                />
                <span className="text-muted-foreground">{EVENT_CONFIG[entry.type].label}</span>
                <span className="ml-auto font-mono font-medium text-foreground">{entry.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </ChartCard>

      <ChartCard
        title="Verification Breakdown"
        subtitle="Current status of all ingested reports"
        icon={ShieldCheck}
      >
        <div className="flex items-center gap-4">
          <ResponsiveContainer width="55%" height={220}>
            <PieChart>
              <Pie
                data={data.verification}
                dataKey="value"
                nameKey="name"
                innerRadius={52}
                outerRadius={90}
                paddingAngle={2}
                stroke="var(--color-card)"
                strokeWidth={2}
                isAnimationActive={false}
              >
                {data.verification.map((entry) => (
                  <Cell key={entry.name} fill={VERIFY_COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip content={<TooltipBox />} />
            </PieChart>
          </ResponsiveContainer>
          <ul className="flex flex-1 flex-col gap-2">
            {data.verification.map((entry) => (
              <li key={entry.name} className="flex items-center gap-2 text-xs">
                <span
                  className="h-2.5 w-2.5 rounded-sm"
                  style={{ background: VERIFY_COLORS[entry.name] }}
                />
                <span className="text-muted-foreground">{entry.name}</span>
                <span className="ml-auto font-mono font-medium text-foreground">{entry.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </ChartCard>

      <ChartCard
        title="State-wise Event Count"
        subtitle="Top affected states this monsoon season"
        icon={MapPinned}
      >
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={data.stateWise}
            layout="vertical"
            margin={{ top: 0, right: 12, left: 8, bottom: 0 }}
          >
            <XAxis type="number" {...AXIS} />
            <YAxis type="category" dataKey="state" {...AXIS} width={92} />
            <Tooltip content={<TooltipBox />} cursor={{ fill: 'var(--color-secondary)' }} />
            <Bar
              dataKey="events"
              fill="var(--color-primary)"
              radius={[0, 4, 4, 0]}
              barSize={16}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="High-Risk Event Trend"
        subtitle="High-risk vs total events over 6 months"
        icon={TrendingUp}
      >
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data.highRiskTrend} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
            <XAxis dataKey="month" {...AXIS} />
            <YAxis {...AXIS} width={44} />
            <Tooltip content={<TooltipBox />} cursor={{ stroke: 'var(--color-border)' }} />
            <Line
              type="monotone"
              dataKey="total"
              stroke="var(--color-chart-2)"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="highRisk"
              stroke="var(--color-destructive)"
              strokeWidth={2}
              dot={{ r: 3, fill: 'var(--color-destructive)' }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
