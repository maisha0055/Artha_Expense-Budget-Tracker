/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        themeBg: {
          DEFAULT: 'var(--bg-page)',
          gradient: 'var(--bg-page-gradient)',
        },
        surface: {
          DEFAULT: 'var(--surface)',
          hover: 'var(--surface-hover)',
          solid: 'var(--surface-solid)',
        },
        themeBorder: {
          DEFAULT: 'var(--border)',
          strong: 'var(--border-strong)',
        },
        ink: {
          DEFAULT: 'var(--text)',
          muted: 'var(--text-muted)',
          subtle: 'var(--text-subtle)',
        },
        rose: {
          DEFAULT: 'var(--accent-rose)',
          text: 'var(--accent-rose-text)',
          tint: 'var(--accent-rose-tint)',
          border: 'var(--accent-rose-border)',
        },
        coral: {
          DEFAULT: 'var(--accent-coral)',
          text: 'var(--accent-coral-text)',
          tint: 'var(--accent-coral-tint)',
          border: 'var(--accent-coral-border)',
        },
        teal: {
          DEFAULT: 'var(--accent-teal)',
          text: 'var(--accent-teal-text)',
          tint: 'var(--accent-teal-tint)',
          border: 'var(--accent-teal-border)',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        glass: 'var(--shadow-glass)',
        'rose-glow': '0 4px 20px -2px rgba(240, 19, 77, 0.35)',
        'teal-glow': '0 4px 20px -2px rgba(64, 191, 193, 0.35)',
      },
    },
  },
  plugins: [],
}
