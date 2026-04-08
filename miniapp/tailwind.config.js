/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['SF Pro Display', 'Inter', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'inner-neumorphic': 'inset 5px 5px 10px #212529, inset -5px -5px 10px #343a40',
        'neumorphic': '5px 5px 10px #212529, -5px -5px 10px #343a40',
      },
    },
  },
  plugins: [],
}
