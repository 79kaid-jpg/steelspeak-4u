// Service worker tối giản: chỉ để điện thoại cho phép "cài" app lên màn hình chính.
// Không lưu bộ nhớ đệm, mọi yêu cầu đi thẳng ra mạng nên luôn dùng bản mới nhất.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});
