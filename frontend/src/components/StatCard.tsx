import React from 'react';
import { type LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  amount: string;
  subtitle?: string;
  icon: LucideIcon;
  variant: 'income' | 'expense' | 'balance';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  amount,
  subtitle,
  icon: Icon,
  variant,
}) => {
  const variantConfig = {
    income: {
      border: 'border-[var(--accent-teal-border)]',
      iconBg: 'bg-[var(--accent-teal-tint)] text-[var(--accent-teal-text)] border border-[var(--accent-teal-border)]',
      amountColor: 'text-[var(--accent-teal-text)]',
      accentGlow: 'shadow-[0_4px_24px_-4px_rgba(64,191,193,0.20)]',
      badge: 'text-[var(--accent-teal-text)]',
    },
    expense: {
      border: 'border-[var(--accent-rose-border)]',
      iconBg: 'bg-[var(--accent-rose-tint)] text-[var(--accent-rose-text)] border border-[var(--accent-rose-border)]',
      amountColor: 'text-[var(--accent-rose-text)]',
      accentGlow: 'shadow-[0_4px_24px_-4px_rgba(240,19,77,0.20)]',
      badge: 'text-[var(--accent-rose-text)]',
    },
    balance: {
      border: 'border-[var(--border-strong)]',
      iconBg: 'bg-gradient-to-tr from-[#df0c42] to-[#ff6f5e] text-white shadow-md shadow-[rgba(240,19,77,0.25)]',
      amountColor: 'text-[var(--text)]',
      accentGlow: 'shadow-[0_4px_24px_-4px_rgba(18,53,58,0.15)] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)]',
      badge: 'text-[var(--text-muted)]',
    },
  }[variant];

  return (
    <div
      className={`relative overflow-hidden rounded-3xl glass-card glass-card-hover p-6 border ${variantConfig.border} ${variantConfig.accentGlow}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
          {title}
        </span>
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${variantConfig.iconBg}`}>
          <Icon className="h-5 w-5 stroke-[2.2]" />
        </div>
      </div>

      <div className="mt-4">
        <p className={`text-2xl sm:text-3xl font-black tracking-tight ${variantConfig.amountColor}`}>
          {amount}
        </p>
        {subtitle && (
          <p className="mt-1 text-xs text-[var(--text-subtle)] font-medium">{subtitle}</p>
        )}
      </div>
    </div>
  );
};
