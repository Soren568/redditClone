const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    fontFamily: {
      'sans': ['Noto Sans', ...defaultTheme.fontFamily.sans],
    },
    extend: {
      fontFamily: {
        'noto': ['Noto Sans', 'sans-serif'],
        'varela': ['Varela Round', 'sans-serif'],
      }
    },
  },
  plugins: [],
}