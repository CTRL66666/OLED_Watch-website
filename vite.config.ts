import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'
import { viteSingleFile } from "vite-plugin-singlefile"  // ← 第1处：添加这行

// https://vite.dev/config/ 
export default defineConfig({
  base: '/OLED_Watch-website/',
  plugins: [inspectAttr(), react(), viteSingleFile()],  // ← 第2处：在这里添加 viteSingleFile()
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});