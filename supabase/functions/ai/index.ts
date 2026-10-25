// Supabase Edge Function: gọi Google Gemini (free tier) để tạo bài học / hội thoại.
// Secrets: ANTHROPIC_API_KEY (ưu tiên) hoặc GEMINI_API_KEY; GEMINI_API_KEY cần cho chấm phát âm qua ghi âm, GEMINI_MODEL (tuỳ chọn), DAILY_LIMIT (tuỳ chọn)
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
    if (!parts) {
      try { return json(await llmJSON(prompt, 0.4)); }
      catch (e) { return json({ error: String((e as Error).message ?? e) }, 502); }
    }
    // Chấm phát âm từ ghi âm: cần Gemini (Claude API chưa nhận âm thanh)
    if (!Deno.env.get("GEMINI_API_KEY")) return json({ error: "Chấm qua ghi âm cần GEMINI_API_KEY" }, 501);
    const model = Deno.env.get("GEMINI_MODEL") ?? "gemini-2.5-flash";
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${Deno.env.get("GEMINI_API_KEY")}`,
      { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ role: "user", parts }], generationConfig: { responseMimeType: "application/json", temperature: 0.2 } }) },
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
