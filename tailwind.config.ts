import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          royal: "#1D3AAE",
          royalDark: "#152a80",
          sky: "#A8CBEE",
          skyLight: "#dceafd",
          yellow: "#F4C716",
          yellowHover: "#d9ae0c",
          navy: "#0A1338",
          navyLight: "#13235d",
          iceBg: "#F2F7FD",
          goldText: "#e0b000",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Impact", "sans-serif"],
        sakana: ["Sakana", "sans-serif"],
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(29, 58, 174, 0.15)",
        glow: "0 0 25px rgba(244, 199, 22, 0.4)",
        card: "0 10px 30px -5px rgba(10, 19, 56, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
