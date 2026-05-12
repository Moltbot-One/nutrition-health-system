/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#10B981',
          dark: '#065F46',
          light: '#D1FAE5',
        },
        accent: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
        },
      },
    },
  },
  plugins: [],
};
