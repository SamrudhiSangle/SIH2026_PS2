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
        "surface": "#0a0f18",
        "surface-dim": "#090e17",
        "surface-bright": "#343944",
        "surface-container-lowest": "#060a10",
        "surface-container-low": "#0e1626",
        "surface-container": "#121c2e",
        "surface-container-high": "#172338",
        "surface-container-highest": "#202c44",
        "surface-variant": "#253044",
        "on-surface": "#f1f5f9",
        "on-surface-variant": "#94a3b8",
        "on-surface-muted": "#64748b",
        "inverse-surface": "#dee2f0",
        "inverse-on-surface": "#2c303b",
        "outline": "#87929a",
        "outline-variant": "rgba(148, 163, 184, 0.16)",
        "surface-tint": "#7bd0ff",
        "primary": "#8ed5ff",
        "on-primary": "#00354a",
        "primary-container": "#38bdf8",
        "on-primary-container": "#004965",
        "inverse-primary": "#00668a",
        "secondary": "#4fdbc8",
        "on-secondary": "#003731",
        "secondary-container": "#14b8a6",
        "on-secondary-container": "#003f38",
        "tertiary": "#bdcee7",
        "on-tertiary": "#213145",
        "tertiary-container": "#a2b2cb",
        "error": "#ffb4ab",
        "on-error": "#690005",
        "error-container": "#93000a",
        "on-error-container": "#ffdad6",
        "primary-fixed": "#c4e7ff",
        "primary-fixed-dim": "#7bd0ff",
        "secondary-fixed": "#71f8e4",
        "secondary-fixed-dim": "#4fdbc8",
        "tertiary-fixed": "#d3e4fe",
        "tertiary-fixed-dim": "#b7c8e1",
        "background": "#0a0f18",
        "on-background": "#f1f5f9"
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "sm": "0.125rem",
        "md": "0.25rem",
        "lg": "0.375rem",
        "xl": "0.5rem",
        "2xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "gutter": "2rem",
        "gutter-mobile": "1rem",
        "margin": "3.5rem",
        "margin-mobile": "1.25rem",
        "space-xs": "0.25rem",
        "space-sm": "0.5rem",
        "space-md": "1rem",
        "space-lg": "1.75rem",
        "space-xl": "3rem"
      },
      fontFamily: {
        "headline": ["Newsreader", "serif"],
        "sans": ["Hanken Grotesk", "sans-serif"],
        "body": ["Hanken Grotesk", "sans-serif"],
        "mono": ["JetBrains Mono", "monospace"]
      }
    }
  },
  plugins: [],
}
