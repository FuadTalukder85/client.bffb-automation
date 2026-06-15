export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  plugins: [],
  theme: {
    extend: {
      screens: {
        "3xl": "1910px",
        "lm": "380px",
        "mm": "375px",
      },
    },
  },
};