import { Car3DPanel, TelemetryPanel } from '../Dashboard'
import type { AeroResult, LiveTelemetry, SetupState } from '../Dashboard'
import { SectionHeader } from '../atoms'

/* ============================================================
   TelemetryView — wrap Car3DPanel + TelemetryPanel.
   ============================================================ */

export function TelemetryView({
  setup,
  aero,
  live,
}: {
  setup: SetupState
  aero: AeroResult
  live: LiveTelemetry
}) {
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        index="TELEMETRY"
        title="Plateforme aéro & flux live"
        subtitle="Le profil réagit en direct à l'assiette du setup ; la télémétrie défile à 200 ms."
      />
      <div className="grid gap-5 lg:grid-cols-2">
        <Car3DPanel setup={setup} aero={aero} />
        <TelemetryPanel live={live} />
      </div>
    </div>
  )
}
