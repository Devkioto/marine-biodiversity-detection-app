/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ocean: "#0EA5E9",
        reef: "#14B8A6",
        abyss: "#0F172A",
        lagoon: "#06B6D4",
        coral: "#F97316",
      },
      boxShadow: {
        glow: "0 24px 70px rgba(14, 165, 233, 0.25)",
      },
    },
  },
  plugins: [],
};
