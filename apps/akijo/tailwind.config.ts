import type { Config } from 'tailwindcss'
import Preset from 'shared/tailwind.preset'
import form from '@tailwindcss/forms'
export default {
  content: ['./src/**/*.{vue,ts}'],
  presets: [Preset],
  plugins: [form],
  extend: {
    colors: () => ({
      design: {
        dark: '#231815',
        light: '#E8E3D0',
        red: '#ff4c14',
        orange: '#E45A24',
        green: '#54c61e',
        lightgray: '#919191',
      },
    }),
  },
} satisfies Config
