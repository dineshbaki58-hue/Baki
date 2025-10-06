/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: { extend: { colors: { brand: { DEFAULT: '#FF2D55', dark: '#E0264A' } } } },
  plugins: [],
};
