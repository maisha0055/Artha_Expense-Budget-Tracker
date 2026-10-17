import React from 'react';
import { useAuth } from '../auth/AuthContext';
import { LayoutDashboard } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Welcome back, <span className="font-semibold text-slate-700">{user?.name}</span>! Here is your financial overview.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-4">
          <LayoutDashboard className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900">Protected Dashboard Active</h2>
        <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
          You are securely authenticated as <span className="font-medium text-slate-700">{user?.email}</span>. Next prompt will connect the live budget cards, charts, and warnings banner!
        </p>
      </div>
    </div>
  );
};
