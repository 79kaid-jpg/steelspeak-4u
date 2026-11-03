// Supabase Edge Function "tts": đọc tiếng Anh bằng Gemini TTS, lưu file vào Storage (bucket "tts")
// để mỗi câu chỉ tạo 1 lần. Ai cũng nghe được file đã có; chỉ người đăng nhập mới tạo file mới.
// Secrets: GEMINI_API_KEY (đã có). Tuỳ chọn: TTS_VOICE (mặc định Kore), TTS_MODEL.
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...cors, "Content-Type": "application/json" } });
const env = (k: string) => Deno.env.get(k) ?? "";
const VOICE = env("TTS_VOICE") || "Kore";
const STYLE = "clear, natural American English for a language learner, moderate pace";

async function sha(s: string) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 40);
}
const b64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
function wav(pcm: Uint8Array, rate = 24000) {
  const h = new ArrayBuffer(44), v = new DataView(h), w = (o: number, s: string) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  w(0, "RIFF"); v.setUint32(4, 36 + pcm.length, true); w(8, "WAVE"); w(12, "fmt "); v.setUint32(16, 16, true);
  v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true);
  v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, "data"); v.setUint32(40, pcm.length, true);
  const out = new Uint8Array(44 + pcm.length); out.set(new Uint8Array(h)); out.set(pcm, 44); return out;
}

// Thử API mới (Interactions) trước, rồi API cũ (generateContent) để chạy được với mọi khoá
async function gemini(text: string, rate: number): Promise<Uint8Array> {
  const key = env("GEMINI_API_KEY"); if (!key) throw new Error("Thiếu GEMINI_API_KEY");
  const style = STYLE + (rate < 0.8 ? ", speak slowly and clearly" : "");
  const errs: string[] = [];
  for (const model of [env("TTS_MODEL") || "gemini-3.8-flash-tts", "gemini-3.8-flash-lite-tts"]) {
    const r = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
      method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({ model, input: [{ type: "user_input", content: [{ type: "text", text, annotations: [{ type: "speech_metadata", style }] }] }],
        response_format: { type: "audio" }, generation_config: { speech_config: [{ voice: VOICE }] } }),
    });
    if (r.ok) {
      const j = await r.json();
      const a = (j.steps || []).filter((s: any) => s.type == "model_output").flatMap((s: any) => s.content || []).filter((c: any) => c.type == "audio").pop();
      if (a?.data) { const bytes = b64(a.data); return String.fromCharCode(...bytes.slice(0, 4)) == "RIFF" ? bytes : wav(bytes); }
    }
    errs.push(model + ": " + r.status);
  }
  for (const model of ["gemini-2.5-flash-preview-tts", "gemini-2.5-flash-tts"]) {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: `Say in ${style}: ${text}` }] }],
        generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } } } }),
    });
    if (r.ok) { const d = (await r.json()).candidates?.[0]?.content?.parts?.[0]?.inlineData?.data; if (d) return wav(b64(d)); }
    errs.push(model + ": " + r.status);
  }
  throw new Error("Gemini TTS lỗi (" + errs.join(", ") + ")");
}

Deno.serve(async (req) => {
  if (req.method == "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { text: raw, rate = 1 } = await req.json();
    const text = String(raw ?? "").replace(/\s+/g, " ").trim().slice(0, 300);
    if (!text) return json({ error: "Thiếu nội dung" }, 400);
    const admin = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"));
    const path = `${VOICE}/${rate < 0.8 ? "slow" : "n"}/${await sha(text.toLowerCase())}.wav`;
    const url = admin.storage.from("tts").getPublicUrl(path).data.publicUrl;
    const head = await fetch(url, { method: "HEAD" });
    if (head.ok) return json({ url, cached: true });
    // Chỉ người đăng nhập mới được tạo file mới (tránh bị lạm dụng hạn mức)
    const auth = req.headers.get("authorization") ?? "";
    const { data: { user } } = await createClient(env("SUPABASE_URL"), env("SUPABASE_ANON_KEY"), { global: { headers: { Authorization: auth } } }).auth.getUser();
    if (!user) return json({ error: "login" }, 401);
    const audio = await gemini(text, rate);
    const up = await admin.storage.from("tts").upload(path, audio, { contentType: "audio/wav", upsert: true, cacheControl: "31536000" });
    if (up.error) throw up.error;
    return json({ url, cached: false });
  } catch (e) {
    return json({ error: String((e as Error).message ?? e) }, 500);
  }
});
