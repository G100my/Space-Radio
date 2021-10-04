// eslint-disable-next-line no-undef
module.exports = {
  mode: 'jit',
  purge: ['src/index.css', './src/**/*.vue'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    fontFamily: {
      inter: ['Inter', 'sans-serif'],
    },
    screens: {
      mobile: '576px',
      laptop: '1024px',
      xs: '425px',
      // below from tailwind css default
      sm: '640px',
      // => @media (min-width: 640px) { ... }
      md: '768px',
      // => @media (min-width: 768px) { ... }
      lg: '1024px',
      // => @media (min-width: 1024px) { ... }
      xl: '1280px',
      // => @media (min-width: 1280px) { ... }
      '2xl': '1536px',
      // => @media (min-width: 1536px) { ... }
    },
    extend: {
      colors: {
        primary: '#FF66D8',
        secondary: '#1ED760',
        tertiary: {
          1: '#081B50',
          2: '#374F95',
        },
        natural: {
          white: '#FDFEFF',
          gray1: '#F8FAFC',
          gray2: '#EBF0F3',
          gray3: '#9595A8',
          gray4: '#F7F7F9',
          black: '#1D1D1E',
        },
        system: {
          error1: '#ED0303',
          error2: '#FFA39E',
          error3: '#FFF1F0',
          success3: '#D7FFE5',
          success2: '#45C172',
          success1: '#4DC477',
        },
      },
      fontSize: {
        header: ['2.5rem', { letterSpacing: '-0.02rem', lineHeight: 0.92 }], //40px
        subtitle: ['1.5rem'], // 24px
        body: ['1rem', { lineHeight: 1.4 }], // 16px
        small: ['0.875rem', { letterSpacing: '-0.03rem' }], // 14px
        0: '0rem',
      },
      width: {
        fit: 'fit-content',
      },
      height: {
        fit: 'fit-content',
      },
      zIndex: {
        '-1': '-1',
      },
      boxShadow: {
        10: '0 10px 20px 10px rgba(0, 0, 0, 0.1)',
        4: '0 4px 8px 4px rgba(0, 0, 0, 0.1)',
        '-4': 'inset 0 4px 4px 0 rgba(0, 0, 0, 0.25)',
        none: 'none',
      },
      gridTemplateColumns: {
        alert: 'fit-content auto',
      },
      borderRadius: {
        10: '10px',
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
