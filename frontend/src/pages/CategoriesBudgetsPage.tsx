import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetsApi } from '../api/budgets';
import { categoriesApi } from '../api/categories';
import { CURRENCY_SYMBOL } from '../constants/currency';
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

export const CategoriesBudgetsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const getCurrentMonth = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  const [month, setMonth] = useState<string>(getCurrentMonth());
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
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['budgets', month],
    queryFn: () => budgetsApi.getAll(month),
  });

  // Set/Update Budget Mutation
  const setBudgetMutation = useMutation({
    mutationFn: budgetsApi.setBudget,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['budgets', month] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });

      setSavedCategoryIds((prev) => ({ ...prev, [variables.categoryId]: true }));
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
      setTimeout(() => setAddCategorySuccess(false), 2500);
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { detail?: string; title?: string } } })?.response?.data?.detail ||
        (err as { response?: { data?: { detail?: string; title?: string } } })?.response?.data?.title ||
        'Failed to create category. Name may already exist.';
      setAddCategoryError(msg);
    },
  });

  // Delete Category Mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: categoriesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { detail?: string; title?: string } } })?.response?.data?.detail ||
        'Cannot delete category with existing transactions.';
      alert(msg);
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Categories & Monthly Budgets
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your spending categories and set monthly expense targets for{' '}
            <span className="font-semibold text-slate-700">{formattedMonthLabel}</span>.
          </p>
        </div>

        {/* Month Selector Bar */}
        <div className="flex items-center gap-1.5 rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-xs">
          <button
            type="button"
            id="budget-prev-month-btn"
            onClick={handlePrevMonth}
            className="rounded-xl p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
            title="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="relative flex items-center px-2">
            <Calendar className="pointer-events-none mr-2 h-4 w-4 text-slate-400" />
            <input
              id="budget-month-input"
              type="month"
              value={month}
              onChange={(e) => {
                setMonth(e.target.value);
                setEditedLimits({});
              }}
              className="border-none bg-transparent py-1 text-xs font-semibold text-slate-800 focus:outline-none"
            />
          </div>

          <button
            type="button"
            id="budget-next-month-btn"
            onClick={handleNextMonth}
            className="rounded-xl p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
            title="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Add Category Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Tag className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Create New Category</h2>
            <p className="text-xs text-slate-500">
              Add custom categories to organize your expenses and budgets.
            </p>
          </div>
        </div>

        <form onSubmit={handleAddCategorySubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Tag className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
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
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-3.5 text-sm text-slate-900 transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <button
            type="submit"
            id="add-category-btn"
            disabled={createCategoryMutation.isPending}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.99] transition disabled:opacity-50"
          >
            {createCategoryMutation.isPending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Add Category
          </button>
        </form>

        {addCategoryError && (
          <div className="mt-2.5 flex items-center gap-2 text-xs font-medium text-rose-600 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{addCategoryError}</span>
          </div>
        )}

        {addCategorySuccess && (
          <div className="mt-2.5 flex items-center gap-2 text-xs font-semibold text-emerald-600 animate-in fade-in">
            <Check className="h-4 w-4 shrink-0" />
            <span>Category added successfully!</span>
          </div>
        )}
      </div>

      {/* Category Budgets Table / Cards */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
        <div className="border-b border-slate-200/80 bg-slate-50/75 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-indigo-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Monthly Category Limits ({formattedMonthLabel})
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            {budgets.length} {budgets.length === 1 ? 'category' : 'categories'}
          </span>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="p-8 space-y-4 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 rounded-xl bg-slate-100" />
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="p-8 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 mb-2">
              <AlertCircle className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold text-rose-700">Failed to load category budgets</p>
            <button
              onClick={() => refetch()}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Try Again
            </button>
          </div>
        )}

        {/* Content Table */}
        {!isLoading && !isError && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-100 bg-slate-50/50 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="px-6 py-3.5">Category Name</th>
                  <th className="px-6 py-3.5">Monthly Budget Limit</th>
                  <th className="px-6 py-3.5 text-right">Inline Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
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

                  return (
                    <tr
                      key={item.categoryId}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      {/* Category Name */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800">
                            {item.categoryName}
                          </span>
                        </div>
                      </td>

                      {/* Inline Editable Limit Input */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 max-w-xs">
                          <div className="relative flex-1">
                            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
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
                              className={`w-full rounded-xl border bg-slate-50/50 py-1.5 pl-8 pr-3 text-xs font-mono text-slate-900 transition focus:bg-white focus:outline-none focus:ring-2 ${
                                rowError
                                  ? 'border-rose-300 focus:ring-rose-200'
                                  : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'
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
                            className={`inline-flex items-center justify-center rounded-xl p-2 text-xs font-semibold transition active:scale-95 ${
                              isSaved
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                : hasChanged
                                ? 'bg-indigo-600 text-white shadow-2xs hover:bg-indigo-700'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
                            }`}
                          >
                            {isSaving ? (
                              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                            ) : isSaved ? (
                              <Check className="h-3.5 w-3.5" />
                            ) : (
                              <Sparkles className="h-3.5 w-3.5" />
                            )}
                          </button>

                          {/* Clear Budget Button */}
                          {item.limitAmount !== null && (
                            <button
                              type="button"
                              id={`clear-budget-btn-${item.categoryId}`}
                              onClick={() => handleClearBudget(item)}
                              disabled={isSaving}
                              title="Remove limit for this month"
                              className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>

                        {rowError && (
                          <p className="mt-1 text-[11px] font-medium text-rose-600">
                            {rowError}
                          </p>
                        )}
                      </td>

                      {/* Row Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
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
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
