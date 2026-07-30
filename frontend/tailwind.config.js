/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803d',
        },
        accent: '#FACC15',
      },
      backgroundImage: {
        'hero-grid': 'linear-gradient(180deg, rgba(248,250,252,0.98), rgba(255,255,255,0.96))',
      },
    },
  },
  plugins: [],
};
