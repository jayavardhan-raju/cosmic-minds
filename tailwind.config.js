/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        body: ['"Space Grotesk"', 'sans-serif'],
      },
      colors: {
        neon: {
          cyan: '#00f3ff',
          magenta: '#ff00ff',
          violet: '#8a2be2',
          lime: '#39ff14',
          amber: '#ffb300',
        },
        cosmic: {
          dark: '#0f172a',
          deep: '#020617',
        }
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'lip-sync': 'lipSync 0.13s ease-in-out infinite alternate',
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pngtuber-bounce': 'pngtuberBounce 0.2s ease-in-out infinite alternate',
      },
      keyframes: {
        pngtuberBounce: {
          '0%': { transform: 'scaleY(0.95) scaleX(1.05) translateY(5px)' },
          '100%': { transform: 'scaleY(1.05) scaleX(0.95) translateY(-5px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        lipSync: {
          '0%': { transform: 'scaleY(0.2)' },
          '100%': { transform: 'scaleY(1.8)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 10px rgba(0, 243, 255, 0.5)' },
          '50%': { opacity: '0.5', boxShadow: '0 0 20px rgba(0, 243, 255, 0.8)' },
        }
      }
    },
  },
  plugins: [],
}
