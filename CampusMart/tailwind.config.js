/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './Views/**/*.cshtml',
    './Areas/**/*.cshtml',
    './Pages/**/*.cshtml',
    './wwwroot/js/**/*.js'
  ],
  theme: {
    extend: {
      colors: {
        campus: {
          ink: '#111827',
          surface: '#1f2937',
          blue: '#7dd3fc',
          'blue-dark': '#38bdf8',
          muted: '#aab4c3'
        }
      },
      fontFamily: {
        sans: ['Segoe UI', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
