#!/bin/sh
# Tạo lại supabase/functions/saga/index.ts từ saga-core.js (chạy sau khi sửa saga-core.js)
cd "$(dirname "$0")/.." && { cat saga-core.js; cat supabase/functions/saga/handler.ts.txt; } > supabase/functions/saga/index.ts && echo "OK: supabase/functions/saga/index.ts"
