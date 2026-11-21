/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,mjs}',
    './components/**/*.{js,mjs}',
  ],
  theme: {
    extend: {
      colors: {
        surface: '#F8FAFC',
        'surface-container-lowest': '#FFFFFF',
        'surface-container-low': '#F1F5F9',
        'surface-container': '#E2E8F0',
        'surface-container-high': '#CBD5E1',
        'on-surface': '#0F172A',
        'on-surface-variant': '#475569',
        outline: '#94A3B8',
        'outline-variant': '#E2E8F0',
        primary: '#4F46E5',
        'primary-container': '#4338CA',
        'on-primary': '#FFFFFF',
        danger: '#EF4444',
      },
      fontFamily: {
        display: ['var(--font-montserrat)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['var(--font-montserrat)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        none: 'none',
      },
    },
  },
  plugins: [],
};
