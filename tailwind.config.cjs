/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './popup.html', './src/**/*.{vue,js,ts}'],
  theme: {
    extend: {
      colors: {
        'primary-teal': '#72F5F6',
        'primary-blue': '#171AFF',
        'btn-blue': '#1E2BFF',
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
