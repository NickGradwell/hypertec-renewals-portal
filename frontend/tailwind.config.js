/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-pink': '#EC4899',
        'brand-gradient': 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)',
        'primary': '#2962FF',
        'primary-hover': '#0039CB',
        'sidebar-bg': '#1A237E',
        'sidebar-active': '#2962FF',
        'sidebar-hover': '#283593',
      }
    },
  },
  plugins: [],
}
