import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'lobster': ['Lobster', 'cursive'],
        'poppins': ['Poppins', 'sans-serif'],
      },
      colors: {
        'primary': '#e86a33',
        'secondary': '#f2b33d',
        'accent': '#7a3e16',
        'text-dark': '#312112',
        'text-light': '#f9f5f0',
      }
    },
  },
  plugins: [],
};
export default config;
