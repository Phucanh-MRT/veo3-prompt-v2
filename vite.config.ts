import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // THÊM DÒNG DƯỚI ĐÂY:
  base: '/Veo3-Prompt/', 
})
