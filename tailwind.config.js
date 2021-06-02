// eslint-disable-next-line no-undef
module.exports = {
  mode: 'jit',
  purge: ['src/index.css', './src/**/*.vue'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    fontFamily: {
      inter: ['Inter', 'sans-serif'],
    },
    extend: {
      colors: {
        primary: '#FF66D8',
        secondary: '#1ED760',
        tertiary: {
          1: '#081B50',
          2: '#374F95',
          // will remove in future, use these in Doorscope wireframe page, create room wireframe pages
          dark: '#081B50',
          light: '#374F95',
        },
        natural: {
          white: '#FDFEFF',
          gray1: '#F8FAFC',
          gray2: '#EBF0F3',
          gray3: '#9595A8',
          black: '#1D1D1E',
        },
        // will remove in future
        spotify: '#1DB954',
      },
      fontSize: {
        header: ['2.5rem', { letterSpacing: '-0.02rem', lineHeight: 0.92 }], //40px
        subtitle: ['1.5rem'], // 24px
        body: ['1rem', { lineHeight: 1.4 }], // 16px
        small: ['0.875rem', { letterSpacing: '-0.03rem' }], // 14px
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
