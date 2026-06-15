import { useRef, useState } from 'react'
import { FerrariShield } from './FerrariShield'

/* ============================================================
   Chatbot.tsx — assistant ingénieur (réponses locales scriptées).
   ============================================================ */

interface Msg {
  from: 'eng' | 'user'
  text: string
}

const KNOWLEDGE: { match: RegExp; answer: string }[] = [
  {
    match: /garde au sol|ride height|hauteur/i,
    answer:
      "La garde au sol est mesurée au LiDAR à 100 Hz à l'avant et à l'arrière. On vise ~22 mm AV / ~38 mm AR pour maximiser l'effet de sol sans toucher la planche.",
  },
  {
    match: /downforce|appui|aero|aéro/i,
    answer:
      "L'appui dépend surtout de la garde au sol et du rake. Plus on plaque la voiture, plus l'effet de sol génère de downforce — jusqu'au décrochage si c'est trop bas.",
  },
  {
    match: /rake|assiette|pitch/i,
    answer:
      "Le rake (assiette) idéal est autour de +1°. Trop de rake augmente la traînée, trop peu réduit l'appui de plancher. Le statut passe SUBOPTIMAL au-delà de 2.6°.",
  },
  {
    match: /lidar|capteur|sensor/i,
    answer:
      "Deux LiDAR pointent le sol : un sous le nez, un sous le plancher arrière. Ils renvoient un nuage de points à 100 Hz pour reconstruire la hauteur réelle de la planche.",
  },
  {
    match: /critique|critical|danger/i,
    answer:
      "Statut CRITICAL = garde au sol trop faible (AV < 12 mm ou AR < 18 mm). Risque d'usure de planche et de marsouinage. Remonter immédiatement le setup.",
  },
  {
    match: /login|connexion|mot de passe|identifiant/i,
    answer:
      "Le cockpit ingénieur se déverrouille avec l'écurie FERRARI et le numéro 16. Les identifiants sont stockés en local (localStorage).",
  },
]

const FALLBACK =
  "Je suis l'assistant ingénieur de piste. Demande-moi la garde au sol, l'appui aéro, le rake ou le fonctionnement des LiDAR.";

export function Chatbot() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Msg[]>([
    {
      from: 'eng',
      text: 'Box, box. Ici le mur des stands — pose ta question sur le setup ou les LiDAR.',
    },
  ])
  const scrollRef = useRef<HTMLDivElement>(null)

  const send = () => {
    const q = input.trim()
    if (!q) return
    const hit = KNOWLEDGE.find((k) => k.match.test(q))
    setMessages((m) => [
      ...m,
      { from: 'user', text: q },
      { from: 'eng', text: hit ? hit.answer : FALLBACK },
    ])
    setInput('')
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: 99999, behavior: 'smooth' })
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#dc0000] shadow-[0_0_24px_-4px_rgba(220,0,0,0.7)] transition hover:scale-105"
        aria-label="Assistant ingénieur"
      >
        <FerrariShield size={26} />
      </button>

      {open && (
        <div className="panel fixed bottom-24 right-6 z-50 flex h-[26rem] w-[22rem] flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#1f1f1f] bg-[#0d0d0d] px-4 py-3">
            <span className="badge-live text-[#dc0000]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#dc0000] animate-pulse-dot" />
              Ingénieur de course
            </span>
            <button
              onClick={() => setOpen(false)}
              className="label-mono hover:text-white"
            >
              Fermer
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 text-[13px] leading-relaxed ${
                    m.from === 'user'
                      ? 'bg-[#dc0000] text-white'
                      : 'border border-[#1f1f1f] bg-[#0d0d0d] text-[#cfcfcf]'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 border-t border-[#1f1f1f] p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Pose ta question setup…"
              className="flex-1 bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none placeholder:text-[#555] focus:ring-1 focus:ring-[#dc0000]"
            />
            <button
              onClick={send}
              className="bg-[#dc0000] px-3 py-2 label-mono text-white hover:bg-[#ff1e00]"
            >
              Envoyer
            </button>
          </div>
        </div>
      )}
    </>
  )
}
