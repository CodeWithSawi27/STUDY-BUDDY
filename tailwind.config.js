/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        /* =========================
           BRAND – Jacksons Purple
        ========================== */
        primary: {
          50: "#F2F3FF",
          100: "#E0E1F4",
          200: "#B8BBE8",
          300: "#8F94DC",
          400: "#5E63C7",
          500: "#1A1F95", // Base brand
          600: "#161A7D",
          700: "#121563",
          800: "#0D0F4A",
          900: "#080A30",
          DEFAULT: "#3D3B8E",
        },

        /* =========================
           BACKGROUND SYSTEM
        ========================== */
        background: {
          light: "hsl(0, 0%, 98%)", // HSL 0 0% 98%
          dark: "hsl(0, 0%, 9%)", // HSL 0 0% 9%
        },

        surface: {
          light: "hsl(0, 0%, 95%)", // HSL 0 0% 95%
          dark: "#262626",
        },

        card: {
          light: "#FFFFFF",
          dark: "#2E2E2E",
        },

        border: {
          light: "hsl(0, 0%, 90%)",
          dark: "#3A3A3A",
        },

        /* =========================
           TEXT SYSTEM
        ========================== */
        text: {
          primaryLight: "hsl(0, 0%, 9%)",
          secondaryLight: "#595959",
          mutedLight: "#8C8C8C",

          primaryDark: "#F2F2F2",
          secondaryDark: "#BFBFBF",
          mutedDark: "#8C8C8C",
        },

        /* =========================
           SEMANTIC COLORS
        ========================== */
        success: {
          light: "#D1FAE5",
          DEFAULT: "hsl(145, 63%, 36%)",
          dark: "hsl(148, 70%, 20%)", // HSL 148 70% 20%
        },

        warning: {
          light: "#FEF3C7",
          DEFAULT: "hsl(40, 96%, 50%)",
          dark: "hsl(33, 89%, 26%)", // HSL 33 89% 26%
        },

        error: {
          light: "hsl(0, 100%, 96%)",
          DEFAULT: "hsl(354, 70%, 45%)", // HSL 354 70% 45%
          dark: "hsl(355, 56%, 30%)", // HSL 355 56% 30%
        },

        info: {
          light: "#DBEAFE",
          DEFAULT: "hsl(217, 91%, 60%)",
          dark: "hsl(221, 83%, 30%)", // HSL 221 83% 30%
        },
      },
    },
  },
  plugins: [],
};
