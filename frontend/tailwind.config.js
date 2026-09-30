/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "surface": "#080d16",
        "surface-dim": "#060911",
        "surface-bright": "#1a2638",
        "surface-container-lowest": "#05080f",
        "surface-container-low": "#0b111e",
        "surface-container": "#0e1625",
        "surface-container-high": "#131e30",
        "surface-container-highest": "#19273e",
        "surface-variant": "#1d2c44",
        "on-surface": "#f1f5f9",
        "on-surface-variant": "#94a3b8",
        "on-surface-muted": "#64748b",
        "inverse-surface": "#e2e8f0",
        "inverse-on-surface": "#0f172a",
        "outline": "#334155",
        "outline-variant": "rgba(255, 255, 255, 0.08)",
        "primary": "#2dd4bf", // Refined sea-glass turquoise
        "on-primary": "#042f2e",
        "primary-container": "#14b8a6",
        "on-primary-container": "#ccfbf1",
        "primary-fixed": "#99f6e4",
        "secondary": "#38bdf8", // Restrained nautical cyan
        "on-secondary": "#082f49",
        "secondary-container": "#0284c7",
        "on-secondary-container": "#e0f2fe",
        "tertiary": "#94a3b8",
        "on-tertiary": "#0f172a",
        "tertiary-container": "#1e293b",
        "error": "#f87171",
        "on-error": "#450a0a",
        "error-container": "#7f1d1d",
        "on-error-container": "#fecaca",
        "background": "#060911",
        "on-background": "#f1f5f9"
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "none": "0",
        "sm": "0.125rem",
        "md": "0.25rem",
        "lg": "0.375rem",
        "xl": "0.5rem",
        "full": "9999px"
      },
      fontFamily: {
        "headline": ["Newsreader", "Georgia", "serif"],
        "sans": ["Hanken Grotesk", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        "body": ["Hanken Grotesk", "sans-serif"],
        "mono": ["JetBrains Mono", "monospace"]
      }
    }
  },
  plugins: [],
}
