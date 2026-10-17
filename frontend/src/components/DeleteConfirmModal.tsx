import React from 'react';
import { Modal } from './Modal';
import type { Transaction } from '../types';
import { AlertTriangle, Trash2 } from 'lucide-react';

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
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-rose-800">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="text-sm">
            <p className="font-semibold">Confirm Deletion</p>
            <p className="text-xs text-rose-600 mt-0.5">
              Are you sure you want to delete this transaction? This action cannot be undone.
            </p>
          </div>
        </div>

        {/* Transaction Summary Card */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 text-xs uppercase font-medium">Category</span>
            <span className="font-semibold text-slate-800">{transaction.categoryName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 text-xs uppercase font-medium">Type</span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                transaction.type === 'Income'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {transaction.type}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 text-xs uppercase font-medium">Amount</span>
            <span className="font-mono font-bold text-slate-900">৳{formattedAmount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 text-xs uppercase font-medium">Date</span>
            <span className="text-slate-700">{transaction.date}</span>
          </div>
          {transaction.note && (
            <div className="flex justify-between items-start pt-1 border-t border-slate-200/60">
              <span className="text-slate-500 text-xs uppercase font-medium">Note</span>
              <span className="text-xs text-slate-600 italic text-right max-w-[200px] truncate">
                {transaction.note}
              </span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            id="cancel-delete-btn"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            id="confirm-delete-btn"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-rose-200 hover:bg-rose-700 active:scale-[0.99] transition-all disabled:opacity-50"
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
