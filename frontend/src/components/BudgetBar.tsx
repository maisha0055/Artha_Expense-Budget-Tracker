import React from 'react';
import type { CategorySummary } from '../types';
import { formatCurrency } from '../constants/currency';
import { CheckCircle2, AlertTriangle, AlertOctagon, HelpCircle } from 'lucide-react';

interface BudgetBarProps {
  category: CategorySummary;
}

export const BudgetBar: React.FC<BudgetBarProps> = ({ category }) => {
  const { name, spent, limit, percentUsed, status } = category;

  // Status badge config
  const getStatusBadge = () => {
    switch (status) {
      case 'Ok':
        return {
          label: 'Within Budget',
          className: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
          icon: CheckCircle2,
          barColor: 'bg-emerald-500',
        };
      case 'Warning':
        return {
          label: 'Near Limit',
          className: 'bg-amber-50 text-amber-700 border-amber-200/80',
          icon: AlertTriangle,
          barColor: 'bg-amber-500',
        };
      case 'Exceeded':
        return {
          label: 'Exceeded',
          className: 'bg-rose-50 text-rose-700 border-rose-200/80',
          icon: AlertOctagon,
          barColor: 'bg-rose-500',
        };
      case 'None':
      default:
        return {
          label: 'No Budget',
          className: 'bg-slate-100 text-slate-600 border-slate-200',
          icon: HelpCircle,
          barColor: 'bg-slate-300',
        };
    }
  };

  const badge = getStatusBadge();
  const Icon = badge.icon;
  const clampedPercent = percentUsed !== null ? Math.min(Math.max(percentUsed, 0), 100) : 0;

  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:bg-white hover:shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800 text-sm">{name}</span>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold border ${badge.className}`}
          >
            <Icon className="h-3 w-3" />
            {badge.label}
          </span>
        </div>

        <div className="text-right">
          <span className="font-mono text-sm font-bold text-slate-900">
            {formatCurrency(spent)}
          </span>
          {limit !== null ? (
            <span className="text-xs text-slate-500 ml-1 font-mono">
              / {formatCurrency(limit)}
            </span>
          ) : (
            <span className="text-xs text-slate-400 ml-1 italic">(No limit)</span>
          )}
          {percentUsed !== null && (
            <span
              className={`ml-2 font-mono text-xs font-bold ${
                status === 'Exceeded'
                  ? 'text-rose-600'
                  : status === 'Warning'
                  ? 'text-amber-600'
                  : 'text-slate-600'
              }`}
            >
              ({percentUsed.toFixed(1)}%)
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
        {limit !== null ? (
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${badge.barColor}`}
            style={{ width: `${clampedPercent}%` }}
          />
        ) : (
          <div
            className="h-full rounded-full bg-slate-300"
            style={{ width: spent > 0 ? '100%' : '0%' }}
          />
        )}
      </div>
    </div>
  );
};
