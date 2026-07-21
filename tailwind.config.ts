import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.{js,ts}',
    './app.vue'
  ],
  theme: {
    extend: {
      colors: {
        // Ink — near-black, used for headline type & primary CTAs
        ink: {
          DEFAULT: '#0B0C0E',
          soft: '#1C1E22'
        },
        // Sand — warm off-white background family
        sand: {
          DEFAULT: '#FBFAF6',
          100: '#F6F4EE',
          200: '#F0EEE6',
          300: '#E7E4D9'
        },
        // Emerald — the clinic's signature accent (deep + bright pair)
        emerald: {
          deep: '#0F5C43',
          DEFAULT: '#17A874',
          bright: '#3EE8A8',
          mist: '#E4F7EE'
        },
        muted: {
          DEFAULT: '#6B6F76',
          light: '#9A9DA3'
        }
      },
      fontFamily: {
        display: ['Peyda', 'Vazirmatn', 'sans-serif'],
        body: ['Vazirmatn', 'Peyda', 'sans-serif']
      },
      fontSize: {
        'display-xl': ['clamp(3rem, 7vw, 7rem)', { lineHeight: '0.98', letterSpacing: '-0.02em' }],
        'display-lg': ['clamp(2.25rem, 4.5vw, 4rem)', { lineHeight: '1.04', letterSpacing: '-0.01em' }],
        'display-md': ['clamp(1.75rem, 3vw, 2.75rem)', { lineHeight: '1.1' }]
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.75rem'
      },
      boxShadow: {
        soft: '0 8px 30px -8px rgba(11,12,14,0.10)',
        floaty: '0 24px 60px -16px rgba(11,12,14,0.22)',
        glass: 'inset 0 1px 0 0 rgba(255,255,255,0.4), 0 20px 45px -18px rgba(11,12,14,0.28)'
      },
      backdropBlur: {
        xs: '2px'
      },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translateY(0px) rotate(var(--tilt, 0deg))' },
          '50%': { transform: 'translateY(-14px) rotate(var(--tilt, 0deg))' }
        },
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(1.4)' }
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' }
        }
      },
      animation: {
        floaty: 'floaty 6s ease-in-out infinite',
        'floaty-slow': 'floaty 9s ease-in-out infinite',
        pulseDot: 'pulseDot 2s ease-in-out infinite',
        marquee: 'marquee 28s linear infinite'
      },
      container: {
        center: true,
        padding: { DEFAULT: '1.25rem', lg: '2rem' }
      }
    }
  },
  plugins: []
}