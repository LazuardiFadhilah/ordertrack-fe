/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,mjs}',
    './components/**/*.{js,mjs}',
  ],
  theme: {
    extend: {
      colors: {
        surface: '#FAF8FF',
        'surface-container-lowest': '#FFFFFF',
        'surface-container-low': '#F2F3FF',
        'surface-container': '#EAEDFF',
        'surface-container-high': '#E2E7FF',
        'on-surface': '#131B2E',
        'on-surface-variant': '#464553',
        outline: '#777584',
        'outline-variant': '#C8C4D5',
        primary: '#1F108E',
        'primary-container': '#3730A3',
        'on-primary': '#FFFFFF',
      },
      fontFamily: {
        display: ['var(--font-space-grotesk)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['var(--font-geist)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        none: 'none',
      },
    },
  },
  plugins: [],
};
