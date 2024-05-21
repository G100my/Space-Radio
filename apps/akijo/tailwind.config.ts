import type { Config } from 'tailwindcss'
import Preset from 'shared/tailwind.preset'
import form from '@tailwindcss/forms'
export default {
  content: ['./src/**/*.{vue,ts}'],
  presets: [Preset],
  plugins: [form],
} satisfies Config
