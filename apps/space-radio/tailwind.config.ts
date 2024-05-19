import type { Config } from 'tailwindcss'
import preset from '../tailwind.preset'

export default {
  content: ['./src/**/*.{vue,ts}', './src/style/*.css'],
  presets: [preset],
} satisfies Config
