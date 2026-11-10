/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    '/home/fallingstar10/shire/himm/index.html',
    '/home/fallingstar10/shire/himm/assets/js/**/*.js',
  ],
  theme: {
    extend: {
      screens: { sm: '640px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1536px' },
    },
  },
  corePlugins: {
    preflight: true,
  },
  plugins: [],
};
