const defaultTheme = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './popup.html', './src/**/*.{vue,js,ts}'],
  theme: {
    screens: {
      xs: '380px',
      ...defaultTheme.screens,
    },

    extend: {
      colors: {
        'black-primary': '#141416',
        'gray-primary': '#909399',
        'gray-soft': '#EDEFF2',
        'base-black': '#141416',
        'blue-light': '#F3F3FF',
        'primary-teal': '#72F5F6',
        'primary-blue': '#171AFF',
        'btn-blue': '#1E2BFF',
        'gray-light': '#F5F7FA',
      },
      borderRadius: {
        inherit: 'inherit',
      },
      spacing: {
        90: '22.5rem',
        150: '37.5rem',
      },
    },
  },
  plugins: [require('@headlessui/tailwindcss')],
}
