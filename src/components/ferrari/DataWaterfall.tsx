import { useEffect, useRef, useState } from 'react'

/* ============================================================
   DataWaterfall.tsx — flux de données capteurs en cascade.
   ============================================================ */

const CHANNELS = [
  { key: 'RH_F', color: '#00ff41', base: 24, amp: 6 },
  { key: 'RH_R', color: '#00ff41', base: 40, amp: 7 },
  { key: 'DF', color: '#dc0000', base: 880, amp: 180 },
  { key: 'LAT_G', color: '#ffb800', base: 2.4, amp: 1.8 },
  { key: 'SPD', color: '#f5f5f5', base: 262, amp: 80 },
]

interface Row {
  id: number
  t: string
  values: number[]
}

export function DataWaterfall({ rows = 14 }: { rows?: number }) {
  const [data, setData] = useState<Row[]>([])
  const counter = useRef(0)

  useEffect(() => {
    const id = setInterval(() => {
      counter.current += 1
      const t = counter.current * 0.2
      const now = new Date()
      const stamp = `${now.getMinutes().toString().padStart(2, '0')}:${now
        .getSeconds()
        .toString()
        .padStart(2, '0')}.${Math.floor((counter.current * 200) % 1000)
        .toString()
        .padStart(3, '0')}`
      const values = CHANNELS.map(
        (c) => c.base + Math.sin(t * 1.3 + c.base) * c.amp + (Math.random() - 0.5) * c.amp * 0.4,
      )
      setData((prev) => [{ id: counter.current, t: stamp, values }, ...prev].slice(0, rows))
    }, 200)
    return () => clearInterval(id)
  }, [rows])

  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#1f1f1f] px-4 py-3">
        <span className="badge-live">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00ff41] animate-pulse-dot" />
          Flux télémétrie · CAN
        </span>
        <span className="label-mono">{rows} dernières trames</span>
      </div>

      <div className="grid grid-cols-[80px_repeat(5,1fr)] gap-px bg-[#1f1f1f] text-[11px]">
        <div className="bg-[#121212] px-3 py-2 label-mono">TIME</div>
        {CHANNELS.map((c) => (
          <div key={c.key} className="bg-[#121212] px-3 py-2 label-mono" style={{ color: c.color }}>
            {c.key}
          </div>
        ))}

        {data.map((row, i) => (
          <FragmentRow key={row.id} row={row} fade={i / data.length} />
        ))}
      </div>
    </div>
  )
}

function FragmentRow({ row, fade }: { row: Row; fade: number }) {
  return (
    <>
      <div
        className="bg-[#0d0d0d] px-3 py-1.5 value-mono text-[#8a8a8a]"
        style={{ opacity: 1 - fade * 0.7 }}
      >
        {row.t}
      </div>
      {row.values.map((v, idx) => (
        <div
          key={idx}
          className="bg-[#0d0d0d] px-3 py-1.5 value-mono"
          style={{ color: CHANNELS[idx].color, opacity: 1 - fade * 0.7 }}
        >
          {v.toFixed(idx === 3 ? 2 : 0)}
        </div>
      ))}
    </>
  )
}
