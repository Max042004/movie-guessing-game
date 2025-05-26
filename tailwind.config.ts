/* tailwind.config.ts */
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {},          // 在這裡自訂顏色或字體
  },
  plugins: [],          // 有需用到 forms/typography 再加
};

export default config;
