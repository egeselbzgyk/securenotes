/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "background-dark": "#111821",
        "border-dark": "#1f2937",
        "card-dark": "#1c2430",
        "input-dark": "#232a34",
        primary: "#3b82f6", // Blue 500
        "primary-hover": "#2563eb", // Blue 600
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
