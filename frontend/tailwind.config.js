/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // --- ADD THIS SAFELIST BLOCK ---
  // This tells Tailwind to always generate CSS for these specific classes,
  // making them available for our dynamic React component.
  safelist: [
    'bg-blue-500', 'border-blue-700', 'bg-blue-100', 'text-blue-600',
    'bg-orange-500', 'border-orange-700', 'bg-orange-100', 'text-orange-600',
    'bg-red-500', 'border-red-700', 'bg-red-100', 'text-red-600',
    'bg-teal-500', 'border-teal-700', 'bg-teal-100', 'text-teal-600',
  ],
  theme: {
    extend: {
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
      animation: {
        'heartbeat-effect': 'heartbeat-effect 2.5s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'spin-slow': 'spin-slow 25s linear infinite',
      },
    },
  },
  plugins: [],
};
