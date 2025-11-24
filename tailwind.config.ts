import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        layer: {
          0: 'hsl(var(--layer-00))',
          1: 'hsl(var(--layer-01))',
          2: 'hsl(var(--layer-02))',
          3: 'hsl(var(--layer-03))',
        },
        surface: {
          1: 'hsl(var(--surface-01))',
          2: 'hsl(var(--surface-02))',
          3: 'hsl(var(--surface-03))',
          highlight: 'hsl(var(--surface-highlight))',
        },
        accentTone: {
          1: 'hsl(var(--accent-01))',
          2: 'hsl(var(--accent-02))',
          3: 'hsl(var(--accent-03))',
        },
        positive: {
          DEFAULT: 'hsl(var(--positive))',
          strong: 'hsl(var(--positive-strong))',
        },
        negative: {
          DEFAULT: 'hsl(var(--negative))',
          strong: 'hsl(var(--negative-strong))',
        },
        textTone: {
          primary: 'hsl(var(--text-primary))',
          secondary: 'hsl(var(--text-secondary))',
          muted: 'hsl(var(--text-muted))',
        },
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
        bull: '#10B981',
        bear: '#EF4444',
        // Terminal-specific colors
        terminal: {
          bg: '#020617',
          surface: '#0B1121',
          border: 'rgba(255, 255, 255, 0.06)',
          text: {
            primary: '#FAFAFA',
            secondary: '#CBD5E1',
            tertiary: '#94A3B8',
          },
          orange: '#F97316',
          blue: '#3B82F6',
          cyan: '#06B6D4',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
      },
      spacing: {
        'space-1': 'var(--space-1)',
        'space-2': 'var(--space-2)',
        'space-3': 'var(--space-3)',
        'space-4': 'var(--space-4)',
        'space-6': 'var(--space-6)',
        'space-8': 'var(--space-8)',
        // Terminal density tokens (Bloomberg-style)
        'terminal-0': '0px',
        'terminal-1': '2px',
        'terminal-2': '4px',
        'terminal-3': '6px',
        'terminal-4': '8px',
        'terminal-6': '12px',
        'terminal-8': '16px',
        'terminal-12': '24px',
      },
      fontSize: {
        // Terminal typography (dense, Bloomberg-style)
        'terminal-xs': '10px',
        'terminal-sm': '11px',
        'terminal-base': '12px',
        'terminal-md': '13px',
        'terminal-lg': '14px',
        'terminal-xl': '16px',
      },
      lineHeight: {
        // Terminal line heights
        'terminal-tight': '1.2',
        'terminal-snug': '1.35',
        'terminal-normal': '1.5',
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
        glow: 'var(--shadow-glow)',
        // Terminal glow effects
        'glow-positive': '0 0 12px rgba(16, 185, 129, 0.2)',
        'glow-negative': '0 0 12px rgba(239, 68, 68, 0.2)',
        'glow-interactive': '0 0 16px rgba(129, 140, 248, 0.3)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s ease-in-out infinite',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
