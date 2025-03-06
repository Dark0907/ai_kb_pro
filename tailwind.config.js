/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1a365d', // 深蓝色
          light: '#2a4a7f',
          dark: '#102a4c',
        },
        accent: {
          DEFAULT: '#c5a572', // 金色
          light: '#d4b989',
          dark: '#b69259',
        },
        law: {
          50: '#f8f9fa',
          100: '#f7f9fc',
          200: '#edf2f7',
          300: '#e2e8f0',
          400: '#cbd5e0',
          500: '#a0aec0',
          600: '#718096',
          700: '#4a5568',
          800: '#2d3748',
          900: '#1a202c',
        },
        'legal-primary': '#2c3e50',
        'legal-secondary': '#3498db',
        'legal-accent': '#e74c3c',
        'legal-light': '#ecf0f1',
        'legal-dark': '#2c3e50',
      },
      fontFamily: {
        sans: ['Inter var', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      maxWidth: {
        '8xl': '88rem',
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'law': '0 4px 6px -1px rgba(26, 54, 93, 0.1), 0 2px 4px -1px rgba(26, 54, 93, 0.06)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 