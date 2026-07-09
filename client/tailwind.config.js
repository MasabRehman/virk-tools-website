/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'industrial-black': '#0B0E14',
        'industrial-dark': '#151A22',
        'safety-yellow': '#FFC000',
        'safety-yellow-hover': '#E6AD00',
        'border-gray': '#1F242D',
        'text-gray': '#9CA3AF',
        'light-gray': '#F3F4F6'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Oswald', 'sans-serif'],
      },
      boxShadow: {
        'industrial': '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
      }
    },
  },
  plugins: [],
}
