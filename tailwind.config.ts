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
        primary: '#F97316',
        foundation: '#0A0A0A',
        accent: '#B91C1C',
        surface: '#27272A',
        muted: '#71717A',
        textWhite: '#FAFAFA',
      },
      minHeight: {
        'touch': '48px',
      },
      minWidth: {
        'touch': '48px',
      },
      fontSize: {
        'input': ['1.125rem', { lineHeight: '1.5' }],
      },
    },
  },
  plugins: [],
}
export default config
