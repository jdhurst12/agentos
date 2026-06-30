import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        space: {
          50: '#e8e8f0',
          100: '#c5c5d8',
          200: '#9e9ec0',
          300: '#7777a8',
          400: '#5a5a96',
          500: '#3d3d84',
          600: '#2e2e6e',
          700: '#1e1e50',
          800: '#0f0f30',
          900: '#0a0a1f',
          950: '#06060f',
        },
        void: {
          DEFAULT: '#080810',
          dark: '#04040a',
        },
        neon: {
          violet: '#7c3aed',
          'violet-light': '#a855f7',
          cyan: '#06b6d4',
          'cyan-light': '#22d3ee',
          emerald: '#10b981',
          'emerald-light': '#34d399',
          pink: '#ec4899',
          amber: '#f59e0b',
        },
      },
      backgroundImage: {
        'grid-pattern': `linear-gradient(rgba(99, 102, 241, 0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(99, 102, 241, 0.05) 1px, transparent 1px)`,
        'glow-violet': 'radial-gradient(ellipse at center, rgba(124, 58, 237, 0.15) 0%, transparent 70%)',
        'glow-cyan': 'radial-gradient(ellipse at center, rgba(6, 182, 212, 0.15) 0%, transparent 70%)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'scan-line': 'scan-line 4s linear infinite',
        'count-up': 'count-up 1s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'fade-in-up': 'fade-in-up 0.5s ease-out',
        'spin-slow': 'spin 8s linear infinite',
        'grid-move': 'grid-move 20s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 5px currentColor' },
          '50%': { opacity: '0.5', boxShadow: '0 0 20px currentColor, 0 0 40px currentColor' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'fade-in-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'grid-move': {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '40px 40px' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow-violet': '0 0 20px rgba(124, 58, 237, 0.4), 0 0 40px rgba(124, 58, 237, 0.2)',
        'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.4), 0 0 40px rgba(6, 182, 212, 0.2)',
        'glow-emerald': '0 0 20px rgba(16, 185, 129, 0.4), 0 0 40px rgba(16, 185, 129, 0.2)',
        'glow-pink': '0 0 20px rgba(236, 72, 153, 0.4), 0 0 40px rgba(236, 72, 153, 0.2)',
        'panel': '0 4px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      },
    },
  },
  plugins: [],
}
export default config
