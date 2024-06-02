import type { Config } from 'tailwindcss'
import preset from 'shared/tailwind.preset'

export default {
  content: ['./src/**/*.{vue,ts}', './src/index.css'],
  presets: [preset],
} satisfies Config
