/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        forest: {
          950: '#09090b', // zinc-950 (nearly black, professional dark)
          900: '#18181b', // zinc-900
          800: '#27272a', // zinc-800
          700: '#3f3f46', // zinc-700
          600: '#52525b', // zinc-600
        },
        lime: {
          400: '#a3e635',
          300: '#bef264',
          500: '#84cc16',
        },
        amber: {
          400: '#f59e0b',
          300: '#fcd34d',
          500: '#d97706',
        },
        glass: 'rgba(24, 24, 27, 0.5)',
      },
      fontFamily: {
        nunito: ['Nunito', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      animation: {
        'xp-fill': 'xpFill 1.2s ease-out forwards',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'badge-pop': 'badgePop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'confetti-fall': 'confettiFall 3s ease-in forwards',
        'countdown': 'countdown 30s linear forwards',
        'shimmer': 'shimmer 1.5s infinite',
        'level-up': 'levelUp 0.6s ease-out',
      },
      keyframes: {
        xpFill: {
          '0%': { width: '0%' },
          '100%': { width: 'var(--xp-width)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 10px #a3e63550, 0 0 20px #a3e63530' },
          '50%': { boxShadow: '0 0 20px #a3e63580, 0 0 40px #a3e63550' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        badgePop: {
          '0%': { transform: 'scale(0) rotate(-10deg)', opacity: '0' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        levelUp: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '60%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        countdown: {
          '0%': { width: '100%' },
          '100%': { width: '0%' },
        },
      },
      backgroundImage: {
        'forest-gradient': 'linear-gradient(135deg, #09090b 0%, #18181b 50%, #27272a 100%)',
        'glow-lime': 'radial-gradient(circle at center, #a3e63520 0%, transparent 70%)',
        'shimmer-gradient': 'linear-gradient(90deg, transparent 0%, rgba(163,230,53,0.1) 50%, transparent 100%)',
      },
    },
  },
  plugins: [],
};
