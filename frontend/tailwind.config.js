/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'bg-blue-500', 'border-blue-700', 'bg-blue-100', 'text-blue-600',
    'bg-orange-500', 'border-orange-700', 'bg-orange-100', 'text-orange-600',
    'bg-red-500', 'border-red-700', 'bg-red-100', 'text-red-600',
    'bg-teal-500', 'border-teal-700', 'bg-teal-100', 'text-teal-600',
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))", input: "hsl(var(--input))", ring: "hsl(var(--ring))",
        background: "hsl(var(--background))", foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
      },
      borderRadius: {
        lg: "var(--radius)", md: "calc(var(--radius) - 2px)", sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)',
        'accent-gradient': 'linear-gradient(90deg, hsl(var(--accent)) 0%, hsl(var(--primary)) 100%)',
        'card-gradient': 'radial-gradient(at top left, hsl(var(--card)), transparent)',
        'background-gradient': 'radial-gradient(circle at top, hsl(var(--background)), hsl(var(--muted)))',
      },
      boxShadow: {
        'card': '0 4px 15px hsla(var(--shadow-color), 0.05)',
        'glow': '0 0 20px hsla(var(--primary), 0.3)',
        'hero': '0 10px 30px hsla(var(--primary), 0.4)',
      },
      keyframes: {
        // Your original keyframes
        'heartbeat-effect': { '0%, 100%': { transform: 'scale(1)' }, '10%': { transform: 'scale(1.05)' }, '30%': { transform: 'scale(1.2)' }, '50%': { transform: 'scale(0.95)' } },
        'fade-in-up': { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'spin-slow': { 'from': { transform: 'rotate(0deg)' }, 'to': { transform: 'rotate(360deg)' } },
        float: { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-20px)' } },
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'slide-up': { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        
        // ✅ UPDATED glow and ADDED new keyframes for hero
        glow: {
          '0%, 100%': { filter: 'drop-shadow(0 0 5px hsla(var(--primary), 0.5))' },
          '50%': { filter: 'drop-shadow(0 0 15px hsla(var(--primary), 0.8))' },
        },
        'glow-light': {
          '0%, 100%': { filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.8))' },
          '50%': { filter: 'drop-shadow(0 0 10px rgba(255,255,255,1))' },
        },
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
      },
      animation: {
        // Your original animations
        'heartbeat-effect': 'heartbeat-effect 2.5s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'spin-slow': 'spin-slow 25s linear infinite',
        float: 'float 4s ease-in-out infinite',
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'slide-up': 'slide-up 0.8s ease-out forwards',

        // ✅ ADDED new animations for hero
        blob: "blob 7s infinite",
        'glow-light': 'glow-light 3s ease-in-out infinite',
        glow: 'glow 3s ease-in-out infinite',
      },
      // ✅ ADDED custom animation delay utilities
      animationDelay: {
        2000: '2s',
        4000: '4s',
      }
    },
  },
  plugins: [],
};