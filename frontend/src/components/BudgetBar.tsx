import React from 'react';
import type { CategorySummary } from '../types';
import { formatCurrency } from '../constants/currency';
import { CheckCircle2, AlertTriangle, AlertOctagon, HelpCircle } from 'lucide-react';

interface BudgetBarProps {
  category: CategorySummary;
}

export const BudgetBar: React.FC<BudgetBarProps> = ({ category }) => {
  const { name, spent, limit, percentUsed, status } = category;

  // Status badge config with explicit icon, accessible text label, and distinct fills
  const getStatusConfig = () => {
    switch (status) {
      case 'Ok':
        return {
          label: 'On track',
          badgeClass: 'bg-[var(--accent-teal-tint)] text-[var(--accent-teal-text)] border-[var(--accent-teal-border)]',
          icon: CheckCircle2,
          barColor: 'bg-[var(--accent-teal)]',
          percentColor: 'text-[var(--accent-teal-text)]',
        };
      case 'Warning':
        return {
          label: 'Almost at limit',
          badgeClass: 'bg-[var(--accent-coral-tint)] text-[var(--accent-coral-text)] border-[var(--accent-coral-border)]',
          icon: AlertTriangle,
          barColor: 'bg-[var(--accent-coral)]',
          percentColor: 'text-[var(--accent-coral-text)]',
        };
      case 'Exceeded':
        return {
          label: 'Over budget',
          badgeClass: 'bg-[var(--accent-rose-tint)] text-[var(--accent-rose-text)] border-[var(--accent-rose-border)]',
          icon: AlertOctagon,
          barColor: 'bg-[var(--accent-rose)]',
          percentColor: 'text-[var(--accent-rose-text)]',
        };
      case 'None':
      default:
        return {
          label: 'No budget set',
          badgeClass: 'bg-[var(--surface-input)] text-[var(--text-muted)] border-[var(--border)]',
          icon: HelpCircle,
          barColor: 'bg-[var(--border-strong)]',
          percentColor: 'text-[var(--text-muted)]',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;
  const clampedPercent = percentUsed !== null ? Math.min(Math.max(percentUsed, 0), 100) : 0;

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] backdrop-blur-md p-4 transition-all duration-200 hover:bg-[var(--surface-hover)] hover:shadow-glass">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2.5">
          <span className="font-bold text-[var(--text)] text-sm">{name}</span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold border ${config.badgeClass}`}
          >
            <Icon className="h-3.5 w-3.5 stroke-[2.2]" />
            {config.label}
          </span>
        </div>

        <div className="text-right flex items-center justify-end gap-1.5">
          <span className="font-sans text-sm font-extrabold text-[var(--text)]">
            {formatCurrency(spent)}
          </span>
          {limit !== null ? (
            <span className="text-xs text-[var(--text-subtle)] font-medium">
              / {formatCurrency(limit)}
            </span>
          ) : (
            <span className="text-xs text-[var(--text-subtle)] italic">(No limit)</span>
          )}
          {percentUsed !== null && (
            <span className={`ml-1 font-bold text-xs ${config.percentColor}`}>
              ({percentUsed.toFixed(1)}%)
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar Track & Animated Fill */}
      <div 
        className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--border-strong)]/30 p-[1px]"
        role="progressbar"
        aria-valuenow={clampedPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${name} budget usage`}
      >
        {limit !== null ? (
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${config.barColor}`}
            style={{ width: `${clampedPercent}%` }}
          />
        ) : (
          <div
            className="h-full rounded-full bg-[var(--border-strong)]"
            style={{ width: spent > 0 ? '100%' : '0%' }}
          />
        )}
      </div>
    </div>
  );
};
