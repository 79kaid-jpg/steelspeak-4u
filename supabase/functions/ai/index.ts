// Supabase Edge Function: gọi Google Gemini (free tier) để tạo bài học / hội thoại.
// Secrets cần đặt: GEMINI_API_KEY (bắt buộc), GEMINI_MODEL (tuỳ chọn), DAILY_LIMIT (tuỳ chọn)
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
    } else return json({ error: "task không hợp lệ" }, 400);

    const model = Deno.env.get("GEMINI_MODEL") ?? "gemini-2.5-flash";
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${Deno.env.get("GEMINI_API_KEY")}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.4 },
        }),
      },
    );
    if (r.status === 429) return json({ error: "AI đang bận" }, 429);
    if (!r.ok) return json({ error: "Lỗi AI: " + (await r.text()).slice(0, 200) }, 502);
    const g = await r.json();
    const out = g.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "{}";
    return json(JSON.parse(out.replace(/^```json|```$/g, "").trim()));
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
