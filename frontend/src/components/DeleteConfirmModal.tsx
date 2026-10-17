import React from 'react';
import { Modal } from './Modal';
import type { Transaction } from '../types';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { CURRENCY_SYMBOL } from '../constants/currency';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  transaction: Transaction | null;
  onConfirm: () => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  transaction,
  onConfirm,
  onClose,
  isLoading = false,
}) => {
  if (!transaction) return null;

  const formattedAmount = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(transaction.amount);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Transaction"
      maxWidthClass="max-w-md"
    >
      <div className="space-y-4 font-sans">
        <div className="flex items-start gap-3.5 rounded-2xl bg-[var(--accent-rose-tint)] border border-[var(--accent-rose-border)] p-4 text-[var(--accent-rose-text)]">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-rose)] text-white shadow-xs">
            <AlertTriangle className="h-5 w-5 stroke-[2.2]" />
          </div>
          <div className="text-sm">
            <p className="font-bold">Confirm Deletion</p>
            <p className="text-xs text-[var(--accent-rose-text)] mt-0.5 leading-relaxed font-medium">
              Are you sure you want to delete this transaction record? This action cannot be reversed.
            </p>
          </div>
        </div>

        {/* Transaction Summary Card */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-input)] p-4 space-y-2.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-[var(--text-muted)] uppercase font-bold tracking-wider">Category</span>
            <span className="font-bold text-[var(--text)] text-sm">{transaction.categoryName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[var(--text-muted)] uppercase font-bold tracking-wider">Type</span>
            <span
              className={`font-bold px-2.5 py-0.5 rounded-full border ${
                transaction.type === 'Income'
                  ? 'bg-[var(--accent-teal-tint)] text-[var(--accent-teal-text)] border-[var(--accent-teal-border)]'
                  : 'bg-[var(--accent-rose-tint)] text-[var(--accent-rose-text)] border-[var(--accent-rose-border)]'
              }`}
            >
              {transaction.type}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[var(--text-muted)] uppercase font-bold tracking-wider">Amount</span>
            <span className="font-extrabold text-sm text-[var(--text)]">
              {CURRENCY_SYMBOL}{formattedAmount}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[var(--text-muted)] uppercase font-bold tracking-wider">Date</span>
            <span className="text-[var(--text)] font-semibold">{transaction.date}</span>
          </div>
          {transaction.note && (
            <div className="flex justify-between items-start pt-2 border-t border-[var(--border)]">
              <span className="text-[var(--text-muted)] uppercase font-bold tracking-wider">Note</span>
              <span className="text-[var(--text-muted)] italic text-right max-w-[200px] truncate font-medium">
                {transaction.note}
              </span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border)]">
          <button
            type="button"
            id="cancel-delete-btn"
            onClick={onClose}
            disabled={isLoading}
            className="btn-ghost rounded-2xl px-5 py-2.5 text-xs font-semibold cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            id="confirm-delete-btn"
            onClick={onConfirm}
            disabled={isLoading}
            className="btn-primary rounded-2xl px-5 py-2.5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Delete Transaction
          </button>
        </div>
      </div>
    </Modal>
  );
};
