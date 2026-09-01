/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: "#f4f2ec",
          raised: "#faf9f5",
          dark: "#0b1916",
        },
        ink: {
          DEFAULT: "#12241f",
          muted: "#4b5a54",
        },
        teal: {
          deep: "#0d2e2a",
          brand: "#1c4b46",
          light: "#2a6b64",
        },
        risk: {
          low: "#5b7a5a",
          medium: "#b8862e",
          high: "#a8492f",
          critical: "#7c1f2b",
        }
      },
      fontFamily: {
        serif: ['"Source Serif 4"', "Georgia", "serif"],
        mono: ['"IBM Plex Mono"', "Courier New", "monospace"],
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
}
