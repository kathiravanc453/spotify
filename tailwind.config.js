/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'spotify-green': '#1DB954',
        'spotify-black': '#0f0f0f',
        'spotify-dark': '#181818',
        'spotify-light': '#282828',
      },
      animation: {
        'equalize': 'equalize 1.2s ease-in-out infinite',
        'equalize-1': 'equalize 1.2s ease-in-out 0.4s infinite',
        'equalize-2': 'equalize 1.2s ease-in-out 0.8s infinite',
      },
    },
  },
  plugins: [],
}
