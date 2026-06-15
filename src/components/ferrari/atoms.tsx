import type { ReactNode } from 'react'

/* ============================================================
   Atoms — briques UI réutilisables (race-day technique)
   ============================================================ */

type Accent = 'red' | 'green' | 'amber' | 'neutral'

const accentText: Record<Accent, string> = {
  red: 'text-[#dc0000]',
  green: 'text-[#00ff41]',
  amber: 'text-[#ffb800]',
  neutral: 'text-[#f5f5f5]',
}

const accentBar: Record<Accent, string> = {
  red: 'bg-[#dc0000]',
  green: 'bg-[#00ff41]',
  amber: 'bg-[#ffb800]',
  neutral: 'bg-[#3a3a3a]',
}

export function Kpi({
  label,
  value,
  unit,
  accent = 'neutral',
  sub,
}: {
  label: string
  value: string | number
  unit?: string
  accent?: Accent
  sub?: string
}) {
  return (
    <div className="panel p-4 flex flex-col gap-1.5">
      <span className="label-mono">{label}</span>
      <div className="flex items-baseline gap-1.5">
        <span className={`value-mono text-2xl font-bold ${accentText[accent]}`}>
          {value}
        </span>
        {unit && <span className="label-mono mb-0.5">{unit}</span>}
      </div>
      {sub && <span className="text-[11px] text-[#8a8a8a]">{sub}</span>}
      <span className={`h-px w-full mt-1 ${accentBar[accent]} opacity-40`} />
    </div>
  )
}

export function InfoCard({
  title,
  eyebrow,
  children,
  icon,
}: {
  title: string
  eyebrow?: string
  children: ReactNode
  icon?: ReactNode
}) {
  return (
    <div className="panel p-6 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        {icon && <span className="text-[#dc0000]">{icon}</span>}
        <div className="flex flex-col">
          {eyebrow && <span className="label-mono">{eyebrow}</span>}
          <h3 className="title-display text-lg">{title}</h3>
        </div>
      </div>
      <div className="text-sm leading-relaxed text-[#bdbdbd]">{children}</div>
    </div>
  )
}

export function MetricRow({
  label,
  value,
  unit,
  accent = 'neutral',
}: {
  label: string
  value: string | number
  unit?: string
  accent?: Accent
}) {
  return (
    <div className="flex items-center justify-between border-b border-[#1f1f1f] py-2 last:border-0">
      <span className="label-mono">{label}</span>
      <span className={`value-mono text-sm font-semibold ${accentText[accent]}`}>
        {value}
        {unit && <span className="label-mono ml-1">{unit}</span>}
      </span>
    </div>
  )
}

export function SectionHeader({
  index,
  title,
  subtitle,
  align = 'left',
}: {
  index?: string
  title: ReactNode
  subtitle?: string
  align?: 'left' | 'center'
}) {
  return (
    <div
      className={`flex flex-col gap-3 ${align === 'center' ? 'items-center text-center' : ''}`}
    >
      {index && (
        <span className="badge-live text-[#dc0000]">
          <span className="inline-block h-2 w-2 bg-[#dc0000]" />
          {index}
        </span>
      )}
      <h2 className="title-display text-3xl md:text-5xl text-balance">{title}</h2>
      {subtitle && (
        <p className="max-w-2xl text-sm md:text-base text-[#9a9a9a] leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  )
}

export function FeatureTile({
  title,
  desc,
  image,
  tag,
}: {
  title: string
  desc: string
  image?: string
  tag?: string
}) {
  return (
    <div className="panel group overflow-hidden flex flex-col">
      {image && (
        <div className="relative h-40 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent" />
          {tag && (
            <span className="absolute left-3 top-3 label-mono bg-black/70 px-2 py-1 text-[#00ff41]">
              {tag}
            </span>
          )}
        </div>
      )}
      <div className="flex flex-col gap-2 p-5">
        <h4 className="title-display text-base">{title}</h4>
        <p className="text-[13px] leading-relaxed text-[#9a9a9a]">{desc}</p>
      </div>
    </div>
  )
}

export function StatusPill({
  status,
}: {
  status: 'OPTIMAL' | 'SUBOPTIMAL' | 'CRITICAL'
}) {
  const map = {
    OPTIMAL: { c: 'text-[#00ff41] border-[#00ff41]/40 bg-[#00ff41]/10', d: 'bg-[#00ff41]' },
    SUBOPTIMAL: { c: 'text-[#ffb800] border-[#ffb800]/40 bg-[#ffb800]/10', d: 'bg-[#ffb800]' },
    CRITICAL: { c: 'text-[#dc0000] border-[#dc0000]/40 bg-[#dc0000]/10', d: 'bg-[#dc0000]' },
  }[status]
  return (
    <span
      className={`inline-flex items-center gap-2 border px-3 py-1 label-mono ${map.c}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${map.d} animate-pulse-dot`} />
      {status}
    </span>
  )
}
