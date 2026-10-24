# SteelSpeak TPL – bản web có máy chủ (miễn phí 100%)

Ứng dụng học tiếng Anh chuyên ngành thép phủ cho TPL, QA, QC.

| Thành phần | Dịch vụ miễn phí | Dùng để |
|---|---|---|
| Web tĩnh | Netlify (hoặc Vercel / GitHub Pages / Cloudflare Pages) | Đưa app lên mạng |
| Đăng nhập + CSDL | Supabase Free | Đăng nhập bằng link email, lưu lộ trình, sổ từ sai, bài tự tạo |
| Máy chủ AI | Supabase Edge Functions | Giữ bí mật API key, giới hạn lượt/ngày |
| AI | Google Gemini API (free tier) | Tạo bài từ tài liệu, viết hội thoại |
| Giọng Mỹ & nhận dạng giọng | Có sẵn trong trình duyệt | Nghe en-US, chấm phát âm |

## Các bước (khoảng 20 phút)

### 1. Tạo Supabase
1. Vào https://supabase.com → **New project** (chọn region Singapore cho nhanh).
2. **SQL Editor** → dán nội dung `supabase/schema.sql` → **Run**.
3. **Authentication → Providers → Email**: bật Email (mặc định đã bật).
4. **Project Settings → API**: chép **Project URL** và **anon public key** vào `config.js`.

### 2. Lấy khoá Gemini miễn phí
Vào https://aistudio.google.com/apikey → **Create API key**.

### 3. Đưa máy chủ AI lên
Cài Supabase CLI (https://supabase.com/docs/guides/cli), rồi trong thư mục này:
```bash
supabase login
supabase link --project-ref YOUR-PROJECT-REF
supabase secrets set GEMINI_API_KEY=khoa-cua-ban DAILY_LIMIT=30
supabase functions deploy ai
```
(Không muốn cài CLI: vào Supabase → **Edge Functions → Deploy a new function → Via editor**, đặt tên `ai`, dán `supabase/functions/ai/index.ts`; đặt secret `GEMINI_API_KEY` ở **Edge Functions → Secrets**.)

### 4. Đưa web lên
1. Vào https://app.netlify.com/drop, kéo thả **cả thư mục** (gồm `index.html`, `config.js`, `manifest.webmanifest`, `icon.svg`).
2. Netlify cho bạn một địa chỉ dạng `https://ten-app.netlify.app`. Có thể đổi tên ở **Site settings**.
3. Quay lại Supabase → **Authentication → URL Configuration**: đặt **Site URL** = địa chỉ Netlify, thêm vào **Redirect URLs**.

### 5. Gửi link cho bạn bè
Bạn bè mở link → nhập email → bấm link trong email là vào học. Trên điện thoại chọn **Thêm vào màn hình chính** để dùng như app.

## Hạn mức miễn phí cần biết
- **Supabase Free:** 50.000 người dùng/tháng, 500 MB CSDL. Dự án tạm dừng nếu 7 ngày không ai dùng; vào dashboard bấm **Restore** là chạy lại.
- **Email đăng nhập của Supabase:** chỉ vài email/giờ. Nhiều người dùng thì nối SMTP miễn phí (VD: Brevo 300 email/ngày) ở **Authentication → SMTP Settings**.
- **Gemini free tier:** có giới hạn lượt/phút và lượt/ngày theo model. `DAILY_LIMIT` giới hạn mỗi người 30 lượt/ngày. Model đổi được bằng secret `GEMINI_MODEL` nếu Google đổi tên.
- **Chấm phát âm:** dùng nhận dạng giọng nói của trình duyệt (tốt nhất là Chrome). Muốn chấm theo từng âm như app thương mại thì dùng Azure Speech Free (F0, 5 giờ âm thanh/tháng); phần này chưa có trong code.
