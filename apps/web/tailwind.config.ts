import type { Config } from 'tailwindcss';
import { lvTransportTailwindPreset } from '@lvtransport/config';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
  presets: [lvTransportTailwindPreset],
  theme: {
    extend: {}
  },
  plugins: []
} satisfies Config;
