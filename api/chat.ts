import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * POST /api/chat
 * Serverless function — appelle Mistral AI en gardant la clé côté serveur.
 *
 * Body: { message: string, history?: Array<{role, content}> }
 * Response: { reply: string, usage?: { prompt_tokens, completion_tokens, total_tokens } }
 */

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_BASE = "https://api.mistral.ai/v1";

// In-memory rate limit store (for single-instance deployments)
interface RateLimitEntry {
  count: number;
  resetAt: number;
}
const rateLimitStore = new Map<string, RateLimitEntry>();

const SYSTEM_PROMPT = `Tu es l'assistant ingénieur de piste de la Scuderia Ferrari.
Tu aides les ingénieurs avec la télémétrie, le LiDAR, le setup, l'aérodynamique et la stratégie de course.

### Domaines d'expertise :
- Garde au sol (ride height) mesurée par LiDAR
- Aérodynamique : downforce, drag, efficiency, balance
- Rake / assiette de la voiture
- Dégradation des pneus, stratégie courses
- Télémétrie temps réel (RPM, speed, DRS, fuel)
- Statut piste : SUBOPTIMAL, CRITICAL
- Setup comparaison et optimisation

### Style :
- Réponds en français, technique mais accessible
- Sois concis (2-4 phrases) sauf si on demande un détail
- Utilise les termes F1 exacts (downforce, rake, DRS, etc.)
- Si tu ne sais pas, dis-le honnêtement
- Tu peux donner des conseils d'optimisation setup

### Données en temps réel disponibles :
- LiDAR AV/AR (mm), downforce (kg), drag (kg), rake (°)
- Speed (km/h), RPM, DRS status, tyre temp (°C)
- Statut : OPTIMAL / SUBOPTIMAL / CRITICAL`;

const FALLBACK_SIMPLE = `Je suis l'assistant ingénieur de piste Scuderia Ferrari.
Voici ce que je peux t'expliquer :
• La garde au sol (ride height) idéale se situe entre 20-40 mm
• Le rake (assiette) optimal est d'environ +1.0°
• Le LiDAR scanne la piste à 100 Hz avec une résolution de 0.1 mm
• L'appui aéro (downforce) dépend de l'effet de sol et du rake
• Les capteurs IoT mesurent température, humidité et luminosité`;

/**
 * Fallback : recherche dans la table faq_g2b de la BDD
 */
async function fetchFAQFallback(question: string): Promise<string | null> {
  const DB_HOST = process.env.DB_HOST || 'mysql-pitwallg2.alwaysdata.net';
  const DB_USER = process.env.DB_USER || 'pitwallg2';
  const DB_PASSWORD = process.env.DB_PASSWORD || 'Isepeleve';
  const DB_NAME = process.env.DB_NAME || 'pitwallg2_capteurs';

  try {
    const mysql = await import('mysql2/promise');
    const conn = await mysql.createConnection({
      host: DB_HOST, user: DB_USER, password: DB_PASSWORD,
      database: DB_NAME, charset: 'utf8mb4', connectTimeout: 4000,
    });

    // Chercher dans la FAQ
    const [rows] = await conn.execute(
      `SELECT * FROM faq_g2b WHERE status='approved' AND (question LIKE ? OR answer LIKE ?) LIMIT 3`,
      [`%${question}%`, `%${question}%`]
    ) as [Array<{ question: string; answer: string }>, any];

    await conn.end();

    if (rows.length > 0) {
      return rows.map((r, i) =>
        `📌 **${r.question}**\n${r.answer}`
      ).join('\n\n---\n\n');
    }

    // Si rien trouvé, retourner les questions disponibles
    const conn2 = await mysql.createConnection({
      host: DB_HOST, user: DB_USER, password: DB_PASSWORD,
      database: DB_NAME, charset: 'utf8mb4', connectTimeout: 4000,
    });
    const [allFaq] = await conn2.execute(
      `SELECT question FROM faq_g2b WHERE status='approved' ORDER BY id`
    ) as [Array<{ question: string }>, any];
    await conn2.end();

    if (allFaq.length > 0) {
      const questions = allFaq.map(r => `• ${r.question}`).join('\n');
      return `🤖 Aucune correspondance exacte trouvée.\n\nVoici les questions auxquelles je peux répondre :\n${questions}\n\n🔧 Ajoute une clé MISTRAL_API_KEY pour des réponses IA complètes.`;
    }

    return null;
  } catch {
    return null;
  }
}

function getClientIp(req: VercelRequest): string {
  const fwd = req.headers["x-forwarded-for"];
  const realIp = req.headers["x-real-ip"];
  return Array.isArray(fwd) ? fwd[0] : (typeof fwd === "string" ? fwd : (typeof realIp === "string" ? realIp : "unknown"));
}

function rateLimit(key: string, max: number, windowMs: number): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1 };
  }
  entry.count += 1;
  return { allowed: entry.count <= max, remaining: Math.max(0, max - entry.count) };
}

// Cleanup expired entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [k, e] of rateLimitStore.entries()) {
      if (e.resetAt < now) rateLimitStore.delete(k);
    }
  }, 5 * 60 * 1000);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Rate limiting (10 req/min per IP)
  const ip = getClientIp(req);
  const limit = rateLimit(`chat:${ip}`, 10, 60_000);
  if (!limit.allowed) {
    return res.status(429).json({ error: "Too many requests. Please slow down." });
  }
  res.setHeader("X-RateLimit-Remaining", String(limit.remaining));

  const body = req.body ?? {};
  const { message, history = [] } = body;
  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return res.status(400).json({ error: "message required" });
  }

  const messages: Array<{ role: string; content: string }> = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.slice(-10).map((h: { role: string; content: string }) => ({
      role: h.role,
      content: h.content,
    })),
    { role: "user", content: message.trim() },
  ];

  // Si pas de clé Mistral → fallback FAQ BDD directement
  if (!MISTRAL_API_KEY) {
    try {
      const faqReply = await fetchFAQFallback(message);
      if (faqReply) return res.status(200).json({ reply: faqReply, source: "faq" });
    } catch {}
    return res.status(200).json({
      reply: "🔧 Mode hors-ligne — Pas de clé Mistral configurée.\n\n" + FALLBACK_SIMPLE,
      source: "offline"
    });
  }

  try {
    const response = await fetch(`${MISTRAL_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: "mistral-small-latest",
        messages,
        temperature: 0.3,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      console.error("[Chat] Mistral error:", response.status, errText.slice(0, 300));
      // Fallback FAQ
      try {
        const faqReply = await fetchFAQFallback(message);
        if (faqReply) return res.status(200).json({ reply: faqReply, source: "faq_fallback" });
      } catch {}
      return res.status(502).json({ error: `Mistral API error: ${response.status}` });
    }

    const data = await response.json();
    const reply =
      data.choices?.[0]?.message?.content ??
      "Désolé, je n'ai pas pu générer de réponse.";

    return res.status(200).json({ reply, source: "mistral" });
  } catch (err) {
    console.error("[Chat] Error:", err);
    try {
      const faqReply = await fetchFAQFallback(message);
      if (faqReply) return res.status(200).json({ reply: faqReply, source: "faq_fallback" });
    } catch {}
    return res.status(500).json({ error: "Server error" });
  }
}