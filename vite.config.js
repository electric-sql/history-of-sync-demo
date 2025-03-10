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
      // Custom text styles (optional)
      textStyles: [
        { fontSize: 12, lineHeight: 20 }, // size 1
        { fontSize: 14, lineHeight: 22 }, // size 2
        { fontSize: 16, lineHeight: 24 }, // size 3
        { fontSize: 18, lineHeight: 28 }, // size 4
        { fontSize: 20, lineHeight: 30 }, // size 5
        { fontSize: 24, lineHeight: 32 }, // size 6
        { fontSize: 30, lineHeight: 38 }, // size 7
        { fontSize: 36, lineHeight: 44 }, // size 8
        { fontSize: 48, lineHeight: 54 }, // size 9
      ],
    }),
  ],
})
