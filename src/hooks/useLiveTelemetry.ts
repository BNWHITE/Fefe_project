import { useEffect, useRef, useState } from 'react'
import {
  computeAero,
  type LiveTelemetry,
  type SetupState,
} from '~/components/ferrari/Dashboard'

/* ============================================================
   useLiveTelemetry — simule une voiture roulante.
   setInterval 200ms → oscillations sinusoïdales + bruit.
   Les hauteurs rhF/rhR suivent le setup utilisateur ± noise.
   ============================================================ */

const GEARS = [
  { min: 0, gear: 1 },
  { min: 90, gear: 2 },
  { min: 140, gear: 3 },
  { min: 195, gear: 4 },
  { min: 245, gear: 5 },
  { min: 285, gear: 6 },
  { min: 320, gear: 7 },
  { min: 345, gear: 8 },
]

function gearFor(speed: number): number {
  let g = 1
  for (const step of GEARS) if (speed >= step.min) g = step.gear
  return g
}

function noise(amp: number) {
  return (Math.random() - 0.5) * 2 * amp
}

export function useLiveTelemetry(setup: SetupState): LiveTelemetry {
  // ref pour que l'intervalle persiste sans se réinitialiser à chaque slider
  const setupRef = useRef(setup)
  setupRef.current = setup

  const [telemetry, setTelemetry] = useState<LiveTelemetry>(() => ({
    speed: 240,
    rpm: 11000,
    gear: 6,
    latG: 1.2,
    downforce: computeAero(setup).downforce,
    rhFront: setup.rhFront,
    rhRear: setup.rhRear,
    tireTemp: 95,
    brakeTemp: 420,
    drs: false,
  }))

  useEffect(() => {
    let frame = 0
    const id = setInterval(() => {
      frame += 1
      const t = frame * 0.2 // secondes simulées
      const s = setupRef.current
      const aero = computeAero(s)

      // Profil de tour : phases d'accélération / freinage
      const lap = Math.sin(t * 0.18)
      const corner = Math.sin(t * 0.55)

      const speed = Math.max(
        70,
        262 + 90 * lap + noise(6),
      )
      const drs = lap > 0.6 && corner > -0.2
      const rpm = Math.max(
        6500,
        Math.min(15000, 9000 + 3800 * Math.abs(lap) + noise(250)),
      )
      const latG = Math.abs(corner) * 4.6 + noise(0.25)

      // Garde au sol live : suit le setup, écrasée en charge (vitesse/appui)
      const load = speed / 340
      const rhFront = Math.max(
        6,
        s.rhFront - load * 5 + Math.sin(t * 3.1) * 1.4 + noise(0.6),
      )
      const rhRear = Math.max(
        10,
        s.rhRear - load * 4 + Math.sin(t * 2.7 + 1) * 1.6 + noise(0.6),
      )

      const tireTemp = 88 + 22 * Math.abs(corner) + noise(2)
      const brakeTemp = 360 + 320 * Math.max(0, -lap) + noise(20)
      const downforce = aero.downforce * (0.5 + 0.5 * (speed / 340) ** 2)

      setTelemetry({
        speed,
        rpm,
        gear: gearFor(speed),
        latG: Math.max(0, latG),
        downforce,
        rhFront,
        rhRear,
        tireTemp,
        brakeTemp,
        drs,
      })
    }, 200)

    return () => clearInterval(id)
    // intervalle monté une seule fois ; le setup courant est lu via setupRef
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return telemetry
}
