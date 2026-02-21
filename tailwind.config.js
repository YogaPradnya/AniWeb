/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: "#ffffff",
          dark: "#212121",
        },
        sidebar: {
          dark: "#262626",
        },
        rightside: {
          dark: "#1B1B1B",
        },
        card: {
          light: "#ffffff",
          dark: "#1c1f2a",
        },
        accent: "#9933FF",
        "accent-purple": "#a259ff",
      },
      backgroundImage: {
        'accent-gradient': 'linear-gradient(135deg, #9933FF 0%, #B266FF 100%)',
      },
      boxShadow: {
        'hd': '0 20px 50px rgba(0, 0, 0, 0.3)',
        'hd-light': '0 10px 30px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
};
