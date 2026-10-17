import React, { useState } from 'react';
import type { Category, Transaction, TransactionType, CreateTransactionRequest } from '../types';
import { AlertCircle, ArrowDownLeft, ArrowUpRight, Calendar, Tag, FileText } from 'lucide-react';
import { CURRENCY_SYMBOL } from '../constants/currency';

interface TransactionFormProps {
  initialData?: Transaction | null;
  categories: Category[];
  onSubmit: (data: CreateTransactionRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const getTodayDate = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const TransactionForm: React.FC<TransactionFormProps> = ({
  initialData,
  categories,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [type, setType] = useState<TransactionType>(initialData?.type || 'Expense');
  const [amount, setAmount] = useState<string>(initialData ? initialData.amount.toString() : '');
  const [categoryId, setCategoryId] = useState<number | ''>(
    initialData ? initialData.categoryId : categories.length > 0 ? categories[0].id : ''
  );
  const [date, setDate] = useState<string>(initialData?.date || getTodayDate());
  const [note, setNote] = useState<string>(initialData?.note || '');

  const [errors, setErrors] = useState<{
    amount?: string;
    categoryId?: string;
    date?: string;
    note?: string;
  }>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      newErrors.amount = 'Amount must be greater than 0.';
    } else if (parsedAmount > 999999999.99) {
      newErrors.amount = 'Amount exceeds maximum limit.';
    }

    if (!categoryId) {
      newErrors.categoryId = 'Please select a category.';
    }

    if (!date) {
      newErrors.date = 'Date is required.';
    }

    if (note && note.length > 255) {
      newErrors.note = 'Note cannot exceed 255 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    try {
      await onSubmit({
        amount: parseFloat(amount),
        type,
        categoryId: Number(categoryId),
        date,
        note: note.trim() || null,
      });
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { detail?: string; title?: string } } })?.response?.data?.detail ||
        (err as { response?: { data?: { detail?: string; title?: string } } })?.response?.data?.title ||
        'Failed to save transaction. Please check your inputs.';
      setServerError(errorMsg);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 font-sans">
      {serverError && (
        <div className="flex items-start gap-2.5 rounded-2xl bg-[var(--accent-rose-tint)] border border-[var(--accent-rose-border)] p-3.5 text-xs text-[var(--accent-rose-text)] animate-in fade-in">
          <AlertCircle className="h-4 w-4 shrink-0 text-[var(--accent-rose)] mt-0.5" />
          <p className="flex-1 font-semibold">{serverError}</p>
        </div>
      )}

      {/* Segmented Income/Expense Toggle */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text)] mb-1.5">
          Transaction Type
        </label>
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[var(--surface)] p-1.5 border border-[var(--border)]">
          <button
            type="button"
            id="type-expense-btn"
            onClick={() => setType('Expense')}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all cursor-pointer ${
              type === 'Expense'
                ? 'bg-[var(--surface-solid)] text-[var(--accent-rose-text)] border border-[var(--accent-rose-border)] shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            <ArrowUpRight className="h-4 w-4 text-[var(--accent-rose)] stroke-[2.5]" />
            Expense
          </button>
          <button
            type="button"
            id="type-income-btn"
            onClick={() => setType('Income')}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all cursor-pointer ${
              type === 'Income'
                ? 'bg-[var(--surface-solid)] text-[var(--accent-teal-text)] border border-[var(--accent-teal-border)] shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            <ArrowDownLeft className="h-4 w-4 text-[var(--accent-teal)] stroke-[2.5]" />
            Income
          </button>
        </div>
      </div>

      {/* Amount Field (Large Input) */}
      <div>
        <label htmlFor="transaction-amount-input" className="block text-xs font-bold uppercase tracking-wider text-[var(--text)] mb-1.5">
          Amount ({CURRENCY_SYMBOL})
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base font-extrabold text-[var(--text)]">
            {CURRENCY_SYMBOL}
          </span>
          <input
            id="transaction-amount-input"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }));
            }}
            className={`w-full rounded-2xl border bg-[var(--surface-input)] py-3 pl-10 pr-4 text-base font-bold text-[var(--text)] transition placeholder:text-[var(--text-subtle)] focus:bg-[var(--surface-solid)] focus:outline-none focus:ring-2 ${
              errors.amount
                ? 'border-[var(--accent-rose)] focus:ring-[var(--accent-rose-border)]'
                : 'border-[var(--border)] focus:border-[var(--accent-teal)] focus:ring-[var(--accent-teal-border)]'
            }`}
          />
        </div>
        {errors.amount && (
          <p className="mt-1 text-xs text-[var(--accent-rose-text)] font-semibold">{errors.amount}</p>
        )}
      </div>

      {/* Category Dropdown */}
      <div>
        <label htmlFor="transaction-category-select" className="block text-xs font-bold uppercase tracking-wider text-[var(--text)] mb-1.5">
          Category
        </label>
        <div className="relative">
          <Tag className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-subtle)]" />
          <select
            id="transaction-category-select"
            value={categoryId}
            onChange={(e) => {
              setCategoryId(Number(e.target.value));
              if (errors.categoryId) setErrors((prev) => ({ ...prev, categoryId: undefined }));
            }}
            className={`w-full appearance-none rounded-2xl border bg-[var(--surface-input)] py-3 pl-10 pr-9 text-sm font-semibold text-[var(--text)] transition focus:bg-[var(--surface-solid)] focus:outline-none focus:ring-2 cursor-pointer ${
              errors.categoryId
                ? 'border-[var(--accent-rose)] focus:ring-[var(--accent-rose-border)]'
                : 'border-[var(--border)] focus:border-[var(--accent-teal)] focus:ring-[var(--accent-teal-border)]'
            }`}
          >
            {categories.length === 0 ? (
              <option value="">No categories available</option>
            ) : (
              categories.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-[var(--surface-solid)] text-[var(--text)]">
                  {cat.name}
                </option>
              ))
            )}
          </select>
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-subtle)] text-xs">
            ▼
          </div>
        </div>
        {errors.categoryId && (
          <p className="mt-1 text-xs text-[var(--accent-rose-text)] font-semibold">{errors.categoryId}</p>
        )}
      </div>

      {/* Date Field */}
      <div>
        <label htmlFor="transaction-date-input" className="block text-xs font-bold uppercase tracking-wider text-[var(--text)] mb-1.5">
          Date
        </label>
        <div className="relative">
          <Calendar className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-subtle)]" />
          <input
            id="transaction-date-input"
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              if (errors.date) setErrors((prev) => ({ ...prev, date: undefined }));
            }}
            className={`w-full rounded-2xl border bg-[var(--surface-input)] py-3 pl-10 pr-4 text-sm font-semibold text-[var(--text)] transition focus:bg-[var(--surface-solid)] focus:outline-none focus:ring-2 cursor-pointer ${
              errors.date
                ? 'border-[var(--accent-rose)] focus:ring-[var(--accent-rose-border)]'
                : 'border-[var(--border)] focus:border-[var(--accent-teal)] focus:ring-[var(--accent-teal-border)]'
            }`}
          />
        </div>
        {errors.date && (
          <p className="mt-1 text-xs text-[var(--accent-rose-text)] font-semibold">{errors.date}</p>
        )}
      </div>

      {/* Note Field */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="transaction-note-input" className="block text-xs font-bold uppercase tracking-wider text-[var(--text)]">
            Note (Optional)
          </label>
          <span className="text-[11px] text-[var(--text-subtle)] font-medium">{note.length}/255</span>
        </div>
        <div className="relative">
          <FileText className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-[var(--text-subtle)]" />
          <textarea
            id="transaction-note-input"
            rows={2}
            maxLength={255}
            placeholder="Add an optional description or note..."
            value={note}
            onChange={(e) => {
              setNote(e.target.value);
              if (errors.note) setErrors((prev) => ({ ...prev, note: undefined }));
            }}
            className={`w-full rounded-2xl border bg-[var(--surface-input)] py-3 pl-10 pr-4 text-sm text-[var(--text)] transition placeholder:text-[var(--text-subtle)] focus:bg-[var(--surface-solid)] focus:outline-none focus:ring-2 resize-none ${
              errors.note
                ? 'border-[var(--accent-rose)] focus:ring-[var(--accent-rose-border)]'
                : 'border-[var(--border)] focus:border-[var(--accent-teal)] focus:ring-[var(--accent-teal-border)]'
            }`}
          />
        </div>
        {errors.note && (
          <p className="mt-1 text-xs text-[var(--accent-rose-text)] font-semibold">{errors.note}</p>
        )}
      </div>

      {/* Modal Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
        <button
          type="button"
          id="transaction-cancel-btn"
          onClick={onCancel}
          disabled={isLoading}
          className="btn-ghost rounded-2xl px-5 py-3 text-sm font-semibold cursor-pointer disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          id="transaction-submit-btn"
          disabled={isLoading}
          className="btn-primary rounded-2xl px-6 py-3 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isLoading && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          )}
          {initialData ? 'Update Transaction' : 'Save Transaction'}
        </button>
      </div>
    </form>
  );
};
