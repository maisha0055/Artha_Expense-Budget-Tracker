import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsApi } from '../api/transactions';
import { categoriesApi } from '../api/categories';
import { TransactionTable } from '../components/TransactionTable';
import { Modal } from '../components/Modal';
import { TransactionForm } from '../components/TransactionForm';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import type {
  Transaction,
  TransactionType,
  CreateTransactionRequest,
} from '../types';
import {
  Plus,
  Filter,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';

export const TransactionsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const getCurrentMonth = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  // Filter states
  const [month, setMonth] = useState<string>(getCurrentMonth());
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [type, setType] = useState<TransactionType | ''>('');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);

  // Fetch Categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  });

  // Fetch Transactions
  const {
    data: pagedData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['transactions', { month, categoryId, type, page, pageSize }],
    queryFn: () =>
      transactionsApi.getAll({
        month: month || undefined,
        categoryId: categoryId === '' ? undefined : Number(categoryId),
        type: type === '' ? undefined : type,
        page,
        pageSize,
      }),
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateTransactionRequest) => transactionsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      setIsFormModalOpen(false);
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateTransactionRequest }) =>
      transactionsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      setEditingTransaction(null);
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => transactionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      setDeletingTransaction(null);
    },
  });

  // Handlers
  const handleOpenAdd = () => {
    setEditingTransaction(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsFormModalOpen(true);
  };

  const handleDelete = (transaction: Transaction) => {
    setDeletingTransaction(transaction);
  };

  const handleFormSubmit = async (formData: CreateTransactionRequest) => {
    if (editingTransaction) {
      await updateMutation.mutateAsync({
        id: editingTransaction.id,
        data: formData,
      });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const handleConfirmDelete = async () => {
    if (deletingTransaction) {
      await deleteMutation.mutateAsync(deletingTransaction.id);
    }
  };

  const handleResetFilters = () => {
    setMonth(getCurrentMonth());
    setCategoryId('');
    setType('');
    setPage(1);
  };

  const totalCount = pagedData?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  const transactions = pagedData?.items ?? [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Transactions
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            View, filter, and manage all your income and expense records.
          </p>
        </div>

        <button
          type="button"
          id="add-transaction-btn"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.99] transition-all"
        >
          <Plus className="h-4 w-4" />
          Add Transaction
        </button>
      </div>

      {/* Filters Bar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Filter className="h-3.5 w-3.5 text-indigo-600" />
            Filters & Search
          </div>

          {(month !== getCurrentMonth() || categoryId !== '' || type !== '') && (
            <button
              type="button"
              id="reset-filters-btn"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
            >
              <RotateCcw className="h-3 w-3" />
              Reset Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Month Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Month
            </label>
            <div className="relative">
              <input
                id="filter-month-input"
                type="month"
                value={month}
                onChange={(e) => {
                  setMonth(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-900 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Category
            </label>
            <div className="relative">
              <select
                id="filter-category-select"
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value ? Number(e.target.value) : '');
                  setPage(1);
                }}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 pr-8 text-xs text-slate-900 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Transaction Type
            </label>
            <div className="relative">
              <select
                id="filter-type-select"
                value={type}
                onChange={(e) => {
                  setType(e.target.value as TransactionType | '');
                  setPage(1);
                }}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 pr-8 text-xs text-slate-900 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                <option value="">All Types (Income & Expense)</option>
                <option value="Expense">Expense Only</option>
                <option value="Income">Income Only</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Page Size Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Items Per Page
            </label>
            <div className="relative">
              <select
                id="filter-pagesize-select"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 pr-8 text-xs text-slate-900 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                <option value={10}>10 records</option>
                <option value={20}>20 records</option>
                <option value={50}>50 records</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table Component */}
      <TransactionTable
        transactions={transactions}
        isLoading={isLoading}
        isError={isError}
        errorMessage={(error as Error)?.message}
        onRetry={() => refetch()}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddNew={handleOpenAdd}
      />

      {/* Pagination Bar */}
      {totalCount > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
          <p className="text-xs text-slate-500">
            Showing <span className="font-semibold text-slate-700 font-mono">{(page - 1) * pageSize + 1}</span> to{' '}
            <span className="font-semibold text-slate-700 font-mono">
              {Math.min(page * pageSize, totalCount)}
            </span>{' '}
            of <span className="font-semibold text-slate-700 font-mono">{totalCount}</span> results
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="pagination-prev-btn"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <span className="px-3 text-xs font-semibold text-slate-600 font-mono">
              Page {page} of {Math.max(1, totalPages)}
            </span>

            <button
              type="button"
              id="pagination-next-btn"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Transaction Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingTransaction(null);
        }}
        title={editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
        description={
          editingTransaction
            ? 'Modify details of this recorded transaction.'
            : 'Record an income or expense transaction with category and date.'
        }
      >
        <TransactionForm
          initialData={editingTransaction}
          categories={categories}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsFormModalOpen(false);
            setEditingTransaction(null);
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingTransaction}
        transaction={deletingTransaction}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeletingTransaction(null)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
