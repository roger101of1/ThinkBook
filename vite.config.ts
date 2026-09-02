import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// `base` is set for GitHub Pages project sites (https://<user>.github.io/<repo>/).
// Override with VITE_BASE=/ for a root deploy or local preview.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE ?? '/sop-academy/',
})
