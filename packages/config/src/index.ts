import type { Config } from 'tailwindcss';

export const lvTransportTheme = {
  colors: {
    lv: {
      black: '#0A0A0A',
      graphite: '#121212',
      charcoal: '#1A1A1A',
      gold: '#C9A227',
      champagne: '#E6C769',
      bronze: '#8E6B10',
      slate: '#2A2A2A',
      mist: '#A5A5A5'
    }
  },
  boxShadow: {
    'gold-sm': '0 2px 12px rgba(201, 162, 39, 0.2)',
    'gold-md': '0 6px 24px rgba(201, 162, 39, 0.24)',
    'gold-lg': '0 12px 34px rgba(201, 162, 39, 0.3)'
  },
  borderRadius: {
    xl: '0.875rem',
    '2xl': '1rem'
  },
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    display: ['Manrope', 'Inter', 'system-ui', 'sans-serif']
  },
  backgroundImage: {
    'lv-gold-gradient':
      'linear-gradient(135deg, rgba(201,162,39,0.2) 0%, rgba(230,199,105,0.12) 50%, rgba(201,162,39,0.02) 100%)'
  }
};

export const lvTransportTailwindPreset: Partial<Config> = {
  darkMode: 'class',
  theme: {
    extend: lvTransportTheme
  }
};

export const lvTypography = {
  display: 'text-3xl md:text-4xl font-display font-semibold tracking-tight',
  h1: 'text-2xl md:text-3xl font-display font-semibold tracking-tight',
  h2: 'text-xl md:text-2xl font-display font-semibold',
  h3: 'text-lg md:text-xl font-display font-semibold',
  bodyLg: 'text-base md:text-lg text-lv-mist',
  body: 'text-sm md:text-base text-lv-mist',
  caption: 'text-xs md:text-sm text-lv-mist/90'
};
