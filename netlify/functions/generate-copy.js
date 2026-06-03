"use strict";

// ─── Brand prompt templates ────────────────────────────────────────────────────

const BRAND_CONTEXT = {
  ngajigaes: {
    name: "Ngajigaes.id",
    niche: "platform ngaji online untuk orang sibuk",
    audience: "profesional muda, karyawan, ibu rumah tangga yang ingin belajar Al-Quran tapi punya waktu terbatas",
    tone: "inspiratif, empatik, relatable, ada unsur urgensi ringan",
    kpi: "ROAS — iklan mendorong langsung ke landing page untuk purchase/daftar",
    hooks: ["kesibukan vs keinginan ngaji", "malu belum bisa baca Al-Quran", "belajar kapan saja", "mudah dan fleksibel"],
    cta_examples: ["Mulai Belajar Sekarang", "Coba Gratis 7 Hari", "Daftar Sekarang"],
    avoid: ["janji yang terlalu besar", "bahasa terlalu formal", "kalimat > 20 kata"],
  },
  labbaika: {
    name: "Labbaika",
    niche: "jasa travel umroh terpercaya",
    audience: "calon jamaah umroh, usia 30-60 tahun, mencari paket umroh yang amanah dan terjangkau",
    tone: "hangat, amanah, menyentuh sisi spiritual, tidak hard-sell",
    kpi: "CPL — iklan mengumpulkan lead (WA/form) untuk follow-up tim sales",
    hooks: ["rindu Baitullah", "umroh impian jadi nyata", "perjalanan ibadah yang direncanakan", "kepercayaan ribuan jamaah"],
    cta_examples: ["Konsultasi Gratis", "Hubungi Kami", "Dapatkan Penawaran"],
    avoid: ["harga spesifik tanpa konteks", "klaim nomor 1 tanpa bukti", "bahasa inggris berlebihan"],
  },
  alaika: {
    name: "Alaika Habibi",
    niche: "jasa travel umroh dengan pendekatan personal dan komunitas",
    audience: "keluarga, pasangan muda, komunitas masjid yang ingin umroh bersama dengan nuansa kekeluargaan",
    tone: "personal, hangat, kekeluargaan, ada storytelling",
    kpi: "CPL — iklan mengumpulkan lead untuk konsultasi paket umroh keluarga/komunitas",
    hooks: ["umroh bersama keluarga", "pengalaman spiritual bersama orang tercinta", "komunitas yang pergi bersama", "kenangan tak terlupakan"],
    cta_examples: ["Rencanakan Umroh Keluarga", "Chat dengan Kami", "Konsultasi Sekarang"],
    avoid: ["terlalu promosi / salesy", "tidak ada elemen emosional", "bahasa kaku formal"],
  },
};

// ─── Build system prompt ──────────────────────────────────────────────────────

function buildSystemPrompt(brand) {
  const ctx = BRAND_CONTEXT[brand];
  if (!ctx) throw new Error(`Brand tidak dikenal: ${brand}`);

  return `Kamu adalah copywriter iklan Meta Ads (Facebook/Instagram) spesialis niche ${ctx.niche}.

BRAND: ${ctx.name}
TARGET AUDIENCE: ${ctx.audience}
TONE: ${ctx.tone}
TUJUAN IKLAN: ${ctx.kpi}
HOOK YANG BEKERJA: ${ctx.hooks.join(", ")}
HINDARI: ${ctx.avoid.join(", ")}

ATURAN OUTPUT:
- Setiap variasi berisi: primary_text, headline, cta
- primary_text: 1-3 kalimat pendek, maksimal 150 karakter total, conversational
- headline: maksimal 40 karakter, punchy, spesifik
- cta: pilih dari ${ctx.cta_examples.join(" / ")} atau variasi relevan
- Gunakan bahasa Indonesia yang natural, bukan terjemahan
- Jangan gunakan emoji berlebihan (max 1-2 per variasi)
- Format output: JSON array saja, tidak ada teks lain`;
}

// ─── Build user prompt ─────────────────────────────────────────────────────────

function buildUserPrompt(topAds, nVariations) {
  const referenceSection = topAds && topAds.length > 0
    ? `\nINSPIRASI DARI TOP PERFORMING ADS (pelajari pola, jangan copy):\n${
        topAds.map((a, i) =>
          `${i + 1}. Copy: "${a.copy || a.ad_copy || ''}" | CTA: "${a.cta || a.cta_button || ''}" | Score: ${a.score ?? 'N/A'}`
        ).join('\n')
      }\n`
    : '';

  return `${referenceSection}
Buat ${nVariations} variasi copy iklan Meta Ads yang berbeda satu sama lain.
Setiap variasi harus punya angle/hook yang berbeda agar bisa di-A/B test.

Kembalikan HANYA JSON array seperti ini (tidak ada teks lain):
[
  {
    "primary_text": "...",
    "headline": "...",
    "cta": "...",
    "angle": "satu kata yang describe hook/angle variasi ini"
  }
]`;
}

// ─── Call Anthropic API ───────────────────────────────────────────────────────

async function callClaude(systemPrompt, userPrompt, apiKey) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text ?? "";
}

// ─── Parse Claude output ──────────────────────────────────────────────────────

function parseVariations(rawText) {
  // Extract JSON array from Claude response
  const match = rawText.match(/\[[\s\S]*\]/);
  if (!match) throw new Error("Claude tidak mengembalikan JSON array yang valid");
  return JSON.parse(match[0]);
}

// ─── Netlify handler ──────────────────────────────────────────────────────────

exports.handler = async function handler(event) {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: cors, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: cors, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: "ANTHROPIC_API_KEY tidak di-set di env" }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ error: "Body bukan JSON valid" }) };
  }

  const { brand, top_ads = [], n_variations = 3 } = body;

  if (!brand || !BRAND_CONTEXT[brand]) {
    return {
      statusCode: 400, headers: cors,
      body: JSON.stringify({ error: `brand harus salah satu dari: ${Object.keys(BRAND_CONTEXT).join(", ")}` }),
    };
  }

  const nVar = Math.min(Math.max(Number(n_variations) || 3, 1), 5);

  try {
    const systemPrompt = buildSystemPrompt(brand);
    const userPrompt   = buildUserPrompt(top_ads, nVar);
    const rawText      = await callClaude(systemPrompt, userPrompt, apiKey);
    const variations   = parseVariations(rawText);

    return {
      statusCode: 200,
      headers: cors,
      body: JSON.stringify({
        brand,
        generated_at: new Date().toISOString(),
        n_variations: variations.length,
        variations,
      }),
    };
  } catch (err) {
    console.error("[generate-copy]", err);
    return {
      statusCode: 500, headers: cors,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
