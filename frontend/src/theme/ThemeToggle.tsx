import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from './useTheme';
import type { ThemeMode } from './ThemeContext';

interface ThemeToggleProps {
  variant?: 'segmented' | 'compact';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = 'segmented', className = '' }) => {
  const { mode, resolvedTheme, setMode } = useTheme();

  const options: { mode: ThemeMode; label: string; icon: React.FC<{ className?: string }> }[] = [
    { mode: 'light', label: 'Light', icon: Sun },
    { mode: 'system', label: 'System', icon: Monitor },
    { mode: 'dark', label: 'Dark', icon: Moon },
  ];

  if (variant === 'compact') {
    // Single cycle button for floating corners (Login/Register)
    const handleCycle = () => {
      const nextMode: ThemeMode = mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light';
      setMode(nextMode);
    };

    const CurrentIcon = mode === 'system' ? Monitor : resolvedTheme === 'dark' ? Moon : Sun;

    return (
      <button
        type="button"
        onClick={handleCycle}
        className={`inline-flex items-center gap-1.5 p-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] backdrop-blur-md text-[var(--text)] hover:bg-[var(--surface-hover)] hover:border-[var(--border-strong)] transition-all shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--accent-teal)] ${className}`}
        aria-label={`Current theme: ${mode}. Click to cycle theme mode.`}
        title={`Theme: ${mode.charAt(0).toUpperCase() + mode.slice(1)} (Click to switch)`}
      >
        <CurrentIcon className="h-4 w-4 text-[var(--text)]" />
        <span className="text-[11px] font-bold capitalize hidden sm:inline">{mode}</span>
      </button>
    );
  }

  // Segmented 3-button toggle for Sidebar & Drawer
  return (
    <div
      role="radiogroup"
      aria-label="Theme mode selector"
      className={`grid grid-cols-3 gap-1 p-1 rounded-2xl border border-[var(--border)] bg-[var(--surface)] backdrop-blur-md ${className}`}
    >
      {options.map((opt) => {
        const Icon = opt.icon;
        const isSelected = mode === opt.mode;

        return (
          <button
            key={opt.mode}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => setMode(opt.mode)}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--accent-teal)] ${
              isSelected
                ? 'bg-gradient-to-tr from-[#df0c42] to-[#ff6f5e] text-white shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]'
            }`}
            title={`Set theme to ${opt.label}`}
          >
            <Icon className="h-3.5 w-3.5 stroke-[2.2]" />
            <span className="text-[11px]">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};
