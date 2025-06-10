/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors
        'primary': '#2563EB', // Deep blue (primary) - blue-600
        'primary-50': '#EFF6FF', // Very light blue - blue-50
        'primary-100': '#DBEAFE', // Light blue - blue-100
        'primary-500': '#3B82F6', // Medium blue - blue-500
        'primary-700': '#1D4ED8', // Dark blue - blue-700
        'primary-900': '#1E3A8A', // Very dark blue - blue-900

        // Secondary Colors
        'secondary': '#64748B', // Balanced slate - slate-500
        'secondary-100': '#F1F5F9', // Light slate - slate-100
        'secondary-200': '#E2E8F0', // Light slate - slate-200
        'secondary-300': '#CBD5E1', // Medium light slate - slate-300
        'secondary-600': '#475569', // Medium dark slate - slate-600
        'secondary-700': '#334155', // Dark slate - slate-700
        'secondary-800': '#1E293B', // Very dark slate - slate-800

        // Accent Colors
        'accent': '#0EA5E9', // Bright cyan - sky-500
        'accent-100': '#E0F2FE', // Light cyan - sky-100
        'accent-200': '#BAE6FD', // Light cyan - sky-200
        'accent-600': '#0284C7', // Medium dark cyan - sky-600

        // Background Colors
        'background': '#FAFBFC', // Subtle off-white - custom
        'surface': '#F8FAFC', // Elevated surface - slate-50
        'surface-hover': '#F1F5F9', // Surface hover - slate-100

        // Text Colors
        'text-primary': '#1E293B', // Rich dark gray - slate-800
        'text-secondary': '#64748B', // Muted text - slate-500
        'text-tertiary': '#94A3B8', // Light muted text - slate-400

        // Semantic Colors
        'success': '#059669', // Forest green - emerald-600
        'success-100': '#D1FAE5', // Light green - emerald-100
        'success-500': '#10B981', // Medium green - emerald-500

        'warning': '#D97706', // Amber orange - amber-600
        'warning-100': '#FEF3C7', // Light amber - amber-100
        'warning-500': '#F59E0B', // Medium amber - amber-500

        'error': '#DC2626', // Clear red - red-600
        'error-100': '#FEE2E2', // Light red - red-100
        'error-500': '#EF4444', // Medium red - red-500

        // Border Colors
        'border': '#E2E8F0', // Neutral border - slate-200
        'border-light': '#F1F5F9', // Light border - slate-100
        'border-focus': '#0EA5E9', // Focus border - sky-500
      },
      fontFamily: {
        'heading': ['Inter', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
        'caption': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace'],
      },
      fontWeight: {
        'normal': '400',
        'medium': '500',
        'semibold': '600',
      },
      boxShadow: {
        'sm': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'md': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        'DEFAULT': '6px',
        'lg': '8px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      zIndex: {
        '100': '100',
        '200': '200',
        '300': '300',
      },
      scale: {
        '102': '1.02',
      },
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
      },
      transitionTimingFunction: {
        'out': 'cubic-bezier(0, 0, 0.2, 1)',
      },
      backdropBlur: {
        'sm': '4px',
      },
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        pulse: {
          '0%, 100%': {
            opacity: '1',
          },
          '50%': {
            opacity: '.5',
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
}