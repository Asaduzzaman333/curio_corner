/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui"]
      },
      colors: {
        paper: "#F8EFE3",
        vellum: "#FFF9F0",
        ink: "#30261F",
        clay: "#B66D4E",
        rosewood: "#8B3F4C",
        sage: "#64785D",
        gold: "#C89D4E"
      },
      boxShadow: {
        soft: "0 24px 70px rgba(71, 44, 32, 0.14)",
        lift: "0 18px 50px rgba(48, 38, 31, 0.18)"
      }
    }
  },
  plugins: []
};
