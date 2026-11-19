import type { Config } from 'tailwindcss';
import { lvTransportTailwindPreset } from '@lvtransport/config';

export default {
  content: [
    './index.html', './src/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}',
    '../admin/src/app/BookingOperations.tsx',
    '../admin/src/modules/auth/components/GoogleLoginBoundary.tsx',
    '../driver/src/app/DriverOperations.tsx',
    '../driver/src/modules/auth/components/GoogleLoginBoundary.tsx',
  ],
  presets: [lvTransportTailwindPreset],
  theme: {
    extend: {}
  },
  plugins: []
} satisfies Config;
