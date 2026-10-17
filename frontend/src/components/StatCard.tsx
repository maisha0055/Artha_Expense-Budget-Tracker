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
  const variantStyles = {
    income: {
      border: 'border-emerald-100',
      bgIcon: 'bg-emerald-50 text-emerald-600',
      amountColor: 'text-emerald-700',
      badgeBg: 'bg-emerald-500/10 text-emerald-700',
    },
    expense: {
      border: 'border-rose-100',
      bgIcon: 'bg-rose-50 text-rose-600',
      amountColor: 'text-rose-700',
      badgeBg: 'bg-rose-500/10 text-rose-700',
    },
    balance: {
      border: 'border-indigo-100',
      bgIcon: 'bg-indigo-50 text-indigo-600',
      amountColor: 'text-indigo-900',
      badgeBg: 'bg-indigo-500/10 text-indigo-700',
    },
  }[variant];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${variantStyles.border} bg-white p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${variantStyles.bgIcon}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4">
        <p className={`font-mono text-2xl sm:text-3xl font-extrabold tracking-tight ${variantStyles.amountColor}`}>
          {amount}
        </p>
        {subtitle && (
          <p className="mt-1 text-xs text-slate-400 font-medium">{subtitle}</p>
        )}
      </div>
    </div>
  );
};
