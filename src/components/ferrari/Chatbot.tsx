import { useRef, useState } from 'react'
import { FerrariShield } from './FerrariShield'

/* ============================================================
   Chatbot.tsx — Mistral AI-powered assistant ingénieur.
   ============================================================ */

interface Msg {
  from: 'eng' | 'user'
  text: string
}

interface ChatApiError {
  error: string
}

interface ChatApiSuccess {
  reply: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

const FALLBACK = "Je suis l'assistant ingénieur de piste. Demande-moi la garde au sol, l'appui aéro, le rake ou le fonctionnement des LiDAR."

export function Chatbot() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Msg[]>([
    {
      from: 'eng',
      text: 'Box, box. Ici le mur des stands — pose ta question sur le setup ou les LiDAR.',
    },
  ])
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const send = async () => {
    const q = input.trim()
    if (!q) return

    setMessages((m) => [...m, { from: 'user', text: q }])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: q,
          history: messages.slice(-6).map((m) => ({
            role: m.from === 'user' ? 'user' : 'assistant',
            content: m.text,
          })),
        }),
      })

      if (!response.ok) {
        const err = (await response.json()) as ChatApiError
        throw new Error(err.error || 'API error')
      }

      const data = (await response.json()) as ChatApiSuccess
      const answer = data.reply || FALLBACK

      setMessages((m) => [...m, { from: 'eng', text: answer }])
    } catch (error) {
      console.error('Chat API error:', error)
      setMessages((m) => [...m, { from: 'eng', text: FALLBACK }])
    } finally {
      setLoading(false)
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ top: 99999, behavior: 'smooth' })
      })
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#dc0000] shadow-[0_0_24px_-4px_rgba(220,0,0,0.7)] transition hover:scale-105"
        aria-label="Assistant ingénieur Mistral AI"
      >
        <FerrariShield size={26} />
      </button>

      {open && (
        <div className="panel fixed bottom-24 right-6 z-50 flex h-[26rem] w-[22rem] flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#1f1f1f] bg-[#0d0d0d] px-4 py-3">
            <span className="badge-live text-[#dc0000]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#dc0000] animate-pulse-dot" />
              Mistral AI Assistant
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
            {loading && (
              <div className="flex justify-start">
                <div className="border border-[#1f1f1f] bg-[#0d0d0d] px-3 py-2 text-[13px]">
                  <span className="animate-pulse">L&apos;assistant réfléchit…</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 border-t border-[#1f1f1f] p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && send()}
              placeholder="Pose ta question setup…"
              disabled={loading}
              className="flex-1 bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none placeholder:text-[#555] focus:ring-1 focus:ring-[#dc0000] disabled:opacity-50"
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="bg-[#dc0000] px-3 py-2 label-mono text-white hover:bg-[#ff1e00] disabled:opacity-50"
            >
              {loading ? '...' : 'Envoyer'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
