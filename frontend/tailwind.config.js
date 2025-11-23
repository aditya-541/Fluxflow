/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: '#6366f1', // Indigo 500
        secondary: '#ec4899', // Pink 500
        dark: '#0f172a', // Slate 900
        'dark-surface': '#1e293b', // Slate 800
        light: '#f8fafc', // Slate 50
        accent: '#8b5cf6', // Violet 500
        success: '#10b981', // Emerald 500
        warning: '#f59e0b', // Amber 500
        error: '#ef4444', // Red 500
      }
    },
  },
  plugins: [],
}
