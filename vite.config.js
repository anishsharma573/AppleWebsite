import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), sentryVitePlugin({
    org: "jsm-4l",
    project: "javascript-react"
  }), sentryVitePlugin({
    org: "jsm-4l",
    project: "javascript-react"
  })],

  build: {
    sourcemap: true
  }
})