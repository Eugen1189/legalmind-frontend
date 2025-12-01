/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // <--- ADD THIS LINE
  theme: {
    extend: {
      colors: {
        // Primary color from requirements for PWA [cite: 6]
        primary: '#0f62fe', 
      }
    },
  },
  plugins: [],
}

