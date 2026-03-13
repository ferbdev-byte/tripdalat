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
    },
  },
  plugins: [],
};

export default config;
