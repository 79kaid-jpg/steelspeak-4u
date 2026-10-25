// Supabase Edge Function: gọi Google Gemini (free tier) để tạo bài học / hội thoại.
// Secrets: xem PROVIDERS bên dưới (Groq/Gemini/OpenRouter/Cerebras free, Anthropic trả phí); DAILY_LIMIT tuỳ chọn
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...cors, "Content-Type": "application/json" } });

const AUDIENCE =
  "Vietnamese Technical Product Leads, QA and QC engineers at a coated steel manufacturer (metallic coated and pre-painted steel: GI, GL/zinc-aluminium, primer, top coat, MTC, NSPE, colour matching).";

// ===== Nhiều nhà cung cấp AI (admin chọn trong app; tự chuyển sang nhà khác nếu lỗi) =====
// Secrets (đặt cái nào dùng cái đó): GROQ_API_KEY (free), GEMINI_API_KEY (free), OPENROUTER_API_KEY (free models),
// CEREBRAS_API_KEY (free), ANTHROPIC_API_KEY (trả phí). Tuỳ chọn: <TÊN>_MODEL để đổi model.
const PROVIDERS: Record<string, { key: string; model: string }> = {
  groq: { key: "GROQ_API_KEY", model: "llama-3.3-70b-versatile" },
  gemini: { key: "GEMINI_API_KEY", model: "gemini-2.5-flash" },
  openrouter: { key: "OPENROUTER_API_KEY", model: "meta-llama/llama-3.3-70b-instruct:free" },
  cerebras: { key: "CEREBRAS_API_KEY", model: "llama-3.3-70b" },
  anthropic: { key: "ANTHROPIC_API_KEY", model: "claude-haiku-5-5" },
};
const OAI_URL: Record<string, string> = {
  groq: "https://api.groq.com/openai/v1/chat/completions",
  openrouter: "https://openrouter.ai/api/v1/chat/completions",
  cerebras: "https://api.cerebras.ai/v1/chat/completions",
};
const env = (k: string) => Deno.env.get(k) ?? "";
const modelOf = (p: string) => env(p.toUpperCase() + "_MODEL") || PROVIDERS[p].model;
function parseJSON(out: string) { const a = out.indexOf("{"), b = out.lastIndexOf("}"); return JSON.parse(a >= 0 && b > a ? out.slice(a, b + 1) : out); }

// Tự tìm model còn hoạt động nếu model mặc định bị gỡ
const MODEL_CACHE: Record<string, string> = {};
async function autoModel(p: string, kind: "chat" | "stt" = "chat"): Promise<string> {
  const ck = p + kind; if (MODEL_CACHE[ck]) return MODEL_CACHE[ck];
  const k = env(PROVIDERS[p].key); let ids: string[] = [];
  if (p === "gemini") {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${k}&pageSize=200`);
    const g = await r.json();
    ids = (g.models ?? []).filter((m: any) => (m.supportedGenerationMethods ?? []).includes("generateContent")).map((m: any) => String(m.name).replace("models/", ""))
      .filter((n: string) => /flash/.test(n) && !/image|tts|live|thinking|exp|preview/.test(n)).sort().reverse();
  } else if (p === "anthropic") {
    const r = await fetch("https://api.anthropic.com/v1/models", { headers: { "x-api-key": k, "anthropic-version": "2023-06-01" } });
    ids = ((await r.json()).data ?? []).map((m: any) => m.id).filter((n: string) => /haiku/.test(n));
  } else {
    const base = OAI_URL[p].replace("/chat/completions", "/models");
    const r = await fetch(base, { headers: { Authorization: "Bearer " + k } });
    const all: string[] = ((await r.json()).data ?? []).map((m: any) => String(m.id));
    if (kind === "stt") ids = all.filter((n) => /whisper/.test(n)).sort((a, b) => (/turbo/.test(b) ? 1 : 0) - (/turbo/.test(a) ? 1 : 0));
    else { const pref = [/llama-3\.3-70b/, /gpt-oss-120b/, /llama-4/, /qwen/, /llama/, /gpt-oss/];
      const ok = all.filter((n) => !/whisper|tts|guard|embed|vision|orpheus|playai/.test(n) && (p !== "openrouter" || /:free$/.test(n)));
      for (const re of pref) { const f = ok.find((n) => re.test(n)); if (f) { ids = [f]; break; } } if (!ids.length) ids = ok; }
  }
  if (!ids.length) throw new Error(p + ": không tìm được model");
  return (MODEL_CACHE[ck] = ids[0]);
}
async function preferredOrder(admin: any): Promise<string[]> {
  let pref = "";
  try { const { data } = await admin.from("app_settings").select("value").eq("key", "ai_provider").maybeSingle(); pref = String(data?.value ?? ""); } catch (_) { /* bảng chưa có */ }
  const all = Object.keys(PROVIDERS).filter((p) => env(PROVIDERS[p].key));
  return pref && all.includes(pref) ? [pref, ...all.filter((p) => p !== pref)] : all;
}
async function callOne(p: string, prompt: string, temperature: number): Promise<string> {
  try { return await callOneM(p, prompt, temperature, MODEL_CACHE[p + "chat"] ?? modelOf(p)); }
  catch (e) { if (!/ 40[04]/.test(String(e))) throw e; return await callOneM(p, prompt, temperature, await autoModel(p)); }
}
async function callOneM(p: string, prompt: string, temperature: number, model: string): Promise<string> {
  const k = env(PROVIDERS[p].key);
  const sys = "Respond with one valid JSON object only. No prose, no code fences.";
  let r: Response;
  if (p === "gemini") {
    r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${k}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", temperature } }) });
    if (!r.ok) throw new Error(`${p} ${r.status}: ${(await r.text()).slice(0, 160)}`);
    const g = await r.json(); return g.candidates?.[0]?.content?.parts?.map((x: any) => x.text ?? "").join("") ?? "";
  }
  if (p === "anthropic") {
    r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST", headers: { "x-api-key": k, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model, max_tokens: 4000, temperature, system: sys, messages: [{ role: "user", content: prompt }] }) });
    if (!r.ok) throw new Error(`${p} ${r.status}: ${(await r.text()).slice(0, 160)}`);
    const g = await r.json(); return (g.content ?? []).map((c: any) => c.text ?? "").join("");
  }
  r = await fetch(OAI_URL[p], {
    method: "POST", headers: { Authorization: "Bearer " + k, "Content-Type": "application/json" },
    body: JSON.stringify({ model, temperature, messages: [{ role: "system", content: sys }, { role: "user", content: prompt }],
      ...(p === "openrouter" ? {} : { response_format: { type: "json_object" } }) }) });
  if (!r.ok) throw new Error(`${p} ${r.status}: ${(await r.text()).slice(0, 160)}`);
  const g = await r.json(); return g.choices?.[0]?.message?.content ?? "";
}
async function llmJSON(admin: any, prompt: string, temperature = 0.3): Promise<any> {
  const order = await preferredOrder(admin);
  if (!order.length) throw new Error("Chưa cấu hình khóa AI nào (GROQ_API_KEY, GEMINI_API_KEY, ...)");
  const errs: string[] = [];
  for (const p of order) { try { const o = parseJSON(await callOne(p, prompt, temperature)); o._provider = p; return o; } catch (e) { errs.push(String((e as Error).message ?? e)); } }
  throw new Error("AI lỗi: " + errs.join(" | ").slice(0, 300));
}
// Nghe ghi âm -> văn bản: Groq Whisper (free) hoặc Gemini
async function transcribe(admin: any, b64: string, mime: string, target: string): Promise<{ heard: string; tip?: string; _provider: string }> {
  const order = (await preferredOrder(admin)).filter((p) => p === "groq" || p === "gemini");
  if (!order.length) throw new Error("Chấm qua ghi âm cần GROQ_API_KEY hoặc GEMINI_API_KEY");
  const errs: string[] = [];
  for (const p of order) {
    try {
      if (p === "groq") {
        const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
        const ext = mime.includes("webm") ? "webm" : mime.includes("ogg") ? "ogg" : mime.includes("wav") ? "wav" : "m4a";
        const fd = new FormData();
        fd.append("file", new Blob([bin], { type: mime }), "speech." + ext);
        fd.append("model", env("GROQ_STT_MODEL") || await autoModel("groq", "stt"));
        fd.append("language", "en"); fd.append("response_format", "json"); fd.append("temperature", "0");
        const r = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", { method: "POST", headers: { Authorization: "Bearer " + env("GROQ_API_KEY") }, body: fd });
        if (!r.ok) throw new Error(`groq ${r.status}: ${(await r.text()).slice(0, 160)}`);
        const heard = String((await r.json()).text ?? "").trim();
        let tip = "";
        try { tip = String((await llmJSON(admin, `A Vietnamese learner tried to say "${target}" and a speech recognizer heard "${heard}". Give one short pronunciation tip in Vietnamese about the biggest difference, or empty string if they match. JSON: {"tip":""}`, 0.2)).tip ?? ""); } catch (_) { /* bỏ qua */ }
        return { heard, tip, _provider: "groq" };
      }
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${env("GEMINI_MODEL") || await autoModel("gemini")}:generateContent?key=${env("GEMINI_API_KEY")}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ role: "user", parts: [{ inlineData: { mimeType: mime, data: b64 } }, { text: `A Vietnamese learner tried to say this English text: "${target}". Transcribe EXACTLY what they actually said in English (do not correct it toward the target). Return JSON only: {"heard":"transcript","tip":"one short pronunciation tip in Vietnamese about their biggest error, or empty"}` }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.2 } }) });
      if (!r.ok) throw new Error(`gemini ${r.status}: ${(await r.text()).slice(0, 160)}`);
      const g = await r.json(); const o = parseJSON(g.candidates?.[0]?.content?.parts?.map((x: any) => x.text ?? "").join("") ?? "{}");
      return { heard: String(o.heard ?? ""), tip: o.tip, _provider: "gemini" };
    } catch (e) { errs.push(String((e as Error).message ?? e)); }
  }
  throw new Error("Chấm phát âm lỗi: " + errs.join(" | ").slice(0, 300));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const auth = req.headers.get("Authorization") ?? "";
    const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: "Chưa đăng nhập" }, 401);

    // Giới hạn lượt/ngày
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const limit = Number(Deno.env.get("DAILY_LIMIT") ?? "30");
    const today = new Date().toISOString().slice(0, 10);
    const { data: u } = await admin.from("ai_usage").select("n").eq("user_id", user.id).eq("day", today).maybeSingle();
    if ((u?.n ?? 0) >= limit) return json({ error: "Hết lượt AI hôm nay" }, 429);
    await admin.from("ai_usage").upsert({ user_id: user.id, day: today, n: (u?.n ?? 0) + 1 });

    const body = await req.json();
    let prompt = "";
    if (body.task === "providers") {
      return json({ available: Object.keys(PROVIDERS).filter((p) => env(PROVIDERS[p].key)), order: await preferredOrder(admin) });
    }
    if (body.task === "lesson") {
      const n = Math.min(Math.max(Number(body.n) || 12, 4), 20);
      const text = String(body.text ?? "").slice(0, 14000);
      if (text.length < 80) return json({ error: "Văn bản quá ngắn" }, 400);
      prompt = `You build vocabulary lessons for ${AUDIENCE}
From the DOCUMENT below, pick the ${n} most useful technical or professional English terms/phrases for this audience (prefer product, quality, testing, material, process terms; skip trivial words). For each give: "en" (term as in document), "vi" (accurate Vietnamese technical translation), "ex" (a short sentence from or closely based on the document using the term), "exvi" (Vietnamese translation of ex). Also give "title": a short Vietnamese lesson title.
Return JSON only: {"title":"...","terms":[{"en":"","vi":"","ex":"","exvi":""}]}
DOCUMENT:
"""${text}"""`;
    } else if (body.task === "scene") {
      const words = (body.words ?? []).slice(0, 8).map(String).join(", ");
      const ctx = String(body.context ?? "").slice(0, 500);
      prompt = `You write short workplace English role-play dialogues for ${AUDIENCE} Context (Vietnamese): "${ctx}". Use these terms naturally: ${words}. Return JSON only: {"lines":[{"who":"Customer" or "TPL","en":"...","vi":"Vietnamese translation"}]} with 6 lines, B1-B2 level, American English.`;
    } else if (body.task === "pron") {
      const audio = String(body.audio ?? "");
      if (audio.length < 1000 || audio.length > 4_000_000) return json({ error: "Bản ghi không hợp lệ" }, 400);
      const target = String(body.target ?? "").slice(0, 300);
      const mime = /^audio\/[a-z0-9.+-]+$/.test(String(body.mime)) ? String(body.mime) : "audio/mp4";
      try { return json(await transcribe(admin, audio, mime, target)); } catch (e) { return json({ error: String((e as Error).message ?? e) }, 502); }
    } else return json({ error: "task không hợp lệ" }, 400);

    try { return json(await llmJSON(admin, prompt, 0.4)); } catch (e) { return json({ error: String((e as Error).message ?? e) }, 502); }
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
