/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // SlideRx brand colors - NEW DESIGN SYSTEM
        primary: '#c7e565',       // Lime green
        primaryDark: '#90BC00',   // Dark green for hover states
        secondary: '#10B981',     // Keep for success states
        accent: '#F59E0B',        // Keep for warning states
        error: '#EF4444',         // Keep for error states
        neutral: {
          light: '#ceced0',       // Light gray for secondary text
          DEFAULT: '#64748B',     // Medium gray
          dark: '#222',           // Dark gray for main text
        },
        background: {
          light: '#f5f5f5',       // Light background
          DEFAULT: '#fff',        // White
        },
        border: '#eaeaea',        // Light gray border
        heading: '#111',          // Almost black for headings
      },
      fontFamily: {
        mono: ['"IBM Plex Mono"', 'monospace'],      // For headings, buttons
        sans: ['Montserrat', 'sans-serif'],          // For body text
      },
    },
  },
  plugins: [],
}
