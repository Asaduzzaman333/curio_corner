/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui"]
      },
      colors: {
        ink: "#17120f",
        panel: "#221915",
        paper: "#F8EFE3",
        vellum: "#FFF9F0",
        clay: "#B66D4E",
        rosewood: "#8B3F4C",
        sage: "#64785D",
        gold: "#C89D4E"
      },
      boxShadow: {
        glow: "0 24px 80px rgba(0, 0, 0, 0.28)"
      }
    }
  },
  plugins: []
};
