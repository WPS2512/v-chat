import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 主色调：深邃蓝黑（X 风格 + Telegram 蓝紫融合）
        primary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1', // 主色
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        // 中性色（深色模式专用）
        dark: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        // 在线状态色
        online: '#22c55e',
        away:   '#f59e0b',
        offline: '#6b7280',
      },
      fontFamily: {
        sans: ['"Inter"', '"SF Pro Display"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        'bubble': '20px',
        'bubble-sm': '14px',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'skeleton': 'skeleton 1.5s ease-in-out infinite',
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'typing': 'typing 1.4s ease-in-out infinite',
      },
      keyframes: {
        skeleton: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { transform: 'translateY(10px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        typing: {
          '0%, 60%, 100%': { transform: 'translateY(0)' },
          '30%': { transform: 'translateY(-4px)' },
        },
      },
      transitionTimingFunction: {
        'ios': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
      maxWidth: {
        'bubble': '75%',
      },
    },
  },
  plugins: [],
}

export default config
