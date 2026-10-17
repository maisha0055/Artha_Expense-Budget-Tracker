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
import { useToast } from '../components/useToast';

const getCurrentMonth = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export const TransactionsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // Filter states
  const [month, setMonth] = useState<string>(getCurrentMonth);
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
      showToast('Transaction recorded successfully!', 'success');
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { detail?: string; title?: string } } })?.response?.data?.detail ||
        'Failed to record transaction.';
      showToast(msg, 'error');
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
      showToast('Transaction updated successfully!', 'success');
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { detail?: string; title?: string } } })?.response?.data?.detail ||
        'Failed to update transaction.';
      showToast(msg, 'error');
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => transactionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      setDeletingTransaction(null);
      showToast('Transaction deleted successfully.', 'info');
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { detail?: string; title?: string } } })?.response?.data?.detail ||
        'Failed to delete transaction.';
      showToast(msg, 'error');
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
          <span className="text-xs font-black tracking-widest text-[var(--accent-rose-text)] uppercase">
            RECORDS & AUDIT
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text)]">
            Transactions
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            Filter, search, and manage all income and expense history.
          </p>
        </div>

        <button
          type="button"
          id="add-transaction-btn"
          onClick={handleOpenAdd}
          className="btn-primary inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold shadow-rose-glow cursor-pointer"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* Modern Glass Filters Bar */}
      <div className="rounded-3xl glass-card p-5 border border-[var(--border)] shadow-glass space-y-3">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            <Filter className="h-3.5 w-3.5 text-[var(--accent-teal-text)]" />
            Filters & Search
          </div>

          {(month !== getCurrentMonth() || categoryId !== '' || type !== '') && (
            <button
              type="button"
              id="reset-filters-btn"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent-teal-text)] hover:text-[var(--accent-rose)] transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              Reset Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Month Filter */}
          <div>
            <label htmlFor="filter-month-input" className="block text-xs font-bold text-[var(--text)] mb-1">
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
                className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-input)] px-3.5 py-2 text-xs font-semibold text-[var(--text)] transition focus:border-[var(--accent-teal)] focus:bg-[var(--surface-solid)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-teal-border)] cursor-pointer"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label htmlFor="filter-category-select" className="block text-xs font-bold text-[var(--text)] mb-1">
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
                className="w-full appearance-none rounded-2xl border border-[var(--border)] bg-[var(--surface-input)] px-3.5 py-2 pr-8 text-xs font-semibold text-[var(--text)] transition focus:border-[var(--accent-teal)] focus:bg-[var(--surface-solid)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-teal-border)] cursor-pointer"
              >
                <option value="" className="bg-[var(--surface-solid)] text-[var(--text)]">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[var(--surface-solid)] text-[var(--text)]">
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-subtle)]" />
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <label htmlFor="filter-type-select" className="block text-xs font-bold text-[var(--text)] mb-1">
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
                className="w-full appearance-none rounded-2xl border border-[var(--border)] bg-[var(--surface-input)] px-3.5 py-2 pr-8 text-xs font-semibold text-[var(--text)] transition focus:border-[var(--accent-teal)] focus:bg-[var(--surface-solid)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-teal-border)] cursor-pointer"
              >
                <option value="" className="bg-[var(--surface-solid)] text-[var(--text)]">All Types (Income & Expense)</option>
                <option value="Expense" className="bg-[var(--surface-solid)] text-[var(--text)]">Expense Only</option>
                <option value="Income" className="bg-[var(--surface-solid)] text-[var(--text)]">Income Only</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-subtle)]" />
            </div>
          </div>

          {/* Page Size Filter */}
          <div>
            <label htmlFor="filter-pagesize-select" className="block text-xs font-bold text-[var(--text)] mb-1">
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
                className="w-full appearance-none rounded-2xl border border-[var(--border)] bg-[var(--surface-input)] px-3.5 py-2 pr-8 text-xs font-semibold text-[var(--text)] transition focus:border-[var(--accent-teal)] focus:bg-[var(--surface-solid)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-teal-border)] cursor-pointer"
              >
                <option value={10} className="bg-[var(--surface-solid)] text-[var(--text)]">10 records</option>
                <option value={20} className="bg-[var(--surface-solid)] text-[var(--text)]">20 records</option>
                <option value={50} className="bg-[var(--surface-solid)] text-[var(--text)]">50 records</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-subtle)]" />
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

      {/* Rounded Pagination Bar */}
      {totalCount > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
          <p className="text-xs text-[var(--text-muted)] font-medium">
            Showing <span className="font-bold text-[var(--text)]">{(page - 1) * pageSize + 1}</span> to{' '}
            <span className="font-bold text-[var(--text)]">
              {Math.min(page * pageSize, totalCount)}
            </span>{' '}
            of <span className="font-bold text-[var(--text)]">{totalCount}</span> results
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="pagination-prev-btn"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="inline-flex items-center gap-1 rounded-2xl border border-[var(--border)] bg-[var(--surface-input)] px-3.5 py-2 text-xs font-bold text-[var(--text)] shadow-xs hover:bg-[var(--accent-teal-tint)] hover:text-[var(--accent-teal-text)] disabled:opacity-40 disabled:hover:bg-[var(--surface-input)] transition cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4 stroke-[2.2]" />
              Previous
            </button>

            <span className="px-3.5 py-1.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs font-bold text-[var(--text)]">
              Page {page} of {Math.max(1, totalPages)}
            </span>

            <button
              type="button"
              id="pagination-next-btn"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="inline-flex items-center gap-1 rounded-2xl border border-[var(--border)] bg-[var(--surface-input)] px-3.5 py-2 text-xs font-bold text-[var(--text)] shadow-xs hover:bg-[var(--accent-teal-tint)] hover:text-[var(--accent-teal-text)] disabled:opacity-40 disabled:hover:bg-[var(--surface-input)] transition cursor-pointer"
            >
              Next
              <ChevronRight className="h-4 w-4 stroke-[2.2]" />
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
          key={editingTransaction ? String(editingTransaction.id) : 'new'}
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
