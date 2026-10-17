import React from 'react';
import type { Transaction } from '../types';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Edit2,
  Trash2,
  Receipt,
  AlertCircle,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { CURRENCY_SYMBOL } from '../constants/currency';

interface TransactionTableProps {
  transactions: Transaction[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
  onAddNew?: () => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  onEdit,
  onDelete,
  onAddNew,
}) => {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      const parts = dateString.split('-');
      if (parts.length === 3) {
        const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      }
      return dateString;
    } catch {
      return dateString;
    }
  };

  // Loading skeleton rows
  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-3xl glass-card border border-[var(--border)] shadow-glass">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[var(--text)]">
            <thead className="border-b border-[var(--border)] bg-[var(--surface-solid)]/60 text-xs uppercase font-bold text-[var(--text-muted)]">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4">Note</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4">
                    <div className="h-4 w-24 rounded-lg bg-[var(--surface-hover)]" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 w-20 rounded-full bg-[var(--surface-hover)]" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 w-16 rounded-full bg-[var(--surface-hover)]" />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="ml-auto h-4 w-20 rounded-lg bg-[var(--surface-hover)]" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-32 rounded-lg bg-[var(--surface-hover)]" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="mx-auto h-8 w-16 rounded-xl bg-[var(--surface-hover)]" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="rounded-3xl border border-[var(--accent-rose-border)] bg-[var(--accent-rose-tint)] p-8 text-center shadow-glass">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-rose)] text-white mb-3 shadow-rose-glow">
          <AlertCircle className="h-6 w-6 stroke-[2.2]" />
        </div>
        <h3 className="text-base font-bold text-[var(--accent-rose-text)]">Failed to load transactions</h3>
        <p className="text-xs text-[var(--text-muted)] mt-1 max-w-md mx-auto">
          {errorMessage || 'There was a problem communicating with the server.'}
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 btn-primary inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        )}
      </div>
    );
  }

  // Empty state
  if (transactions.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-[var(--border-strong)] bg-[var(--surface)] p-12 text-center shadow-glass">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-teal-tint)] text-[var(--accent-teal-text)] border border-[var(--accent-teal-border)] mb-4">
          <Receipt className="h-7 w-7 stroke-[2.2]" />
        </div>
        <h3 className="text-lg font-bold text-[var(--text)]">No transactions recorded</h3>
        <p className="text-xs text-[var(--text-muted)] mt-1.5 max-w-md mx-auto font-medium">
          No records match the selected month or filter criteria. Add a transaction or adjust your filters above.
        </p>
        {onAddNew && (
          <button
            type="button"
            id="empty-state-add-btn"
            onClick={onAddNew}
            className="mt-5 btn-primary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            Add Transaction
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl glass-card border border-[var(--border)] shadow-glass">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-[var(--text)] font-sans">
          <thead className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--surface-solid)]/95 backdrop-blur-md text-xs uppercase font-extrabold text-[var(--text-muted)]">
            <tr>
              <th scope="col" className="px-6 py-4">
                Date
              </th>
              <th scope="col" className="px-6 py-4">
                Category
              </th>
              <th scope="col" className="px-6 py-4">
                Type
              </th>
              <th scope="col" className="px-6 py-4 text-right">
                Amount
              </th>
              <th scope="col" className="px-6 py-4">
                Note
              </th>
              <th scope="col" className="px-6 py-4 text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {transactions.map((t) => {
              const isIncome = t.type === 'Income';

              return (
                <tr
                  key={t.id}
                  className="hover:bg-[var(--surface-hover)] transition-colors duration-150 group"
                >
                  {/* Date */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-bold text-[var(--text)] block">
                      {formatDate(t.date)}
                    </span>
                    <span className="text-[11px] text-[var(--text-subtle)] font-medium">
                      {t.date}
                    </span>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--surface-input)] px-3 py-1 text-xs font-bold text-[var(--text)] border border-[var(--border)] shadow-2xs">
                      {t.categoryName}
                    </span>
                  </td>

                  {/* Type Badge */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${
                        isIncome
                          ? 'bg-[var(--accent-teal-tint)] text-[var(--accent-teal-text)] border-[var(--accent-teal-border)]'
                          : 'bg-[var(--accent-rose-tint)] text-[var(--accent-rose-text)] border-[var(--accent-rose-border)]'
                      }`}
                    >
                      {isIncome ? (
                        <ArrowDownLeft className="h-3.5 w-3.5 stroke-[2.5]" />
                      ) : (
                        <ArrowUpRight className="h-3.5 w-3.5 stroke-[2.5]" />
                      )}
                      {t.type}
                    </span>
                  </td>

                  {/* Amount */}
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span
                      className={`font-sans font-black text-sm ${
                        isIncome ? 'text-[var(--accent-teal-text)]' : 'text-[var(--text)]'
                      }`}
                    >
                      {isIncome ? '+' : '-'}{CURRENCY_SYMBOL}{formatAmount(t.amount)}
                    </span>
                  </td>

                  {/* Note */}
                  <td className="px-6 py-4">
                    {t.note ? (
                      <span
                        className="text-[var(--text-muted)] text-xs font-medium block max-w-xs truncate"
                        title={t.note}
                      >
                        {t.note}
                      </span>
                    ) : (
                      <span className="text-[var(--text-subtle)] text-xs italic">—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        id={`edit-transaction-${t.id}`}
                        onClick={() => onEdit(t)}
                        title="Edit transaction"
                        className="rounded-xl p-2 text-[var(--text-subtle)] hover:bg-[var(--accent-teal-tint)] hover:text-[var(--accent-teal-text)] transition-colors cursor-pointer"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        id={`delete-transaction-${t.id}`}
                        onClick={() => onDelete(t)}
                        title="Delete transaction"
                        className="rounded-xl p-2 text-[var(--text-subtle)] hover:bg-[var(--accent-rose-tint)] hover:text-[var(--accent-rose-text)] transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
