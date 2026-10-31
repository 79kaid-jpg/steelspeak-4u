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
const PAID = ["anthropic"];
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
let GEM_ALL: string[] = [];
// Gemini: thử lần lượt các model flash khi model đang dùng hết hạn mức (429) hoặc bị gỡ (404)
async function geminiTry<T>(fn: (model: string) => Promise<T>): Promise<T> {
  const first = env("GEMINI_MODEL") || MODEL_CACHE["geminichat"] || PROVIDERS.gemini.model;
  try { return await fn(first); } catch (e) { if (!/ (429|404|400)/.test(String(e))) throw e;
    if (!GEM_ALL.length) { try { await autoModel("gemini"); } catch (_) { /* */ } }
    let last: unknown = e;
    for (const m of GEM_ALL.filter((x) => x !== first).sort((a, b) => (/lite/.test(b) ? 1 : 0) - (/lite/.test(a) ? 1 : 0)).slice(0, 5)) {
      try { const r = await fn(m); MODEL_CACHE["geminichat"] = m; return r; } catch (e2) { last = e2; }
    }
    throw last; }
}
async function autoModel(p: string, kind: "chat" | "stt" = "chat"): Promise<string> {
  const ck = p + kind; if (MODEL_CACHE[ck]) return MODEL_CACHE[ck];
  const k = env(PROVIDERS[p].key); let ids: string[] = [];
  if (p === "gemini") {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${k}&pageSize=200`);
    const g = await r.json();
    ids = (g.models ?? []).filter((m: any) => (m.supportedGenerationMethods ?? []).includes("generateContent")).map((m: any) => String(m.name).replace("models/", ""))
      .filter((n: string) => /flash/.test(n) && !/image|tts|live|thinking|exp|preview/.test(n)).sort().reverse();
    GEM_ALL = ids.slice();
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
  // AI trả phí (Anthropic) chỉ dùng khi admin chủ động chọn, không tự chuyển sang
  const free = all.filter((p) => !PAID.includes(p));
  return pref && all.includes(pref) ? [pref, ...free.filter((p) => p !== pref)] : free;
}
async function callOne(p: string, prompt: string, temperature: number): Promise<string> {
  if (p === "gemini") return await geminiTry((m) => callOneM(p, prompt, temperature, m));
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
  if (r.status === 400 && p !== "openrouter") {
    const t = await r.text();
    if (/json/i.test(t)) { // model không xuất được JSON mode: thử lại không ép JSON, tự tách JSON
      r = await fetch(OAI_URL[p], { method: "POST", headers: { Authorization: "Bearer " + k, "Content-Type": "application/json" },
        body: JSON.stringify({ model, temperature, max_tokens: 6000, messages: [{ role: "system", content: sys }, { role: "user", content: prompt }] }) });
    } else throw new Error(`${p} 400: ${t.slice(0, 160)}`);
  }
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

// Đọc chữ trong ảnh (OCR) bằng AI có thị giác: Groq (Llama 4) hoặc Gemini
async function ocrImages(admin: any, imgs: { data: string; mime: string }[]): Promise<{ text: string; _provider: string }> {
  const order = (await preferredOrder(admin)).filter((p) => p === "groq" || p === "gemini");
  if (!order.length) throw new Error("Đọc ảnh cần GROQ_API_KEY hoặc GEMINI_API_KEY");
  const ask = "Transcribe ALL readable text in these images exactly, in reading order. Keep English as-is. Output plain text only, no commentary.";
  const errs: string[] = [];
  for (const p of order) {
    try {
      if (p === "groq") {
        const k = env("GROQ_API_KEY");
        let model = env("GROQ_VISION_MODEL") || MODEL_CACHE["groqvision"];
        if (!model) {
          const all: string[] = ((await (await fetch("https://api.groq.com/openai/v1/models", { headers: { Authorization: "Bearer " + k } })).json()).data ?? []).map((m: any) => String(m.id));
          model = all.find((n) => /llama-4-scout/.test(n)) || all.find((n) => /llama-4|maverick|vision|-vl|vl-|pixtral|gemma-3|scout/i.test(n)) || "";
          if (!model) throw new Error("groq: không có model đọc ảnh (" + all.slice(0, 40).join(",") + ")");
          MODEL_CACHE["groqvision"] = model;
        }
        const r = await fetch(OAI_URL.groq, { method: "POST", headers: { Authorization: "Bearer " + k, "Content-Type": "application/json" },
          body: JSON.stringify({ model, temperature: 0, max_tokens: 4000, messages: [{ role: "user", content: [{ type: "text", text: ask }, ...imgs.slice(0, 5).map((i) => ({ type: "image_url", image_url: { url: `data:${i.mime};base64,${i.data}` } }))] }] }) });
        if (!r.ok) throw new Error(`groq ${r.status}: ${(await r.text()).slice(0, 160)}`);
        const text = String((await r.json()).choices?.[0]?.message?.content ?? "").trim();
        if (text) return { text, _provider: "groq" };
        throw new Error("groq: rỗng");
      }
      const g = await geminiTry(async (model) => { const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env("GEMINI_API_KEY")}`, { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ role: "user", parts: [...imgs.map((i) => ({ inlineData: { mimeType: i.mime, data: i.data } })), { text: ask }] }], generationConfig: { temperature: 0 } }) });
        if (!r.ok) throw new Error(`gemini ${r.status}: ${(await r.text()).slice(0, 160)}`); return await r.json(); }); const text = (g.candidates?.[0]?.content?.parts ?? []).map((x: any) => x.text ?? "").join("").trim();
      if (text) return { text, _provider: "gemini" };
      throw new Error("gemini: rỗng");
    } catch (e) { errs.push(String((e as Error).message ?? e)); }
  }
  throw new Error("Đọc ảnh lỗi: " + errs.join(" | ").slice(0, 300));
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
      let groq: string[] = [];
      if (env("GROQ_API_KEY")) { try { groq = ((await (await fetch("https://api.groq.com/openai/v1/models", { headers: { Authorization: "Bearer " + env("GROQ_API_KEY") } })).json()).data ?? []).map((m: any) => String(m.id)); } catch (_) { /* bỏ qua */ } }
      return json({ available: Object.keys(PROVIDERS).filter((p) => env(PROVIDERS[p].key)), order: await preferredOrder(admin), groq });
    }
    if (body.task === "story") {
      const text = String(body.text ?? "").replace(/\s+/g, " ").trim().slice(0, 2500);
      if (text.split(" ").length < 40) return json({ error: "Truyện quá ngắn (cần ít nhất 40 từ)" }, 400);
      const p = `You are an experienced English teacher for Vietnamese adult learners. Build a full lesson from the SHORT STORY below.
Rules:
- "text": split the story into sentences exactly as written (do not change words); each item [english, natural Vietnamese translation]. Max 14 sentences; if longer, keep the first 14.
- "level": CEFR level of the story (A1,A2,B1,B2,C1), judged by vocabulary, grammar and figurative language.
- "title": short English title; "vi": short Vietnamese subtitle.
- "vocab": 8-12 most useful words/phrases from the story for that level: {en, ipa (British IPA with slashes), pos (n./v./adj./adv./phr. v.), vi, ex (new short example sentence), exvi}.
- "fill": 5 items [sentence with ___ , answer] using vocab words (answer must be exactly one of the vocab "en" values).
- "tf": 4 items [statement about the story, true|false]. Mix true and false.
- "mcq": 3 items [question, [3 options], index of correct option].
- "discuss": one speaking question about the learner's own life.
- "gaps": 6-7 items [sentence index, single word copied EXACTLY from that sentence] for listening gap-fill; choose content words.
- "gist": [question about the main idea, [3 options], correct index].
- "dictation": 2 sentence indexes (short sentences).
- "sounds": 4-5 key sounds Vietnamese learners struggle with in this story: {ipa, tip (Vietnamese), words:[3 words from the story]}.
- "linking": 3-4 [phrase from story, IPA with ‿ showing the link].
- "stress": 3 sentences from the story with stressed words in CAPITALS.
- "shadow": 4 sentence indexes good for shadowing.
Return JSON only with keys: title, vi, level, text, vocab, fill, tf, mcq, discuss, gaps, gist, dictation, sounds, linking, stress, shadow.
STORY:
"""${text}"""`;
      try { return json(await llmJSON(admin, p, 0.3)); } catch (e) { return json({ error: String((e as Error).message ?? e) }, 502); }
    }
    if (body.task === "lesson") {
      const n = Math.min(Math.max(Number(body.n) || 12, 4), 20);
      const text = String(body.text ?? "").slice(0, 14000);
      if (text.length < 80) return json({ error: "Văn bản quá ngắn" }, 400);
      const aud = body.course ? `Vietnamese learners in the English course "${String(body.course).slice(0, 120)}".` : AUDIENCE;
      prompt = `You build vocabulary lessons for ${aud}
From the DOCUMENT below, pick the ${n} most useful English terms/phrases for this audience (prefer domain-specific and academic vocabulary; skip trivial words). For each give: "en" (term as in document), "vi" (accurate Vietnamese technical translation), "ex" (a short sentence from or closely based on the document using the term), "exvi" (Vietnamese translation of ex). Also give "title": a short Vietnamese lesson title.
Return JSON only: {"title":"...","terms":[{"en":"","vi":"","ex":"","exvi":""}]}
DOCUMENT:
"""${text}"""`;
    } else if (body.task === "scene") {
      const words = (body.words ?? []).slice(0, 8).map(String).join(", ");
      const ctx = String(body.context ?? "").slice(0, 500);
      prompt = `You write short workplace English role-play dialogues for ${AUDIENCE} Context (Vietnamese): "${ctx}". Use these terms naturally: ${words}. Return JSON only: {"lines":[{"who":"Customer" or "TPL","en":"...","vi":"Vietnamese translation"}]} with 6 lines, B1-B2 level, American English.`;
    } else if (body.task === "qbank") {
      const n = Math.min(Math.max(Number(body.n) || 8, 3), 15);
      const text = String(body.text ?? "").slice(0, 14000);
      if (text.length < 80) return json({ error: "Văn bản quá ngắn" }, 400);
      prompt = `You write quiz questions for an English-learning course "${String(body.course ?? "").slice(0, 120)}" for Vietnamese learners (${AUDIENCE}).
From the DOCUMENT, write ${n} questions that test understanding of its key English terms, facts and processes. Mix types:
- "mcq": English question (or Vietnamese prompt asking for the English term) with exactly 4 options, one correct; "answer" = 0-based index of the correct option. Distractors must be plausible and from the same domain.
- "order": only when the document describes a clear sequence; "options" = 3-7 steps in the CORRECT order (short English phrases), no "answer".
Every fact must be supported by the document. Add "explanation": one short Vietnamese sentence why the answer is right.
Return JSON only: {"questions":[{"type":"mcq","prompt":"","options":["","","",""],"answer":0,"explanation":""}]}
DOCUMENT:
"""${text}"""`;
    } else if (body.task === "ocr") {
      const imgs = (Array.isArray(body.images) ? body.images : []).slice(0, 5).map((i: any) => ({ data: String(i.data ?? ""), mime: /^image\/(jpeg|png|webp)$/.test(String(i.mime)) ? String(i.mime) : "image/jpeg" })).filter((i: any) => i.data.length > 500 && i.data.length < 6_000_000);
      if (!imgs.length) return json({ error: "Không có ảnh hợp lệ" }, 400);
      try { return json(await ocrImages(admin, imgs)); } catch (e) { return json({ error: String((e as Error).message ?? e) }, 502); }
    } else if (body.task === "ielts") {
      const topic = String(body.topic ?? "").slice(0, 120) || "a common IELTS topic";
      const sk = String(body.skill ?? "");
      if (sk === "reading") {
        prompt = `Create an IELTS Academic Reading practice set (target band 6.5-7.0) on the topic "${topic}".
Write an original passage of 330-420 words with a title, academic style, 4-6 paragraphs labelled A, B, C...
Then 8 questions: 4 of type "tfng" (statement; answer one of "TRUE","FALSE","NOT GIVEN") and 4 of type "mcq" (question with 4 options; answer = 0-based index).
For each question add "explain": one short Vietnamese sentence citing the paragraph.
Also list 6 useful vocabulary items from the passage with Vietnamese meaning.
JSON: {"title":"","passage":"paragraphs separated by \\n\\n","questions":[{"type":"tfng","q":"","answer":"TRUE","explain":""},{"type":"mcq","q":"","options":["","","",""],"answer":0,"explain":""}],"vocab":[{"en":"","vi":""}]}`;
      } else if (sk === "listening") {
        prompt = `Create an IELTS Listening practice (Section 2 or 3 style, target band 6.5-7.0) on the topic "${topic}".
Write a natural script of 14-20 short turns between 2 speakers (or a monologue split into turns), about 300-380 words total, with specific details (names, numbers, dates, places) that questions can test.
Then 8 questions in script order: type "gap" (sentence with ____, answer = 1-3 words exactly as in the script) or "mcq" (4 options, answer = 0-based index). At least 4 gap questions.
Add "explain" in Vietnamese for each. JSON: {"title":"","speakers":["",""],"script":[{"who":"","text":""}],"questions":[{"type":"gap","q":"","answer":"","explain":""},{"type":"mcq","q":"","options":["","","",""],"answer":0,"explain":""}]}`;
      } else if (sk === "wprompt") {
        const task = body.wtask === 1 ? "Task 1 (Academic: describe a chart/table/process given as a clear text description of the data, 150 words)" : "Task 2 (opinion/discussion/problem-solution essay, 250 words)";
        prompt = `Write one realistic IELTS Writing ${task} prompt related to "${topic}". For Task 1 include the full data in text (e.g. a small table) so the learner can describe it without an image.
JSON: {"prompt":"full task instructions in English","tips_vi":["3 short tips in Vietnamese"],"min_words":${body.wtask === 1 ? 150 : 250}}`;
      } else if (sk === "wgrade") {
        const essay = String(body.essay ?? "").slice(0, 6000);
        if (essay.split(/\s+/).length < 40) return json({ error: "Bài viết quá ngắn" }, 400);
        prompt = `You are a strict, experienced IELTS examiner. Grade this IELTS Writing ${body.wtask === 1 ? "Task 1" : "Task 2"} response using the official public band descriptors.
TASK: """${String(body.prompt ?? "").slice(0, 2000)}"""
RESPONSE: """${essay}"""
Give band scores (0-9 in 0.5 steps) for each criterion: ${body.wtask === 1 ? "TA (Task Achievement)" : "TR (Task Response)"}, CC (Coherence and Cohesion), LR (Lexical Resource), GRA (Grammatical Range and Accuracy), and overall (average rounded to nearest 0.5). Penalise under-length.
Feedback in Vietnamese: 2-3 strengths, 3-4 most important improvements to reach band 7. List up to 8 concrete corrections from the text.
Then write a short band-7.5 model rewrite of the first 2 paragraphs (English).
JSON: {"overall":6.5,"criteria":{"${body.wtask === 1 ? "TA" : "TR"}":6.5,"CC":6.5,"LR":6.5,"GRA":6.5},"strengths_vi":[""],"improve_vi":[""],"corrections":[{"orig":"","fix":"","why_vi":""}],"model":""}`;
      } else if (sk === "sprompt") {
        const part = [1, 2, 3].includes(Number(body.part)) ? Number(body.part) : 1;
        prompt = `Write IELTS Speaking Part ${part} material related to "${topic}". ${part === 2 ? "A cue card: topic line 'Describe ...' plus 3-4 'You should say' bullet points and the final 'and explain ...' line." : "3 questions an examiner would ask in this part."}
JSON: {"part":${part},"questions":["..."],"cue":${part === 2 ? '{"title":"","bullets":["",""]}' : "null"},"tips_vi":["2 short tips in Vietnamese"]}`;
      } else return json({ error: "skill không hợp lệ" }, 400);
    } else if (body.task === "ielts_speak") {
      const audio = String(body.audio ?? "");
      if (audio.length < 1000 || audio.length > 6_000_000) return json({ error: "Bản ghi không hợp lệ" }, 400);
      const mime = /^audio\/[a-z0-9.+-]+$/.test(String(body.mime)) ? String(body.mime) : "audio/mp4";
      const q = String(body.question ?? "").slice(0, 800);
      try {
        const t = await transcribe(admin, audio, mime, q);
        const heard = String(t.heard ?? "").trim();
        if (!/[a-z]/i.test(heard)) return json({ error: "AI chưa nghe rõ, hãy nói to và gần máy hơn" }, 422);
        const g = await llmJSON(admin, `You are an experienced IELTS Speaking examiner. Part ${Number(body.part) || 1}. Question/cue: """${q}"""
Transcript of the candidate's answer (from speech recognition, punctuation may be missing): """${heard}"""
Estimate band scores (0-9, 0.5 steps) for FC (Fluency and Coherence), LR (Lexical Resource), GRA (Grammatical Range and Accuracy) from the transcript; for P (Pronunciation) give a cautious estimate based on recognition quality and note it is approximate. overall = average rounded to 0.5. Consider length: Part 1 ~20-40s, Part 2 ~1.5-2min, Part 3 ~40-60s.
Feedback in Vietnamese: strengths, 3 key improvements. Suggest 5 better words/phrases (English with Vietnamese meaning). Give a band-7.5 sample answer (English, natural spoken style).
JSON: {"overall":6.0,"criteria":{"FC":6,"LR":6,"GRA":6,"P":6},"strengths_vi":[""],"improve_vi":[""],"upgrade":[{"en":"","vi":""}],"sample":""}`, 0.3);
        return json({ ...g, transcript: heard });
      } catch (e) { return json({ error: String((e as Error).message ?? e) }, 502); }
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
