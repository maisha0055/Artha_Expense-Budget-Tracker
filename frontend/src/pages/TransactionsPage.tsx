import React from 'react';
import { Receipt } from 'lucide-react';

export const TransactionsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Transactions</h1>
        <p className="text-sm text-slate-500 mt-1">Manage and filter your income and expense transactions</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-4">
          <Receipt className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900">Transactions Section</h2>
        <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
          Filterable table, pagination, and modal forms for adding and editing transactions.
        </p>
      </div>
    </div>
  );
};
