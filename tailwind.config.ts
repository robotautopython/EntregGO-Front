import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/app/**/*.{ts,tsx}', './src/components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff3eb',
          100: '#ffe1cc',
          200: '#ffc299',
          300: '#ffa166',
          400: '#ff7e33',
          500: '#ff5a0a',
          600: '#ea4b00',
          700: '#c93b00',
          800: '#a02f00',
          900: '#7a2400',
        },
        route: {
          50: '#e8f3ff',
          100: '#cce2ff',
          200: '#99c6ff',
          300: '#66a9ff',
          400: '#338cff',
          500: '#0b86ff',
          600: '#0670df',
          700: '#075bbb',
          800: '#054690',
          900: '#03366d',
        },
        signal: {
          50: '#fff9db',
          200: '#ffe88a',
          400: '#ffd21f',
          500: '#f5bf00',
          600: '#c79a00',
        },
        asphalt: {
          700: '#1c2638',
          800: '#141c2c',
          900: '#111827',
          950: '#0b1220',
        },
        paper: {
          DEFAULT: '#fffaf4',
          line: '#f1e7dc',
          deep: '#fbeedd',
        },
        success: {
          50: '#dcfce7',
          500: '#16a34a',
          700: '#15803d',
        },
        warn: {
          50: '#fef3c7',
          500: '#f59e0b',
          700: '#b45309',
        },
        danger: {
          50: '#fee2e2',
          500: '#dc2626',
          700: '#b91c1c',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif',
        ],
        display: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
        mono: [
          '"Space Grotesk"',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'monospace',
        ],
      },
      boxShadow: {
        card: '0 1px 2px rgba(11,18,32,0.04), 0 8px 24px rgba(11,18,32,0.06)',
        pop: '0 14px 40px rgba(255,90,10,0.22)',
        route: '0 14px 40px rgba(11,134,255,0.18)',
        ink: '0 14px 30px rgba(11,18,32,0.18)',
        inner1: 'inset 0 1px 0 rgba(255,255,255,0.12)',
      },
      borderRadius: {
        sm: '6px',
        md: '12px',
        lg: '20px',
        xl: '28px',
        '2xl': '36px',
      },
      transitionTimingFunction: {
        ride: 'cubic-bezier(.2,.8,.2,1)',
      },
      transitionDuration: {
        micro: '120ms',
        ui: '200ms',
        ride: '320ms',
        drama: '600ms',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'dash-move': {
          '0%': { strokeDashoffset: '0' },
          '100%': { strokeDashoffset: '-24' },
        },
        'pulse-soft': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.04)', opacity: '0.85' },
        },
        'bob': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 320ms cubic-bezier(.2,.8,.2,1) both',
        'slide-in-left': 'slide-in-left 320ms cubic-bezier(.2,.8,.2,1) both',
        'dash-move': 'dash-move 1.2s linear infinite',
        'pulse-soft': 'pulse-soft 2.4s cubic-bezier(.4,0,.6,1) infinite',
        'bob': 'bob 3.6s cubic-bezier(.4,0,.6,1) infinite',
        'shimmer': 'shimmer 2.2s linear infinite',
      },
      backgroundImage: {
        'grid-paper':
          'radial-gradient(circle at 1px 1px, rgba(11,18,32,0.06) 1px, transparent 0)',
        'orange-radial':
          'radial-gradient(circle at 80% 0%, rgba(255,90,10,0.18), transparent 60%)',
        'route-radial':
          'radial-gradient(circle at 0% 100%, rgba(11,134,255,0.18), transparent 55%)',
      },
      backgroundSize: {
        'grid-paper': '24px 24px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
