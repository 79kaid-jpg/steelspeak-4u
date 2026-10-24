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

## Tài khoản, hồ sơ & quản trị

Đăng nhập bằng **email + mật khẩu** (admin cấp), hoặc bằng link gửi qua email. Mỗi người có trang **Tài khoản** để sửa hồ sơ (họ tên, vai trò TPL/QA/QC, phòng ban) và đổi mật khẩu. Admin có thêm trang **Quản trị người dùng**: tạo tài khoản, sửa hồ sơ, đặt mật khẩu mới, khoá/mở khoá, xem XP, số từ sai và số chặng đã qua của từng người.

### Cài đặt (làm 1 lần)
1. **SQL Editor** → dán `supabase/profiles.sql`. Ở dòng cuối, **đổi `email-cua-ban@gmail.com` thành email của bạn** → **Run**. (Email này phải đã đăng nhập app ít nhất 1 lần; nếu chưa, đăng nhập rồi chạy lại riêng dòng `update` cuối.)
2. **Edge Functions → Deploy a new function → Via Editor**, tên `admin`, dán `supabase/functions/admin/index.ts` → **Deploy**. (CLI: `supabase functions deploy admin`.)
3. Muốn chỉ admin tạo được tài khoản (không cho người lạ tự đăng ký): **Authentication → Sign In / Providers** → tắt **Allow new users to sign up**.
4. Bật đăng nhập bằng mật khẩu: **Authentication → Sign In / Providers → Email** → bật **Email** (mặc định đã bật).
5. Link "Quên mật khẩu" dùng **Redirect URLs** đã khai báo ở bước 5 phía trên.

## Speed Saga (đua level)

32 level trong 8 khu vực nhà máy, mỗi level 10 câu trộn 5 dạng (chọn nghĩa, chọn từ, nghe & chọn, điền từ, xếp quy trình). Mọi người chơi **cùng một đề** (tạo theo seed trong `saga-core.js`). Sai bị khoá 2 giây. 1–3 sao, Overdrive nhảy cóc 2 level. Điểm do **máy chủ chấm lại** rồi mới ghi vào bảng xếp hạng tuần (Đồng → Bạc → Vàng → Kim cương).

### Cài đặt (1 lần)
1. **SQL Editor** → dán `supabase/saga.sql` → **Run**.
2. **Edge Functions → Deploy a new function → Via Editor**, tên `saga`, dán **toàn bộ** `supabase/functions/saga/index.ts` → **Deploy**.
3. Sửa `saga-core.js` (thêm level, đổi luật điểm) thì chạy `tools/build-saga-fn.sh` rồi deploy lại function `saga`, để đề và điểm trên máy chủ khớp với web.

## Nhiều khóa học (Giai đoạn 1 nền tảng)

Khóa học (track) và từ vựng nằm trong cơ sở dữ liệu. Khóa **Thép phủ** cần admin duyệt đơn tham gia; khóa **General English (CEFR)** mở cho mọi người. Người dùng đã có tài khoản được cho vào khóa Thép sẵn.

### Cài đặt (1 lần)
1. **SQL Editor** → dán `supabase/platform.sql` → **Run** (tạo bảng `tracks`, `enrollments`, `words`, nạp 148 thuật ngữ thép, tạo 2 khóa học).
2. Muốn email công ty được duyệt tự động: chạy `update tracks set auto_domains = '{congty.com.vn}' where slug = 'steel';`
3. Admin duyệt đơn ở **Tài khoản → Quản trị người dùng → Đơn tham gia khóa học**.

Chưa chạy `platform.sql` thì app vẫn chạy như cũ (chỉ một khóa Thép).

## Đua level theo từng khóa học

Mỗi khóa có bản đồ, câu hỏi và bảng xếp hạng riêng; chỉ người đã **tham gia (được duyệt)** khóa đó mới đua được. Khóa CEFR chia mỗi bậc thành các khu 40 từ (A1.1, A1.2…), mỗi khu 4 level.

### Cài đặt (1 lần, sau platform.sql)
1. **SQL Editor** → `supabase/saga_v3.sql` → **Run** (điểm đua theo khóa, bảng xếp hạng theo khóa).
2. **SQL Editor** → `supabase/general_a1.sql` → **Run** (156 từ A1 đầu tiên cho General English; danh sách từ theo CEFR-J Vocabulary Profile 1.5 – Tono Laboratory, TUFS).
3. **Edge Functions → saga** → dán lại toàn bộ `supabase/functions/saga/index.ts` → **Deploy**.
