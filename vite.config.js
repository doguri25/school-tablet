import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// GitHub Actions 빌드 시 /school-tablet/ 서브패스 적용, 그 외(Vercel·로컬)는 루트
const base = process.env.GITHUB_ACTIONS ? '/school-tablet/' : '/';

export default defineConfig({
  plugins: [react()],
  base,
})
