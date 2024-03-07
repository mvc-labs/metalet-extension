const animate = require('tailwindcss-animate')
const headlessui = require('@headlessui/tailwindcss')
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
        'black-secondary': '#303133',
        'gray-primary': '#909399',
        'gray-soft': '#EDEFF2',
        'gray-secondary': '#F5F7F9',
        'gray-light': '#F5F7FA',
        'primary-teal': '#72F5F6',
        'blue-primary': '#171AFF',
        'blue-light': '#F3F3FF',
        'btn-blue': '#1E2BFF',
        'orange-primary': '#FF8F1F',
        'slate-light': '#606266',
      },
      fontSize: {
        ss: ['0.8125rem', '1.125rem'],
      },
      borderRadius: {
        inherit: 'inherit',
      },
      spacing: {
        90: '22.5rem',
        150: '37.5rem',
      },
      backgroundImage: {
        'tab-selected': 'linear-gradient(270deg, #171AFF -1%, #72F5F6 99%)',
      },
      width: {
        15: '3.75rem',
      },
      height: {
        15: '3.75rem',
        18: '4.5rem',
      },
      lineHeight: {
        15: '3.75rem',
      },
      padding:{

      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
        'collapsible-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-collapsible-content-height)' },
        },
        'collapsible-up': {
          from: { height: 'var(--radix-collapsible-content-height)' },
          to: { height: 0 },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'collapsible-down': 'collapsible-down 0.2s ease-in-out',
        'collapsible-up': 'collapsible-up 0.2s ease-in-out',
      },
    },
  },
  plugins: [animate, headlessui],
}
