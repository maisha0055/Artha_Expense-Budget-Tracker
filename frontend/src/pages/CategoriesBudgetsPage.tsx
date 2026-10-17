import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetsApi } from '../api/budgets';
import { categoriesApi } from '../api/categories';
import { summaryApi } from '../api/summary';
import { CURRENCY_SYMBOL, formatCurrency } from '../constants/currency';
import { useToast } from '../components/useToast';
import type { CategoryBudget } from '../types';
import {
  Calendar,
  Plus,
  Trash2,
  AlertCircle,
  Check,
  RotateCcw,
  Tag,
  Coins,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

const getCurrentMonth = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export const CategoriesBudgetsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [month, setMonth] = useState<string>(getCurrentMonth);
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [addCategoryError, setAddCategoryError] = useState<string | null>(null);
  const [addCategorySuccess, setAddCategorySuccess] = useState<boolean>(false);

  // Track inline edited values: { [categoryId]: string }
  const [editedLimits, setEditedLimits] = useState<Record<number, string>>({});
  const [savingCategoryIds, setSavingCategoryIds] = useState<Record<number, boolean>>({});
  const [savedCategoryIds, setSavedCategoryIds] = useState<Record<number, boolean>>({});
  const [rowErrors, setRowErrors] = useState<Record<number, string>>({});

  const handlePrevMonth = () => {
    const [year, m] = month.split('-').map(Number);
    const date = new Date(year, m - 2, 1);
    const y = date.getFullYear();
    const newM = String(date.getMonth() + 1).padStart(2, '0');
    setMonth(`${y}-${newM}`);
    setEditedLimits({});
  };

  const handleNextMonth = () => {
    const [year, m] = month.split('-').map(Number);
    const date = new Date(year, m, 1);
    const y = date.getFullYear();
    const newM = String(date.getMonth() + 1).padStart(2, '0');
    setMonth(`${y}-${newM}`);
    setEditedLimits({});
  };

  // Fetch budgets for the selected month
  const {
    data: budgets = [],
    isLoading: isBudgetsLoading,
    isError: isBudgetsError,
    refetch,
  } = useQuery({
    queryKey: ['budgets', month],
    queryFn: () => budgetsApi.getAll(month),
  });

  // Fetch summary for the same month to get category spending & percentUsed for mini progress bars
  const { data: summary } = useQuery({
    queryKey: ['summary', month],
    queryFn: () => summaryApi.getSummary(month),
  });

  // Category spending map: categoryId -> { spent, percentUsed, status }
  const spendingMap = React.useMemo(() => {
    const map = new Map<number, { spent: number; percentUsed: number | null; status: string }>();
    if (summary?.categories) {
      for (const cat of summary.categories) {
        map.set(cat.categoryId, {
          spent: cat.spent,
          percentUsed: cat.percentUsed,
          status: cat.status,
        });
      }
    }
    return map;
  }, [summary]);

  // Set/Update Budget Mutation
  const setBudgetMutation = useMutation({
    mutationFn: budgetsApi.setBudget,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['budgets', month] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });

      setSavedCategoryIds((prev) => ({ ...prev, [variables.categoryId]: true }));
      showToast('Monthly budget limit saved!', 'success');
      setTimeout(() => {
        setSavedCategoryIds((prev) => ({ ...prev, [variables.categoryId]: false }));
      }, 2000);
    },
    onError: (err: unknown, variables) => {
      const msg =
        (err as { response?: { data?: { detail?: string; title?: string } } })?.response?.data?.detail ||
        (err as { response?: { data?: { detail?: string; title?: string } } })?.response?.data?.title ||
        'Failed to save budget.';
      setRowErrors((prev) => ({ ...prev, [variables.categoryId]: msg }));
      showToast(msg, 'error');
    },
    onSettled: (_, __, variables) => {
      setSavingCategoryIds((prev) => ({ ...prev, [variables.categoryId]: false }));
    },
  });

  // Add Category Mutation
  const createCategoryMutation = useMutation({
    mutationFn: categoriesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      setNewCategoryName('');
      setAddCategoryError(null);
      setAddCategorySuccess(true);
      showToast('Category created successfully!', 'success');
      setTimeout(() => setAddCategorySuccess(false), 2500);
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { detail?: string; title?: string } } })?.response?.data?.detail ||
        (err as { response?: { data?: { detail?: string; title?: string } } })?.response?.data?.title ||
        'Failed to create category. Name may already exist.';
      setAddCategoryError(msg);
      showToast(msg, 'error');
    },
  });

  // Delete Category Mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: categoriesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      showToast('Category deleted successfully.', 'info');
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { detail?: string; title?: string } } })?.response?.data?.detail ||
        'Cannot delete category with existing transactions.';
      showToast(msg, 'error');
    },
  });

  const handleAddCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddCategoryError(null);
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      setAddCategoryError('Category name is required.');
      return;
    }
    if (trimmed.length > 50) {
      setAddCategoryError('Category name cannot exceed 50 characters.');
      return;
    }
    createCategoryMutation.mutate({ name: trimmed });
  };

  const handleLimitChange = (categoryId: number, value: string) => {
    setEditedLimits((prev) => ({ ...prev, [categoryId]: value }));
    if (rowErrors[categoryId]) {
      setRowErrors((prev) => {
        const next = { ...prev };
        delete next[categoryId];
        return next;
      });
    }
  };

  const handleSaveBudget = (item: CategoryBudget) => {
    const inputValue = editedLimits[item.categoryId];
    const stringVal = inputValue !== undefined ? inputValue : item.limitAmount?.toString() ?? '';

    let parsedLimit: number | null = null;
    if (stringVal.trim() !== '') {
      const num = parseFloat(stringVal);
      if (isNaN(num) || num < 0) {
        setRowErrors((prev) => ({ ...prev, [item.categoryId]: 'Enter a valid positive number.' }));
        return;
      }
      parsedLimit = num === 0 ? null : num;
    }

    setSavingCategoryIds((prev) => ({ ...prev, [item.categoryId]: true }));
    setBudgetMutation.mutate({
      categoryId: item.categoryId,
      month,
      limitAmount: parsedLimit,
    });
  };

  const handleClearBudget = (item: CategoryBudget) => {
    setEditedLimits((prev) => ({ ...prev, [item.categoryId]: '' }));
    setSavingCategoryIds((prev) => ({ ...prev, [item.categoryId]: true }));
    setBudgetMutation.mutate({
      categoryId: item.categoryId,
      month,
      limitAmount: null,
    });
  };

  const formattedMonthLabel = (() => {
    try {
      const [y, m] = month.split('-').map(Number);
      const date = new Date(y, m - 1, 1);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } catch {
      return month;
    }
  })();

  return (
    <div className="space-y-6">
      {/* Page Title & Month Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-black tracking-widest text-[var(--accent-rose-text)] uppercase">
            ALLOCATION & TARGETS
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text)]">
            Categories & Budgets
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            Set monthly targets and track category limits for{' '}
            <span className="font-bold text-[var(--text)]">{formattedMonthLabel}</span>.
          </p>
        </div>

        {/* Month Selector Bar */}
        <div className="flex items-center gap-1.5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] backdrop-blur-md p-1.5 shadow-xs">
          <button
            type="button"
            id="budget-prev-month-btn"
            onClick={handlePrevMonth}
            className="rounded-xl p-2 text-[var(--text-muted)] hover:bg-[var(--accent-teal-tint)] hover:text-[var(--accent-teal-text)] transition cursor-pointer"
            title="Previous month"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4 stroke-[2.2]" />
          </button>

          <div className="relative flex items-center px-2">
            <Calendar className="pointer-events-none mr-2 h-4 w-4 text-[var(--accent-teal-text)]" />
            <input
              id="budget-month-input"
              type="month"
              value={month}
              onChange={(e) => {
                setMonth(e.target.value);
                setEditedLimits({});
              }}
              className="border-none bg-transparent py-1 text-xs font-bold text-[var(--text)] focus:outline-none cursor-pointer"
            />
          </div>

          <button
            type="button"
            id="budget-next-month-btn"
            onClick={handleNextMonth}
            className="rounded-xl p-2 text-[var(--text-muted)] hover:bg-[var(--accent-teal-tint)] hover:text-[var(--accent-teal-text)] transition cursor-pointer"
            title="Next month"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4 stroke-[2.2]" />
          </button>
        </div>
      </div>

      {/* Add Category Form Card */}
      <div className="rounded-3xl glass-card p-6 border border-[var(--border)] shadow-glass">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent-teal-tint)] text-[var(--accent-teal-text)] border border-[var(--accent-teal-border)]">
            <Tag className="h-5 w-5 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[var(--text)]">Create New Category</h2>
            <p className="text-xs text-[var(--text-muted)]">
              Add customized spending groups to personalize your financial tracking.
            </p>
          </div>
        </div>

        <form onSubmit={handleAddCategorySubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Tag className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-subtle)]" />
            <input
              id="new-category-input"
              type="text"
              maxLength={50}
              placeholder="e.g. Groceries, Shopping, Healthcare..."
              value={newCategoryName}
              onChange={(e) => {
                setNewCategoryName(e.target.value);
                if (addCategoryError) setAddCategoryError(null);
              }}
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-input)] py-2.5 pl-10 pr-3.5 text-sm font-semibold text-[var(--text)] transition placeholder:text-[var(--text-subtle)] focus:border-[var(--accent-teal)] focus:bg-[var(--surface-solid)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-teal-border)]"
            />
          </div>

          <button
            type="submit"
            id="add-category-btn"
            disabled={createCategoryMutation.isPending}
            className="btn-primary inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-2.5 text-xs font-bold cursor-pointer disabled:opacity-50"
          >
            {createCategoryMutation.isPending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Plus className="h-4 w-4 stroke-[2.5]" />
            )}
            Add Category
          </button>
        </form>

        {addCategoryError && (
          <div className="mt-2.5 flex items-center gap-2 text-xs font-semibold text-[var(--accent-rose-text)] animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{addCategoryError}</span>
          </div>
        )}

        {addCategorySuccess && (
          <div className="mt-2.5 flex items-center gap-2 text-xs font-bold text-[var(--accent-teal-text)] animate-in fade-in">
            <Check className="h-4 w-4 shrink-0" />
            <span>Category added successfully!</span>
          </div>
        )}
      </div>

      {/* Category Budgets Card Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent-coral-tint)] text-[var(--accent-coral-text)] border border-[var(--accent-coral-border)]">
              <Coins className="h-4 w-4 stroke-[2.2]" />
            </div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text)]">
              Monthly Category Limits ({formattedMonthLabel})
            </h2>
          </div>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[var(--surface-input)] border border-[var(--border)] text-[var(--text-muted)]">
            {budgets.length} {budgets.length === 1 ? 'category' : 'categories'}
          </span>
        </div>

        {/* Loading State */}
        {isBudgetsLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-44 rounded-3xl bg-[var(--surface)] border border-[var(--border)]" />
            ))}
          </div>
        )}

        {/* Error State */}
        {isBudgetsError && (
          <div className="rounded-3xl border border-[var(--accent-rose-border)] bg-[var(--accent-rose-tint)] p-8 text-center shadow-glass">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-rose)] text-white mb-2 shadow-xs">
              <AlertCircle className="h-5 w-5" />
            </div>
            <p className="text-sm font-bold text-[var(--accent-rose-text)]">Failed to load category budgets</p>
            <button
              onClick={() => refetch()}
              className="mt-3 btn-primary inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Try Again
            </button>
          </div>
        )}

        {/* Card Grid: One Card per Category */}
        {!isBudgetsLoading && !isBudgetsError && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {budgets.map((item) => {
              const currentInputValue =
                editedLimits[item.categoryId] !== undefined
                  ? editedLimits[item.categoryId]
                  : item.limitAmount?.toString() ?? '';

              const isSaving = savingCategoryIds[item.categoryId];
              const isSaved = savedCategoryIds[item.categoryId];
              const hasChanged =
                editedLimits[item.categoryId] !== undefined &&
                editedLimits[item.categoryId] !== (item.limitAmount?.toString() ?? '');
              const rowError = rowErrors[item.categoryId];

              // Spending info for mini progress bar
              const spending = spendingMap.get(item.categoryId);
              const spent = spending?.spent ?? 0;
              const limit = item.limitAmount;
              const percentUsed =
                limit !== null && limit > 0
                  ? (spent / limit) * 100
                  : null;

              // Color for mini progress bar
              const barFillColor =
                percentUsed === null
                  ? 'bg-[var(--border-strong)]'
                  : percentUsed >= 100
                  ? 'bg-[var(--accent-rose)]'
                  : percentUsed >= 80
                  ? 'bg-[var(--accent-coral)]'
                  : 'bg-[var(--accent-teal)]';

              const clampedPercent = percentUsed !== null ? Math.min(Math.max(percentUsed, 0), 100) : 0;

              return (
                <div
                  key={item.categoryId}
                  className="rounded-3xl glass-card p-5 border border-[var(--border)] shadow-glass flex flex-col justify-between gap-4 transition-all hover:bg-[var(--surface-hover)]"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[var(--accent-teal-tint)] text-[var(--accent-teal-text)] border border-[var(--accent-teal-border)]">
                        <Tag className="h-4 w-4 stroke-[2.2]" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-[var(--text)] text-sm">{item.categoryName}</h3>
                        <p className="text-[11px] text-[var(--text-subtle)] font-medium">
                          {limit !== null ? `Limit: ${formatCurrency(limit)}` : 'No limit set'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      id={`delete-category-btn-${item.categoryId}`}
                      onClick={() => {
                        if (
                          window.confirm(
                            `Are you sure you want to delete category "${item.categoryName}"? Note: Categories with transactions cannot be deleted.`
                          )
                        ) {
                          deleteCategoryMutation.mutate(item.categoryId);
                        }
                      }}
                      title="Delete category"
                      className="rounded-xl p-1.5 text-[var(--text-subtle)] hover:bg-[var(--accent-rose-tint)] hover:text-[var(--accent-rose-text)] transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Mini Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[var(--text-muted)] text-[11px] font-bold">
                        Spent: {formatCurrency(spent)}
                      </span>
                      {percentUsed !== null && (
                        <span
                          className={`font-mono text-xs font-extrabold ${
                            percentUsed >= 100
                              ? 'text-[var(--accent-rose-text)]'
                              : percentUsed >= 80
                              ? 'text-[var(--accent-coral-text)]'
                              : 'text-[var(--accent-teal-text)]'
                          }`}
                        >
                          {percentUsed.toFixed(1)}%
                        </span>
                      )}
                    </div>
                    <div 
                      className="h-2 w-full overflow-hidden rounded-full bg-[var(--border-strong)]/30"
                      role="progressbar"
                      aria-valuenow={clampedPercent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div
                        className={`h-full rounded-full transition-all duration-500 ease-out ${barFillColor}`}
                        style={{ width: `${clampedPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Inline Limit Editor Input & Actions */}
                  <div className="pt-3 border-t border-[var(--border)]">
                    <label 
                      htmlFor={`budget-limit-input-${item.categoryId}`} 
                      className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1"
                    >
                      Monthly Limit
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--text-subtle)]">
                          {CURRENCY_SYMBOL}
                        </span>
                        <input
                          id={`budget-limit-input-${item.categoryId}`}
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="No limit"
                          value={currentInputValue}
                          onChange={(e) =>
                            handleLimitChange(item.categoryId, e.target.value)
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSaveBudget(item);
                            }
                          }}
                          className={`w-full rounded-2xl border bg-[var(--surface-input)] py-2 pl-7 pr-3 text-xs font-bold text-[var(--text)] transition focus:bg-[var(--surface-solid)] focus:outline-none focus:ring-2 ${
                            rowError
                              ? 'border-[var(--accent-rose)] focus:ring-[var(--accent-rose-border)]'
                              : 'border-[var(--border)] focus:border-[var(--accent-teal)] focus:ring-[var(--accent-teal-border)]'
                          }`}
                        />
                      </div>

                      {/* Save Button */}
                      <button
                        type="button"
                        id={`save-budget-btn-${item.categoryId}`}
                        onClick={() => handleSaveBudget(item)}
                        disabled={isSaving}
                        title="Save budget limit"
                        className={`inline-flex items-center justify-center rounded-2xl p-2.5 text-xs font-bold transition active:scale-95 cursor-pointer ${
                          isSaved
                            ? 'bg-[var(--accent-teal-tint)] text-[var(--accent-teal-text)] border border-[var(--accent-teal-border)]'
                            : hasChanged
                            ? 'btn-primary shadow-xs'
                            : 'bg-[var(--surface-input)] border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]'
                        }`}
                      >
                        {isSaving ? (
                          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[var(--accent-teal-text)] border-t-transparent" />
                        ) : isSaved ? (
                          <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                        ) : (
                          <Sparkles className="h-3.5 w-3.5" />
                        )}
                      </button>

                      {/* Clear Button */}
                      {item.limitAmount !== null && (
                        <button
                          type="button"
                          id={`clear-budget-btn-${item.categoryId}`}
                          onClick={() => handleClearBudget(item)}
                          disabled={isSaving}
                          title="Remove limit for this month"
                          className="rounded-2xl p-2.5 text-[var(--text-subtle)] hover:bg-[var(--accent-rose-tint)] hover:text-[var(--accent-rose-text)] border border-[var(--border)] bg-[var(--surface-input)] transition cursor-pointer"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    {rowError && (
                      <p className="mt-1 text-[11px] font-semibold text-[var(--accent-rose-text)]">
                        {rowError}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
