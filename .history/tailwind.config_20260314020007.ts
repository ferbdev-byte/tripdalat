import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/hooks/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#F8F9FA',
        primary: '#6B8E23',
        secondary: '#D8BFD8',
        accent: '#FFB6C1',
        text: '#4F4F4F',
        'pine-green': '#1F5F4A',
        'mist-gray': '#C6CDD2',
        'hydrangea-blue': '#6FA8DC',
      },
      borderRadius: {
        soft: '1rem',
        dreamy: '2rem',
        xl: '1rem',
        '2xl': '2rem',
      },
      boxShadow: {
        soft: '0 12px 40px rgba(107, 142, 35, 0.12)',
      },
    },
  },
  plugins: [],
};

export default config;
