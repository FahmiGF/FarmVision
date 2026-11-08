/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        farm: {
          950: '#061A14', // Deepest Emerald Earth Canvas
          900: '#0B251D', // Surface container
          850: '#0E2E24',
          800: '#143D31', // Card background
          700: '#1F5444', // Border
          600: '#2A6E59',
          500: '#10B981', // Primary Emerald
          400: '#34D399',
          300: '#6EE7B7',
          200: '#A7F3D0',
          100: '#D1FAE5',
        },
        agri: {
          leaf: '#10B981',
          cyan: '#06B6D4',
          amber: '#F59E0B',
          danger: '#EF4444',
          violet: '#8B5CF6',
          soil: '#92400E',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
