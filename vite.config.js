import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { capsizeRadixPlugin } from "vite-plugin-capsize-radix"
import merriweather from "@capsizecss/metrics/merriweather"
import merriweatherSans from "@capsizecss/metrics/merriweatherSans"
import arial from "@capsizecss/metrics/arial"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    capsizeRadixPlugin({
      // Import this file into your app after you import Radix's CSS
      outputPath: `./public/typography.css`,
      // Use system fonts since they're always available
      defaultFontStack: [merriweather, arial],
      headingFontStack: [merriweatherSans, arial],
    }),
  ],
  server: {
    proxy: {
      // Proxy API requests to the backend server
      "/api": "http://localhost:4001",
      // Proxy FormPost example to the backend server
      "/examples/01-FormPost": "http://localhost:4001",
    },
  },
})
