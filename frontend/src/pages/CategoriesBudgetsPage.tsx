import React from 'react';
import { PiggyBank } from 'lucide-react';

export const CategoriesBudgetsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Categories & Budgets</h1>
        <p className="text-sm text-slate-500 mt-1">Configure your expense categories and monthly spending limits</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-4">
          <PiggyBank className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900">Categories & Budgets Section</h2>
        <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
          Manage your custom categories, add new ones, and set monthly limits.
        </p>
      </div>
    </div>
  );
};
