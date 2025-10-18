/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        // RhymeTime AI child-friendly color palette
        primary: {
          orange: '#FF6B35',
          cyan: '#4ECDC4',
        },
        secondary: {
          yellow: '#FFE66D',
          purple: '#A8E6CF',
        },
        // Additional child-friendly colors
        child: {
          pink: '#FFB6C1',
          blue: '#87CEEB',
          green: '#98FB98',
          lavender: '#E6E6FA',
        }
      },
      fontFamily: {
        // Child-friendly rounded fonts
        'child': ['Comic Sans MS', 'cursive', 'system-ui'],
      },
      borderRadius: {
        'child': '1.5rem', // Extra rounded for child-friendly design
      },
      animation: {
        'bounce-gentle': 'bounce 2s infinite',
        'pulse-soft': 'pulse 3s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        }
      }
    },
  },
  plugins: [],
};
