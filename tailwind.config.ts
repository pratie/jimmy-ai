import type { Config } from 'tailwindcss'

const config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      width: {
        container: '1400px',
      },
      colors: {
        // Neobrutalism Colors (from ronit.io)
        main: '#76fbd9',              // Turquoise accent
        mainAccent: '#76fbd9',
        overlay: 'rgba(0,0,0,0.8)',

        // Light mode
        bg: '#ffffff',
        text: '#000',

        // Dark mode
        darkBg: '#212121',
        darkText: '#eeefe9',
        darkBorder: '#000',
        secondaryBlack: '#212121',

        // Brand Palette (Landing page) - Keep for backward compatibility
        'brand-primary': '#0f172a',   // Dark navy for primary actions
        'brand-secondary': '#f6f4ef', // Soft off-white for surfaces
        'brand-accent': '#d97a5b',    // Accent highlight (salmon/coral)
        'brand-info': '#5b50e6',      // Info purple
        'brand-success': '#22c55e',   // Success green
        'brand-warning': '#e24d4d',   // Warning (tomato red)
        'brand-error': '#b91c1c',     // Error red (darker)
        'brand-yellow': '#f59e0b',    // Amber accent for highlights
        'brand-base-100': '#faf8f3',  // Lightest base
        'brand-base-200': '#f3f0e8',  // Medium base
        'brand-base-300': '#e7e2d6',  // Darkest base
        // Map legacy "sauce-*" tokens to landing brand palette
        // This keeps existing classnames working while unifying colors app-wide
        'sauce-mint': '#f6f4ef',          // -> brand-secondary
        'sauce-cyan': '#e7e2d6',          // -> brand-base-300 (borders)
        'sauce-purple': '#d97a5b',        // -> brand-accent (coral)
        'sauce-purple-dark': '#d97a5b',   // -> brand-accent (fallback)
        'sauce-purple-light': '#d97a5b',  // -> brand-accent (fallback)
        'sauce-black': '#0f172a',         // -> brand-primary (text)
        'sauce-gray': '#0f172a',          // -> brand-primary (secondary text)
        'sauce-grid': '#e7e2d6',          // -> brand-base-300 (grid lines)

        // Accent colors from logos
        'accent-red': '#ef4444',         // incident.io red
        'accent-yellow': '#fbbf24',      // whatnot yellow
        'accent-green': '#10b981',       // linktree green

        // Pastel Palette - Subtle Hues Theme (keeping for compatibility)
        'pastel-lavender': '#eae4e9',
        'pastel-cream': '#fff1e6',
        'pastel-blush': '#fde2e4',
        'pastel-pink': '#fad2e1',
        'pastel-mint': '#e2ece9',
        'pastel-sky': '#dfe7fd',
        'pastel-periwinkle': '#cddafd',

        // Darker shades for text/contrast
        'text-primary': '#0a0a0a',       // Bold black
        'text-secondary': '#525252',     // Medium gray
        'text-muted': '#737373',         // Light gray

        // Interactive states
        'interactive-pink': '#f7a6c4',
        'interactive-blue': '#a7c7e7',
        'interactive-mint': '#b8ddd3',

        // Legacy colors (remapped to landing palette for consistency)
        cream: '#faf8f3',                 // -> brand-base-100
        'notebook-yellow': '#faf8f3',     // -> brand-base-100
        'sketch-red': '#e24d4d',          // -> brand-warning
        'line-blue': '#e7e2d6',           // -> brand-base-300
        gravel: '#0f172a',                // -> brand-primary
        iridium: '#0f172a',               // -> brand-primary
        orange: '#d97a5b',                // -> brand-accent
        peach: '#f6f4ef',                 // -> brand-secondary
        platinum: '#e7e2d6',              // -> brand-base-300
        ghost: '#e7e2d6',                 // -> brand-base-300
        grandis: '#d97a5b',               // -> brand-accent
        porcelain: '#f3f0e8',             // -> brand-base-200
        ironside: '#0f172a',              // -> brand-primary

        // Shadcn theme colors (hybrid with Neobrutalism)
        border: '#000',  // Neobrutalism uses solid black borders
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        base: '5px',  // Neobrutalism border radius
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        light: '4px 4px 0px 0px #000',
        dark: '4px 4px 0px 0px #000',
        shadow: '4px 4px 0px 0px #000',  // Neobrutalism shadow
      },
      translate: {
        boxShadowX: '4px',
        boxShadowY: '4px',
        reverseBoxShadowX: '-4px',
        reverseBoxShadowY: '-4px',
      },
      fontWeight: {
        base: '500',
        heading: '700',
      },
      fontFamily: {
        sans: ['var(--font-space-grotesk)', 'Space Grotesk', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'caret-blink': {
          '0%,70%,100%': { opacity: '1' },
          '20%,50%': { opacity: '0' },
        },
        'open-sidebar': {
          from: { width: '60px' },
          to: { width: '300px' },
        },
        'close-sidebar': {
          from: { width: '300px' },
          to: { width: '60px' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        marquee2: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0%)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'caret-blink': 'caret-blink 1.25s ease-out infinite',
        'open-sidebar': 'open-sidebar 0.2s ease-out',
        'close-sidebar': 'close-sidebar 0.2s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        marquee: 'marquee 15s linear infinite',
        marquee2: 'marquee2 15s linear infinite',
      },
      screens: {
        w900: { raw: '(max-width: 900px)' },
        w500: { raw: '(max-width: 500px)' },
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
} satisfies Config

export default config
