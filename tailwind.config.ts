import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/app/**/*.{ts,tsx}', './src/components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          500: '#ff5a0a',
          600: '#ea4b00',
          700: '#c93b00',
        },
        route: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#0b86ff',
          600: '#0670df',
          700: '#075bbb',
        },
        asphalt: {
          900: '#111827',
          950: '#0b1220',
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
