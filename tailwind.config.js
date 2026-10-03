/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta estrita da Nova Era: vermelho, preto, branco (+ tons neutros de preto)
        brand: {
          DEFAULT: '#F40D0D',
          dark: '#B80808',
        },
        paper: '#F3F3F3',
        ink: {
          DEFAULT: '#000000',
          soft: '#111111',
          line: '#262626',
        },
      },
      fontFamily: {
        display: ['"Alfa Slab One"', 'Rockwell', 'Georgia', 'serif'],
        logo: ['Montserrat', 'Poppins', 'system-ui', 'sans-serif'],
        sans: ['Archivo', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      keyframes: {
        progress: {
          from: { transform: 'scaleX(0)' },
          to: { transform: 'scaleX(1)' },
        },
        pop: {
          from: { opacity: '0', transform: 'translateY(16px) scale(.98)' },
          to: { opacity: '1', transform: 'none' },
        },
        fade: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        splashLogo: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        pop: 'pop .28s ease-out both',
        fade: 'fade .2s ease-out both',
        'splash-logo': 'splashLogo 1.2s cubic-bezier(.2,.7,.2,1) both',
      },
    },
  },
  plugins: [],
};
