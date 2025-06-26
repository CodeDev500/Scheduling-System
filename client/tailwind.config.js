/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "node_modules/flowbite-react/lib/esm/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        main: "#2563eb",
        main_hover: "#0c47c9",
        yellow: "#de8f2f",
        yellow_hover: "#c77b1e",
      },
    },
  },

  plugins: [require("flowbite/plugin")],
};
