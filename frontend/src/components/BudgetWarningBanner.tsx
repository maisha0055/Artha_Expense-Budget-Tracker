import React from 'react';
import type { CategorySummary } from '../types';
import { formatCurrency } from '../constants/currency';
import { AlertTriangle, AlertOctagon } from 'lucide-react';

interface BudgetWarningBannerProps {
  categories: CategorySummary[];
}

export const BudgetWarningBanner: React.FC<BudgetWarningBannerProps> = ({ categories }) => {
  const alertedCategories = categories.filter(
    (c) => c.status === 'Warning' || c.status === 'Exceeded'
  );

  if (alertedCategories.length === 0) {
    return null;
  }

  const hasExceeded = alertedCategories.some((c) => c.status === 'Exceeded');

  return (
    <div
      role="alert"
      className={`rounded-3xl glass-card p-5 sm:p-6 shadow-glass border-l-4 transition-all animate-in fade-in duration-200 ${
        hasExceeded
          ? 'border-l-[var(--accent-rose)] bg-[var(--accent-rose-tint)] border-[var(--accent-rose-border)] text-[var(--accent-rose-text)]'
          : 'border-l-[var(--accent-coral)] bg-[var(--accent-coral-tint)] border-[var(--accent-coral-border)] text-[var(--accent-coral-text)]'
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-sm ${
            hasExceeded
              ? 'bg-[var(--accent-rose)] text-white'
              : 'bg-[var(--accent-coral)] text-white'
          }`}
        >
          {hasExceeded ? (
            <AlertOctagon className="h-6 w-6 stroke-[2.2]" />
          ) : (
            <AlertTriangle className="h-6 w-6 stroke-[2.2]" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <h2 className="text-base font-extrabold tracking-tight text-[var(--text)]">
              {hasExceeded
                ? 'Budget Limits Exceeded'
                : 'Budget Warnings - Near Limits'}
            </h2>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[var(--surface-input)] text-[var(--text)] border border-[var(--border)] shadow-xs w-fit">
              {alertedCategories.length} {alertedCategories.length === 1 ? 'category' : 'categories'} affected
            </span>
          </div>

          <p className="text-xs mt-1 text-[var(--text-muted)] font-medium">
            The following monthly category budgets require immediate attention:
          </p>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {alertedCategories.map((c) => {
              const isExceeded = c.status === 'Exceeded';
              return (
                <div
                  key={c.categoryId}
                  className={`flex items-center justify-between rounded-2xl bg-[var(--surface-input)] backdrop-blur-sm p-3 border shadow-xs text-xs transition hover:bg-[var(--surface-hover)] ${
                    isExceeded ? 'border-[var(--accent-rose-border)]' : 'border-[var(--accent-coral-border)]'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-[var(--text)] truncate text-sm">{c.name}</p>
                    <p className="text-xs text-[var(--text-subtle)] font-medium mt-0.5">
                      {formatCurrency(c.spent)} of {c.limit !== null ? formatCurrency(c.limit) : 'N/A'}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 font-bold px-2.5 py-1 rounded-xl text-xs border ${
                      isExceeded
                        ? 'bg-[var(--accent-rose-tint)] text-[var(--accent-rose-text)] border-[var(--accent-rose-border)]'
                        : 'bg-[var(--accent-coral-tint)] text-[var(--accent-coral-text)] border-[var(--accent-coral-border)]'
                    }`}
                  >
                    {c.percentUsed !== null ? `${c.percentUsed.toFixed(1)}%` : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
