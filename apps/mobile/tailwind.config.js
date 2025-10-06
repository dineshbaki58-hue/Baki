/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: { colors: { brand: { DEFAULT: '#FF2D55', dark: '#E0264A' } } } },
  plugins: [],
};
