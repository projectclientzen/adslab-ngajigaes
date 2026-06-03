import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        base: '#090910',
        surface: '#10101A',
        card: '#15151F',
        border: '#1E1E2E',
        'border-light': '#2A2A3D',
        primary: '#6366F1',
        'primary-dim': '#6366F120',
        success: '#22C55E',
        'success-dim': '#22C55E18',
        warning: '#F59E0B',
        'warning-dim': '#F59E0B18',
        danger: '#EF4444',
        'danger-dim': '#EF444418',
        'text-primary': '#F1F5F9',
        'text-secondary': '#8B8FA8',
        'text-muted': '#4B4F6A',
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Syne', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-down': 'slideDown 0.25s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
