import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        pine: '#869484',
        mist: '#E5E7E9',
        rose: '#D4A5A5',
      },
      borderRadius: {
        dalat: '2rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        mist: {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.06)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 700ms ease-out both',
        float: 'float 6s ease-in-out infinite',
        mist: 'mist 8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
