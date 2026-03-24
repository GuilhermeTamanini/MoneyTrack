import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef8f4',
          100: '#d7efe4',
          200: '#b0dec8',
          300: '#82c7a7',
          400: '#53ad84',
          500: '#2e8f67',
          600: '#1f7252',
          700: '#1a5b43',
          800: '#184937',
          900: '#153c2e'
        }
      },
      boxShadow: {
        soft: '0 20px 45px -25px rgba(21, 60, 46, 0.35)'
      }
    },
  },
  plugins: [],
} satisfies Config;
