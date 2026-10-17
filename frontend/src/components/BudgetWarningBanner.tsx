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
      className={`rounded-2xl border p-4 sm:p-5 shadow-sm transition-all animate-in fade-in duration-200 ${
        hasExceeded
          ? 'bg-rose-50/90 border-rose-200 text-rose-900'
          : 'bg-amber-50/90 border-amber-200 text-amber-900'
      }`}
    >
      <div className="flex items-start gap-3.5">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            hasExceeded
              ? 'bg-rose-100 text-rose-600'
              : 'bg-amber-100 text-amber-600'
          }`}
        >
          {hasExceeded ? (
            <AlertOctagon className="h-5 w-5" />
          ) : (
            <AlertTriangle className="h-5 w-5" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <h3 className="text-sm font-bold tracking-tight">
              {hasExceeded
                ? 'Budget Limits Exceeded'
                : 'Budget Warnings - Near Limit'}
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/70 shadow-2xs w-fit">
              {alertedCategories.length} {alertedCategories.length === 1 ? 'category' : 'categories'} affected
            </span>
          </div>

          <p className="text-xs mt-1 text-slate-600">
            The following monthly category budgets require attention:
          </p>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {alertedCategories.map((c) => {
              const isExceeded = c.status === 'Exceeded';
              return (
                <div
                  key={c.categoryId}
                  className={`flex items-center justify-between rounded-xl bg-white/80 backdrop-blur-xs p-2.5 border shadow-2xs text-xs ${
                    isExceeded ? 'border-rose-300' : 'border-amber-300'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-slate-900 truncate">{c.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {formatCurrency(c.spent)} of {c.limit !== null ? formatCurrency(c.limit) : 'N/A'}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 font-mono font-bold px-2 py-1 rounded-lg ${
                      isExceeded
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-amber-100 text-amber-700'
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
