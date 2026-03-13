import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/hooks/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'pine-green': '#1F5F4A',
        'mist-gray': '#C6CDD2',
        'hydrangea-blue': '#6FA8DC',
      },
    },
  },
  plugins: [],
};

export default config;
