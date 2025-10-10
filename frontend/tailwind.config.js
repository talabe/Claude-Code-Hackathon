/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // SlideRx brand colors
        primary: '#2563EB',
        secondary: '#10B981',
        accent: '#F59E0B',
        error: '#EF4444',
        neutral: '#64748B',
        background: '#F8FAFC',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
