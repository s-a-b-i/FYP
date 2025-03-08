/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Roboto', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      spacing: {
        section: "3rem",
        "section-sm": "1.5rem",
        "section-lg": "4rem",
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          main: '#10B981',
          hover: '#059669',
          light: '#D1FAE5',
          dark: '#065F46'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: '#DC2626',
          foreground: '#FFFFFF',
          hover: '#B91C1C',
          light: '#FEE2E2',
          dark: '#7F1D1D'
        },
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          500: '#6B7280',
          700: '#374151',
          900: '#111827'
        },
        status: {
          success: {
            bg: '#DEF7EC',
            text: '#03543F'
          },
          info: {
            bg: '#DBEAFE',
            text: '#1E40AF'
          },
          warning: {
            bg: '#FEF3C7',
            text: '#92400E'
          },
          error: {
            bg: '#FEE2E2',
            text: '#991B1B'
          }
        },
        itemTypes: {
          sell: {
            bg: '#DBEAFE',
            text: '#1E40AF'
          },
          rent: {
            bg: '#D1FAE5',
            text: '#065F46'
          },
          exchange: {
            bg: '#F3E8FF',
            text: '#6B21A8'
          }
        },
        border: 'hsl(var(--border))',
        input: '#333333',
        ring: 'hsl(var(--ring))',
        chart: {
          vibrant: {
            blue: '#3B82F6',    // Vibrant Blue
            green: '#22C55E',   // Vibrant Green
            purple: '#8B5CF6',  // Vibrant Purple
            orange: '#F97316',  // Vibrant Orange
            pink: '#EC4899',    // Vibrant Pink
            teal: '#14B8A6',    // Vibrant Teal
            yellow: '#FACC15',  // Vibrant Yellow
            red: '#EF4444'      // Vibrant Red
          },
          muted: {
            blue: 'rgba(59, 130, 246, 0.2)',
            green: 'rgba(34, 197, 94, 0.2)',
            purple: 'rgba(139, 92, 246, 0.2)',
            orange: 'rgba(249, 115, 22, 0.2)',
            pink: 'rgba(236, 72, 153, 0.2)',
            teal: 'rgba(20, 184, 166, 0.2)',
            yellow: 'rgba(250, 204, 21, 0.2)',
            red: 'rgba(239, 68, 68, 0.2)'
          }
        },
        admin: {
          background: '#FFFFFF',
          sidebar: '#F8FAFC',
          header: '#FFFFFF',
          card: '#FFFFFF',
          hover: '#F1F5F9',
          border: '#E2E8F0',
          text: {
            primary: '#0F172A',
            secondary: '#475569',
            muted: '#64748B'
          },
          accent: {
            primary: '#10B981',
            hover: '#059669',
            light: '#D1FAE5'
          },
          backgroundDark: '#0F1117',
          sidebarDark: '#1A1C23',
          headerDark: '#1A1C23',
          cardDark: '#24262D',
          hoverDark: '#2D303A',
          borderDark: '#333844',
          textDark: {
            primary: '#F8FAFC',
            secondary: '#CBD5E1',
            muted: '#64748B'
          },
          accentDark: {
            primary: '#10B981',
            hover: '#059669',
            light: '#064E3B'
          }
        }
      },
      gridTemplateColumns: {
        'auto-fit': 'repeat(auto-fit, minmax(250px, 1fr))',
        'auto-fill': 'repeat(auto-fill, minmax(250px, 1fr))',
      },
      minHeight: {
        'screen-without-header': 'calc(100vh - 64px)',
      },
      backgroundColor: {
        'primary-hover': 'hsl(var(--primary)/0.9)',
      },
      maxWidth: {
        'profile': '64rem',
      },
    }
  },
  plugins: [
    require("tailwindcss-animate"),
    function({ addComponents }) {
      addComponents({
        '.layout': {
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        },
        '.main-content': {
          flex: '1 1 auto',
        },
        '.section': {
          marginBottom: '3rem',
        },
        '.section-sm': {
          marginBottom: '1.5rem',
        },
        '.section-lg': {
          marginBottom: '4rem',
        },
        '.card': {
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
          overflow: 'hidden',
        },
        '.form-group': {
          marginBottom: '1.5rem',
        },
        '.form-label': {
          display: 'block',
          marginBottom: '0.5rem',
          fontWeight: '500',
        },
        '.form-input': {
          width: '100%',
          padding: '0.75rem',
          borderRadius: '0.375rem',
          borderWidth: '1px',
          borderColor: '#333333',
        },
      })
    }
  ],
}