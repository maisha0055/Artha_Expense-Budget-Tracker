import React, { useState, useEffect } from 'react';
import type { Category, Transaction, TransactionType, CreateTransactionRequest } from '../types';
import { AlertCircle, ArrowDownLeft, ArrowUpRight, Calendar, Tag, FileText } from 'lucide-react';

interface TransactionFormProps {
  initialData?: Transaction | null;
  categories: Category[];
  onSubmit: (data: CreateTransactionRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  initialData,
  categories,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const getTodayDate = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

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

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setAmount(initialData.amount.toString());
      setCategoryId(initialData.categoryId);
      setDate(initialData.date);
      setNote(initialData.note || '');
    } else {
      setType('Expense');
      setAmount('');
      setCategoryId(categories.length > 0 ? categories[0].id : '');
      setDate(getTodayDate());
      setNote('');
    }
    setErrors({});
    setServerError(null);
  }, [initialData, categories]);

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
    <form onSubmit={handleSubmit} className="space-y-4">
      {serverError && (
        <div className="flex items-start gap-2.5 rounded-xl bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700 animate-in fade-in">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
          <p className="flex-1 text-xs font-medium">{serverError}</p>
        </div>
      )}

      {/* Transaction Type Toggle */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
          Transaction Type
        </label>
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            id="type-expense-btn"
            onClick={() => setType('Expense')}
            className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-all ${
              type === 'Expense'
                ? 'bg-white text-rose-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowUpRight className="h-4 w-4 text-rose-500" />
            Expense
          </button>
          <button
            type="button"
            id="type-income-btn"
            onClick={() => setType('Income')}
            className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-all ${
              type === 'Income'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowDownLeft className="h-4 w-4 text-emerald-500" />
            Income
          </button>
        </div>
      </div>

      {/* Amount Field */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
          Amount (৳)
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-semibold text-slate-400">
            ৳
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
            className={`w-full rounded-xl border bg-slate-50/50 py-2.5 pl-9 pr-3.5 text-sm font-mono text-slate-900 transition placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 ${
              errors.amount
                ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200'
                : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'
            }`}
          />
        </div>
        {errors.amount && (
          <p className="mt-1 text-xs text-rose-600 font-medium">{errors.amount}</p>
        )}
      </div>

      {/* Category Dropdown */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
          Category
        </label>
        <div className="relative">
          <Tag className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <select
            id="transaction-category-select"
            value={categoryId}
            onChange={(e) => {
              setCategoryId(Number(e.target.value));
              if (errors.categoryId) setErrors((prev) => ({ ...prev, categoryId: undefined }));
            }}
            className={`w-full appearance-none rounded-xl border bg-slate-50/50 py-2.5 pl-10 pr-9 text-sm text-slate-900 transition focus:bg-white focus:outline-none focus:ring-2 ${
              errors.categoryId
                ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200'
                : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'
            }`}
          >
            {categories.length === 0 ? (
              <option value="">No categories available</option>
            ) : (
              categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))
            )}
          </select>
          <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            ▼
          </div>
        </div>
        {errors.categoryId && (
          <p className="mt-1 text-xs text-rose-600 font-medium">{errors.categoryId}</p>
        )}
      </div>

      {/* Date Field */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
          Date
        </label>
        <div className="relative">
          <Calendar className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            id="transaction-date-input"
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              if (errors.date) setErrors((prev) => ({ ...prev, date: undefined }));
            }}
            className={`w-full rounded-xl border bg-slate-50/50 py-2.5 pl-10 pr-3.5 text-sm text-slate-900 transition focus:bg-white focus:outline-none focus:ring-2 ${
              errors.date
                ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200'
                : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'
            }`}
          />
        </div>
        {errors.date && (
          <p className="mt-1 text-xs text-rose-600 font-medium">{errors.date}</p>
        )}
      </div>

      {/* Note Field */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
            Note (Optional)
          </label>
          <span className="text-[11px] text-slate-400">{note.length}/255</span>
        </div>
        <div className="relative">
          <FileText className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
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
            className={`w-full rounded-xl border bg-slate-50/50 py-2 pl-10 pr-3.5 text-sm text-slate-900 transition placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 resize-none ${
              errors.note
                ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200'
                : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'
            }`}
          />
        </div>
        {errors.note && (
          <p className="mt-1 text-xs text-rose-600 font-medium">{errors.note}</p>
        )}
      </div>

      {/* Modal Actions */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
        <button
          type="button"
          id="transaction-cancel-btn"
          onClick={onCancel}
          disabled={isLoading}
          className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          id="transaction-submit-btn"
          disabled={isLoading}
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.99] transition-all disabled:opacity-50"
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
