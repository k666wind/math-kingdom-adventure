/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        kingdom: {
          purple:  '#2D1B69',
          'purple-dark': '#1a0a4a',
          'purple-light': '#3d2a7a',
          orange:  '#FF6B35',
          gold:    '#FFE66D',
          teal:    '#4ECDC4',
          green:   '#6BCB77',
          red:     '#FF4D6D',
          cream:   '#FFF8F0',
        },
      },
      fontFamily: {
        fredoka: ['"Fredoka One"', 'cursive'],
        nunito:  ['"Nunito"', 'sans-serif'],
      },
      borderRadius: {
        xl2: '1.25rem',
        xl3: '1.5rem',
      },
    },
  },
  plugins: [],
}
