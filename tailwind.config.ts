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
        // Refined SMB-friendly palette
        main: '#1da1f2',              // Primary brand blue
        mainAccent: '#0f8ad8',
        overlay: 'rgba(15,23,42,0.8)',

        // Light mode surfaces
        bg: '#f4f6fb',
        text: '#0f172a',

        // Dark mode surfaces
        darkBg: '#050914',
        darkText: '#e2e8f0',
        darkBorder: '#1e293b',
        secondaryBlack: '#0f172a',

        // Brand Palette (Landing page)
        'brand-primary': '#0f172a',
        'brand-secondary': '#e0e7ff',
        'brand-accent': '#1da1f2',
        'brand-info': '#6366f1',
        'brand-success': '#22c55e',
        'brand-warning': '#f97316',
        'brand-error': '#ef4444',
        'brand-yellow': '#fbbf24',
        'brand-base-100': '#f8fafc',
        'brand-base-200': '#eef2ff',
        'brand-base-300': '#e2e8f0',

        // Legacy "sauce-*" tokens mapped to calm hues
        'sauce-mint': '#e0e7ff',
        'sauce-cyan': '#dbeafe',
        'sauce-purple': '#6366f1',
        'sauce-purple-dark': '#4f46e5',
        'sauce-purple-light': '#818cf8',
        'sauce-black': '#0f172a',
        'sauce-gray': '#1f2937',
        'sauce-grid': '#e2e8f0',

        // Accent colors from logos
        'accent-red': '#ef4444',
        'accent-yellow': '#fbbf24',
        'accent-green': '#10b981',

        // Pastel Palette - retained for compatibility
        'pastel-lavender': '#ede9fe',
        'pastel-cream': '#fff4e6',
        'pastel-blush': '#ffe4e6',
        'pastel-pink': '#fed7e2',
        'pastel-mint': '#dcfce7',
        'pastel-sky': '#dbeafe',
        'pastel-periwinkle': '#e0e7ff',

        // Text shades
        'text-primary': '#0f172a',
        'text-secondary': '#475569',
        'text-muted': '#94a3b8',

        // Interactive states
        'interactive-pink': '#f8bbd0',
        'interactive-blue': '#bfdbfe',
        'interactive-mint': '#bbf7d0',

        // Legacy aliases
        cream: '#f8fafc',
        'notebook-yellow': '#fefce8',
        'sketch-red': '#ef4444',
        'line-blue': '#e2e8f0',
        gravel: '#0f172a',
        iridium: '#0f172a',
        orange: '#f97316',
        peach: '#ffe4e6',
        platinum: '#e2e8f0',
        ghost: '#e2e8f0',
        grandis: '#fcd34d',
        porcelain: '#e0e7ff',
        ironside: '#1f2937',

        // Shadcn theme colors (aligned with new system)
        border: '#e2e8f0',
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
        base: '12px',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        light: '0 15px 35px rgba(15,23,42,0.12)',
        dark: '0 25px 50px rgba(2,6,23,0.5)',
        shadow: '0 20px 45px rgba(15,23,42,0.12)',
      },
      translate: {
        boxShadowX: '0px',
        boxShadowY: '-2px',
        reverseBoxShadowX: '0px',
        reverseBoxShadowY: '2px',
      },
      fontWeight: {
        base: '500',
        heading: '700',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        heading: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
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
        xs: '480px',
        w900: { raw: '(max-width: 900px)' },
        w500: { raw: '(max-width: 500px)' },
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
} satisfies Config

export default config
