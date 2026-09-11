/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  safelist: [
    'bg-slate-100', 'text-slate-700', 'bg-blue-100', 'text-blue-700', 'bg-cyan-100', 'text-cyan-700',
    'bg-amber-100', 'text-amber-700', 'bg-violet-100', 'text-violet-700', 'bg-indigo-100', 'text-indigo-700',
    'bg-purple-100', 'text-purple-700', 'bg-orange-100', 'text-orange-700', 'bg-emerald-100', 'text-emerald-700',
    'bg-red-100', 'text-red-700',
    'dark:bg-slate-800', 'dark:text-slate-200', 'dark:bg-blue-900/40', 'dark:text-blue-200',
    'dark:bg-cyan-900/40', 'dark:text-cyan-200', 'dark:bg-amber-900/40', 'dark:text-amber-200',
    'dark:bg-violet-900/40', 'dark:text-violet-200', 'dark:bg-indigo-900/40', 'dark:text-indigo-200',
    'dark:bg-purple-900/40', 'dark:text-purple-200', 'dark:bg-orange-900/40', 'dark:text-orange-200',
    'dark:bg-emerald-900/40', 'dark:text-emerald-200', 'dark:bg-red-900/40', 'dark:text-red-200',
    'bg-brand-100', 'text-brand-700', 'dark:bg-brand-900/40', 'dark:text-brand-200'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22'
        },
        ink: {
          900: '#101828',
          700: '#344054',
          500: '#667085',
          400: '#98a2b3',
          300: '#d0d5dd',
          200: '#eaecf0',
          100: '#f2f4f7',
          50: '#f9fafb'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif']
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,.05), 0 1px 3px rgba(16,24,40,.06)',
        pop: '0 12px 32px -12px rgba(4,120,87,.25)'
      },
      borderRadius: {
        xl2: '1.1rem'
      }
    }
  },
  plugins: []
}
