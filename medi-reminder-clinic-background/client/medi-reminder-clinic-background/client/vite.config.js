import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// أثناء التطوير: أي طلب يبدأ بـ /api بيتحوّل للسيرفر على بورت 5000
export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': 'http://localhost:5000' } },
});
