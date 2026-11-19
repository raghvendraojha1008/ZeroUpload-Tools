import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // The SSG bundle is imported straight by Node, so inline every dependency
  // instead of relying on the package's ESM resolution.
  ssr: { noExternal: true },
})
