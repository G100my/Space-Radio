// eslint-disable-next-line no-undef
module.exports = {
  mode: 'jit',
  purge: ['src/index.css', './src/**/*.{js,jsx,ts,tsx,vue}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      screen: {
        '3xl': '1920px',
      },
      colors: {
        primary: '#FF66D8',
        secondary: '#1ED760',
        tertiary: {
          dark: '#081B50',
          light: '#374F95',
        },
        natural: {
          accent: '#F8FAFC',
          disaccent: '#EBF0F3',
          disable: '#9595A8',
        },
        spotify: '#1DB954',
      },
      fontSize: {
        header: ['2.5rem', { letterSpacing: '-0.02rem', lineHeight: 0.92 }],
        subtitle: ['1.5rem'],
        body: ['1rem', { lineHeight: 1.4 }],
        small: ['0.875rem', { letterSpacing: '-0.03rem' }],
      },
    },
  },
  variants: {
    extend: {
      backgroundColor: ['active'],
      textColor: ['active'],
      borderColor: ['active'],
    },
  },
  plugins: [],
}
