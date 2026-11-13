/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FCFBF9',
          100: '#FAF8F4',
          200: '#F5F2EB',
          300: '#EBE6DC',
          400: '#DED7C9',
          500: '#C8BFAe',
        },
        charcoal: {
          900: '#151719',
          800: '#1E2124',
          700: '#2C3035',
          600: '#424850',
          500: '#5F6773',
          400: '#848E9C',
          300: '#B0B8C4',
        },
        lavender: {
          50: '#F5F4FD',
          100: '#EBE8FA',
          200: '#DAD4F6',
          300: '#BEB4EF',
          500: '#7C6EE6',
          600: '#6957DE',
          700: '#5442CC',
        },
        mint: {
          50: '#F0FDF8',
          100: '#DCFCEE',
          200: '#BCF5DC',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
        },
        softblue: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          500: '#3B82F6',
          600: '#2563EB',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'soft': '0 2px 10px -2px rgba(27, 29, 32, 0.04), 0 1px 3px -1px rgba(27, 29, 32, 0.03)',
        'elevated': '0 8px 30px -4px rgba(27, 29, 32, 0.08), 0 4px 10px -2px rgba(27, 29, 32, 0.04)',
      }
    },
  },
  plugins: [],
}
