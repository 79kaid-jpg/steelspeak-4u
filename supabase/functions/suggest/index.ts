// Supabase Edge Function "suggest": người học góp từ; AI (Gemini) chấm level.
// AI đồng ý level người học đề nghị + xác nhận từ hợp lệ, đúng ngành → tự duyệt vào kho từ.
// Không khớp → mở bình chọn; đủ ngưỡng phiếu → chờ admin duyệt.
// Secrets: GEMINI_API_KEY (dùng chung với function "ai"), GEMINI_MODEL (tuỳ chọn)
import { createClient } from "npm:@supabase/supabase-js@2.45.4";
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });
const CEFR = ["A1", "A2", "B1", "B2", "C1", "C2"];
const SPEC = ["1", "2", "3", "4", "5"];

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
async function preferredOrder(admin: any): Promise<string[]> {
  let pref = "";
  try { const { data } = await admin.from("app_settings").select("value").eq("key", "ai_provider").maybeSingle(); pref = String(data?.value ?? ""); } catch (_) { /* bảng chưa có */ }
  const all = Object.keys(PROVIDERS).filter((p) => env(PROVIDERS[p].key));
  return pref && all.includes(pref) ? [pref, ...all.filter((p) => p !== pref)] : all;
}
async function callOne(p: string, prompt: string, temperature: number): Promise<string> {
  const k = env(PROVIDERS[p].key), model = modelOf(p);
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
        fd.append("model", env("GROQ_STT_MODEL") || "whisper-large-v3-turbo");
        fd.append("language", "en"); fd.append("response_format", "json"); fd.append("temperature", "0");
        const r = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", { method: "POST", headers: { Authorization: "Bearer " + env("GROQ_API_KEY") }, body: fd });
        if (!r.ok) throw new Error(`groq ${r.status}: ${(await r.text()).slice(0, 160)}`);
        const heard = String((await r.json()).text ?? "").trim();
        let tip = "";
        try { tip = String((await llmJSON(admin, `A Vietnamese learner tried to say "${target}" and a speech recognizer heard "${heard}". Give one short pronunciation tip in Vietnamese about the biggest difference, or empty string if they match. JSON: {"tip":""}`, 0.2)).tip ?? ""); } catch (_) { /* bỏ qua */ }
        return { heard, tip, _provider: "groq" };
      }
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelOf("gemini")}:generateContent?key=${env("GEMINI_API_KEY")}`, {
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
    const uc = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } });
    const { data: { user } } = await uc.auth.getUser();
    if (!user) return json({ error: "Chưa đăng nhập" }, 401);
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const b = await req.json();

    const { data: track } = await admin.from("tracks").select("*").eq("slug", String(b.track || "")).maybeSingle();
    if (!track) return json({ error: "Không tìm thấy khóa học" }, 404);
    const { data: enr } = await admin.from("enrollments").select("status").eq("user_id", user.id).eq("track_id", track.id).maybeSingle();
    if (!enr || enr.status !== "approved") return json({ error: "Bạn chưa tham gia khóa học này" }, 403);

    const term = String(b.term || "").trim().slice(0, 80);
    const meaning = String(b.meaning_vi || "").trim().slice(0, 200);
    const example = String(b.example || "").trim().slice(0, 300);
    const isCefr = track.kind === "cefr";
    const scale = isCefr ? CEFR : SPEC;
    const userLevel = String(b.level || "");
    const cat = isCefr ? userLevel : String(b.cat || Object.keys(track.cats || {})[0] || "");
    if (term.length < 2) return json({ error: "Từ quá ngắn" }, 400);
    if (!scale.includes(userLevel)) return json({ error: "Level không hợp lệ" }, 400);

    // Trùng với kho từ hoặc đề xuất đang mở
    const { data: dupW } = await admin.from("words").select("id").eq("track_id", track.id).ilike("term", term).limit(1);
    if (dupW && dupW.length) return json({ error: "Từ này đã có trong kho" }, 409);
    const { data: dupS } = await admin.from("word_suggestions").select("id").eq("track_id", track.id).ilike("term", term).in("status", ["voting", "needs_admin"]).limit(1);
    if (dupS && dupS.length) return json({ error: "Từ này đang được bình chọn" }, 409);

    // Giới hạn 10 đề xuất / người / ngày
    const since = new Date(Date.now() - 864e5).toISOString();
    const { count } = await admin.from("word_suggestions").select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("created_at", since);
    if ((count ?? 0) >= 10) return json({ error: "Bạn đã góp 10 từ trong 24 giờ qua" }, 429);

    // AI chấm
    let ai: { valid?: boolean; level?: string; meaning_vi?: string; example?: string; example_vi?: string; note?: string } = {};
    try {
      const prompt = `You review vocabulary submitted by a learner to an English course for Vietnamese learners.
Course: "${track.name}" (${isCefr ? "General English, CEFR levels" : "specialty / technical English"}). ${track.description || ""}
${isCefr ? "" : `Topics: ${Object.entries(track.cats || {}).map(([k, v]) => k + "=" + v).join(", ")}.`}
Submitted term: "${term}". Learner's Vietnamese meaning: "${meaning}". Example: "${example}".
Decide:
- "valid": true only if the term is a real English word/phrase, spelled correctly, AND relevant to this course${isCefr ? "" : " (its industry)"}, AND the Vietnamese meaning is correct.
- "level": ${isCefr ? 'the CEFR level of this word for learners, one of "A1","A2","B1","B2","C1","C2"' : 'difficulty for Vietnamese technical staff, one of "1" (basic, common), "2", "3" (common technical term), "4", "5" (highly specialised)'}.
- "meaning_vi": the best concise Vietnamese meaning. "example": a short natural example sentence. "example_vi": its Vietnamese translation. "note": one short sentence in Vietnamese explaining your level or why it is invalid.
Return JSON only: {"valid":true,"level":"","meaning_vi":"","example":"","example_vi":"","note":""}`;
      ai = await llmJSON(admin, prompt, 0.2);
    } catch (_) { ai = {}; }
    const aiLevel = scale.includes(String(ai.level)) ? String(ai.level) : null;
    const match = ai.valid === true && aiLevel === userLevel;

    const { data: s, error } = await admin.from("word_suggestions").insert({
      track_id: track.id, user_id: user.id, term, meaning_vi: meaning || ai.meaning_vi || "", example: example || ai.example || "",
      example_vi: ai.example_vi || "", cat, user_level: userLevel, ai_level: aiLevel, ai_valid: ai.valid ?? null,
      ai_note: ai.note || (aiLevel ? "" : "AI chưa phản hồi, chuyển sang bình chọn"), ai_meaning: ai.meaning_vi || "", status: "voting",
    }).select().single();
    if (error) return json({ error: error.message }, 500);

    if (match) {
      await admin.rpc("_accept_suggestion", { sid: s.id, final_level: userLevel, final_cat: cat, final_meaning: meaning || ai.meaning_vi || "", by_who: "ai" });
      return json({ status: "approved", ai_level: aiLevel, note: ai.note || "", id: s.id });
    }
    return json({ status: "voting", ai_level: aiLevel, ai_valid: ai.valid ?? null, note: ai.note || "", threshold: track.vote_threshold, id: s.id });
  } catch (e) {
    return json({ error: String((e as Error).message ?? e) }, 500);
  }
});
