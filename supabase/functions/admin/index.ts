// Supabase Edge Function "admin": chỉ admin gọi được.
// Tạo tài khoản, sửa hồ sơ, đặt lại mật khẩu, khoá/mở khoá, xem tiến độ.
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...cors, "Content-Type": "application/json" } });
const ROLES = ["TPL", "QA", "QC", "Khác"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: "Chưa đăng nhập" }, 401);

    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: me } = await admin.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
    if (!me?.is_admin) return json({ error: "Bạn không có quyền admin" }, 403);

    const b = await req.json();
    const profile = (x: Record<string, unknown>) => ({
      full_name: String(x.full_name ?? "").slice(0, 120),
      role: ROLES.includes(String(x.role)) ? String(x.role) : "TPL",
      department: String(x.department ?? "").slice(0, 120),
      is_admin: !!x.is_admin,
      updated_at: new Date().toISOString(),
    });

    if (b.action === "list") {
      const users: Record<string, unknown>[] = [];
      for (let page = 1; page < 50; page++) {
        const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
        if (error) throw error;
        users.push(...data.users);
        if (data.users.length < 1000) break;
      }
      const { data: profs } = await admin.from("profiles").select("*");
      const { data: prog } = await admin.from("progress").select("user_id,data");
      const P = new Map((profs ?? []).map((p) => [p.id, p]));
      const G = new Map((prog ?? []).map((p) => [p.user_id, p.data]));
      return json({
        users: users.map((u: any) => {
          const p = P.get(u.id) ?? {}, g: any = G.get(u.id) ?? {};
          return {
            id: u.id, email: u.email, last_sign_in: u.last_sign_in_at,
            banned: !!u.banned_until && new Date(u.banned_until) > new Date(),
            full_name: p.full_name ?? "", role: p.role ?? "TPL", department: p.department ?? "", is_admin: !!p.is_admin,
            xp: g.xp ?? 0, wrong: Object.keys(g.wrong ?? {}).length, done: Object.keys(g.done ?? {}).length,
          };
        }).sort((a, b) => (a.full_name || a.email).localeCompare(b.full_name || b.email, "vi")),
      });
    }

    if (b.action === "create") {
      const email = String(b.email ?? "").trim().toLowerCase();
      if (!/^\S+@\S+\.\S+$/.test(email)) return json({ error: "Email không hợp lệ" }, 400);
      if (String(b.password ?? "").length < 8) return json({ error: "Mật khẩu cần ít nhất 8 ký tự" }, 400);
      const pf = profile(b);
      const { data, error } = await admin.auth.admin.createUser({
        email, password: String(b.password), email_confirm: true,
        user_metadata: { full_name: pf.full_name, role: pf.role, department: pf.department },
      });
      if (error) return json({ error: /already/i.test(error.message) ? "Email này đã có tài khoản" : error.message }, 400);
      await admin.from("profiles").upsert({ id: data.user.id, email, ...pf });
      return json({ ok: true, id: data.user.id });
    }

    if (b.action === "update") {
      const id = String(b.id ?? "");
      if (!id) return json({ error: "Thiếu id" }, 400);
      const pf = profile(b);
      if (id === user.id && !pf.is_admin) return json({ error: "Không thể tự bỏ quyền admin của chính mình" }, 400);
      const attrs: Record<string, unknown> = {};
      const email = String(b.email ?? "").trim().toLowerCase();
      if (email) { attrs.email = email; attrs.email_confirm = true; }
      if (b.password) {
        if (String(b.password).length < 8) return json({ error: "Mật khẩu cần ít nhất 8 ký tự" }, 400);
        attrs.password = String(b.password);
      }
      if (Object.keys(attrs).length) {
        const { error } = await admin.auth.admin.updateUserById(id, attrs);
        if (error) return json({ error: error.message }, 400);
      }
      const { error } = await admin.from("profiles").upsert({ id, email: email || undefined, ...pf });
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }

    if (b.action === "ban") {
      const id = String(b.id ?? "");
      if (id === user.id) return json({ error: "Không thể tự khoá chính mình" }, 400);
      const { error } = await admin.auth.admin.updateUserById(id, { ban_duration: b.ban ? "876000h" : "none" });
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }

    return json({ error: "action không hợp lệ" }, 400);
  } catch (e) {
    return json({ error: String((e as Error).message ?? e) }, 500);
  }
});
