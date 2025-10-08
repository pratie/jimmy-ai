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
      colors: {
        // Brand Palette (Landing page)
        // Derived from provided screenshots
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
        // Sauce AI Inspired - Mint Grid Theme
        'sauce-mint': '#d4f4f4',         // Light mint background
        'sauce-cyan': '#b8e6e6',         // Cyan grid lines
        'sauce-purple': '#9333ea',       // Primary purple (buttons)
        'sauce-purple-dark': '#7c3aed',  // Darker purple hover
        'sauce-purple-light': '#a855f7', // Lighter purple
        'sauce-black': '#0a0a0a',        // Bold text
        'sauce-gray': '#525252',         // Secondary text
        'sauce-grid': '#c5e8e8',         // Grid lines

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

        // Legacy colors (keeping for compatibility)
        cream: '#FFFAEB',
        'notebook-yellow': '#FFFAEB',
        'sketch-red': '#D63031',
        'line-blue': '#B8D4E8',
        gravel: '#4E4E4E',
        iridium: '#3F3F3F',
        orange: '#FFA947',
        peach: '#FFE0BD',
        platinum: '#E6E6E6',
        ghost: '#CDCDCD',
        grandis: '#FFC989',
        porcelain: '#F1F1F1',
        ironside: '#636363',

        // Shadcn theme colors
        border: 'hsl(var(--border))',
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
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
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
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'caret-blink': 'caret-blink 1.25s ease-out infinite',
        'open-sidebar': 'open-sidebar 0.2s ease-out',
        'close-sidebar': 'close-sidebar 0.2s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config

export default config
