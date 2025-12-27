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
          dark: "#0b0c11",
        },
        secondary: {
          light: "#f3f4f6",
          dark: "#14161e",
        },
        card: {
          light: "#ffffff",
          dark: "#1c1f2a",
        },
        accent: "#5e5ce6",
        "accent-purple": "#a259ff",
      },
      backgroundImage: {
        'accent-gradient': 'linear-gradient(135deg, #5e5ce6 0%, #a259ff 100%)',
      },
      boxShadow: {
        'hd': '0 20px 50px rgba(0, 0, 0, 0.3)',
        'hd-light': '0 10px 30px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
};
