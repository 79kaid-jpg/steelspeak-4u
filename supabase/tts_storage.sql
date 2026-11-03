-- Kho lưu file giọng đọc Gemini TTS (công khai để phát nhanh; chỉ Edge Function được ghi)
insert into storage.buckets (id, name, public) values ('tts','tts',true)
on conflict (id) do update set public = true;
