import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    keyframes: {
        'border-spin': {
          '100%': { transform: 'rotate(360deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 10px #f59e0b, 0 0 20px #f59e0b' },
          '50%': { boxShadow: '0 0 20px #f59e0b, 0 0 40px #f59e0b' },
        },
      },
      animation: {
        'border-spin': 'border-spin 4s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
  },
  plugins: [],
};
export default config;
