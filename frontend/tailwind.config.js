// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Add these keyframes for your custom animations
      keyframes: {
        'heartbeat-effect': {
          '0%, 100%': { transform: 'scale(1)' },
          '10%': { transform: 'scale(1.05)' },
          '30%': { transform: 'scale(1.2)' },
          '50%': { transform: 'scale(0.95)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'spin-slow': {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(360deg)' },
        },
      },
      // Now, connect those keyframes to animation utilities
      animation: {
        'heartbeat-effect': 'heartbeat-effect 2.5s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'spin-slow': 'spin-slow 25s linear infinite',
      },
    },
  },
  plugins: [],
};