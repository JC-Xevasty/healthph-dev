/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    screens: {
      'xs': '360px',
      'sm': '576px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1366px',
      '2xl': '1536px'
    },
    colors: {
      gray: {
        10: "#F7F9FC",
        50: "#E9EFF5",
        100: "#D5DDE5",
        200: "#BCC5CE",
        300: "#A1ACB8",
        400: "#8693A0",
        500: "#687582",
        600: "#5A6876",
        700: "#465360",
        800: "#333E4A",
        900: "#171E26",
      },
      primary: {
        // 50: "#E8F3FF",
        50: "#E9F4FB",
        100: "#B9DBFF",
        200: "#8BC3FF",
        300: "#5DAAFF",
        400: "#2E92FF",
        500: "#007AFF",
        600: "#0064D1",
        700: "#004EA2",
        800: "#003874",
        900: "#002246",
      },
      success: {
        50: "#EBFAEB",
        100: "#D7F4D8",
        200: "#AEEAB1",
        300: "#86DF89",
        400: "#5DD562",
        500: "#35CA3B",
        600: "#2AA22F",
        700: "#207923",
        800: "#155118",
        900: "#0B280C",
      },
      warning: {
        50: "#FBF7E9",
        100: "#F8F0D3",
        200: "#F1E1A7",
        300: "#E9D17C",
        400: "#E2C250",
        500: "#DBB324",
        600: "#AF8F1D",
        700: "#836B16",
        800: "#58480E",
        900: "#2C2407",
      },
      destructive: {
        50: "#FBE9E9",
        100: "#F7D4D4",
        200: "#EFA9A9",
        300: "#E87D7D",
        400: "#E05252",
        500: "#D82727",
        600: "#AD1F1F",
        700: "#821717",
        800: "#561010",
        900: "#2B0808",
      },
      white: "#FFF",
      black: "#000",
      transparent: "transparent",
    },
    boxShadow: {
      flat: "0px 1px 0px 0px #E4E4E7",
      in: "0px 2px 4px 0px #525252 inset", 
      xs: "0px 1px 2px 0px rgba(0, 0, 0, 0.05)",
      sm: "0px 1px 3px 0px rgba(0, 0, 0, 0.08)",
      base: "0px 2.5px 4px -1px rgba(0, 0, 0, 0.15)",
      lg: "0px 10px 15px -3px rgba(0, 0, 0, 0.10), 0px 4px 6px -2px rgba(0, 0, 0, 0.05)",
      xl: "0px 20px 25px -5px rgba(0, 0, 0, 0.10), 0px 10px 10px -5px rgba(0, 0, 0, 0.04)",
      "2xl": "0px 25px 50px -12px rgba(0, 0, 0, 0.25)",
    },
    extend: {
      fontFamily: {
        'inter': ['Inter', 'ui-sans-serif']
      }
    },
  },
  plugins: [],
};
