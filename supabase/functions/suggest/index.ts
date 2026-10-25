// Supabase Edge Function "suggest": người học góp từ; AI (Gemini) chấm level.
// AI đồng ý level người học đề nghị + xác nhận từ hợp lệ, đúng ngành → tự duyệt vào kho từ.
// Không khớp → mở bình chọn; đủ ngưỡng phiếu → chờ admin duyệt.
// Secrets: GEMINI_API_KEY (dùng chung với function "ai"), GEMINI_MODEL (tuỳ chọn)
import { createClient } from "npm:@supabase/supabase-js@2.45.4";
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });
const CEFR = ["A1", "A2", "B1", "B2", "C1", "C2"];
const SPEC = ["1", "2", "3", "4", "5"];


// LLM: ưu tiên Anthropic (ANTHROPIC_API_KEY), nếu không có thì dùng Gemini (GEMINI_API_KEY)
async function llmJSON(prompt: string, temperature = 0.3): Promise<any> {
  const ak = Deno.env.get("ANTHROPIC_API_KEY");
  let out = "";
  if (ak) {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": ak, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: Deno.env.get("ANTHROPIC_MODEL") ?? "claude-haiku-5-5", max_tokens: 4000, temperature,
        messages: [{ role: "user", content: prompt + "\n\nRespond with the JSON object only, no prose, no code fences." }] }),
    });
    if (r.status === 429) throw new Error("AI đang bận");
    if (!r.ok) throw new Error("Lỗi AI: " + (await r.text()).slice(0, 200));
    const g = await r.json();
    out = (g.content ?? []).map((c: { text?: string }) => c.text ?? "").join("");
  } else {
    const model = Deno.env.get("GEMINI_MODEL") ?? "gemini-2.5-flash";
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${Deno.env.get("GEMINI_API_KEY")}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", temperature } }),
    });
    if (r.status === 429) throw new Error("AI đang bận");
    if (!r.ok) throw new Error("Lỗi AI: " + (await r.text()).slice(0, 200));
    const g = await r.json();
    out = g.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "{}";
  }
  const a = out.indexOf("{"), b = out.lastIndexOf("}");
  return JSON.parse(a >= 0 && b > a ? out.slice(a, b + 1) : out);
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
      ai = await llmJSON(prompt, 0.2);
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
