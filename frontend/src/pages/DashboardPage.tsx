import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { summaryApi } from '../api/summary';
import { StatCard } from '../components/StatCard';
import { BudgetBar } from '../components/BudgetBar';
import { BudgetWarningBanner } from '../components/BudgetWarningBanner';
import { formatCurrency, CURRENCY_SYMBOL } from '../constants/currency';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  AlertCircle,
  RefreshCw,
  PieChart as PieChartIcon,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const getCurrentMonth = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  const [month, setMonth] = useState<string>(getCurrentMonth());

  const handlePrevMonth = () => {
    const [year, m] = month.split('-').map(Number);
    const date = new Date(year, m - 2, 1);
    const y = date.getFullYear();
    const newM = String(date.getMonth() + 1).padStart(2, '0');
    setMonth(`${y}-${newM}`);
  };

  const handleNextMonth = () => {
    const [year, m] = month.split('-').map(Number);
    const date = new Date(year, m, 1);
    const y = date.getFullYear();
    const newM = String(date.getMonth() + 1).padStart(2, '0');
    setMonth(`${y}-${newM}`);
  };

  // The ONLY data source for the dashboard is the /summary endpoint per prompt
  const {
    data: summary,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['summary', month],
    queryFn: () => summaryApi.getSummary(month),
  });

  // Chart data: categories with spending > 0
  const chartData = (summary?.categories || [])
    .filter((c) => c.spent > 0)
    .sort((a, b) => b.spent - a.spent)
    .map((c) => ({
      name: c.name,
      spent: c.spent,
      limit: c.limit,
      status: c.status,
    }));

  const CHART_COLORS = [
    '#6366f1', // Indigo
    '#3b82f6', // Blue
    '#06b6d4', // Cyan
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#f43f5e', // Rose
    '#8b5cf6', // Purple
    '#ec4899', // Pink
  ];

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
      {/* Top Header & Month Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Financial Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Overview for <span className="font-semibold text-slate-700">{formattedMonthLabel}</span>
          </p>
        </div>

        {/* Month Selector Bar */}
        <div className="flex items-center gap-1.5 rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-xs">
          <button
            type="button"
            id="prev-month-btn"
            onClick={handlePrevMonth}
            className="rounded-xl p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
            title="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="relative flex items-center px-2">
            <Calendar className="pointer-events-none mr-2 h-4 w-4 text-slate-400" />
            <input
              id="dashboard-month-input"
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="border-none bg-transparent py-1 text-xs font-semibold text-slate-800 focus:outline-none"
            />
          </div>

          <button
            type="button"
            id="next-month-btn"
            onClick={handleNextMonth}
            className="rounded-xl p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
            title="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 rounded-2xl bg-slate-200" />
            ))}
          </div>
          <div className="h-64 rounded-2xl bg-slate-200" />
          <div className="h-64 rounded-2xl bg-slate-200" />
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 mb-3">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-rose-900">Failed to load dashboard summary</h3>
          <p className="text-sm text-rose-600 mt-1 max-w-md mx-auto">
            {(error as Error)?.message || 'Unable to retrieve summary data for this month.'}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-rose-700 transition"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      )}

      {/* Summary Content */}
      {summary && !isLoading && !isError && (
        <>
          {/* 1. Warning Banner at the Top */}
          <BudgetWarningBanner categories={summary.categories} />

          {/* 2. Stat Cards for Income, Expenses, Balance */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <StatCard
              title="Total Income"
              amount={formatCurrency(summary.totalIncome, true)}
              subtitle={`Recorded in ${formattedMonthLabel}`}
              icon={TrendingUp}
              variant="income"
            />
            <StatCard
              title="Total Expenses"
              amount={formatCurrency(summary.totalExpenses, true)}
              subtitle={`Recorded in ${formattedMonthLabel}`}
              icon={TrendingDown}
              variant="expense"
            />
            <StatCard
              title="Net Balance"
              amount={formatCurrency(summary.balance)}
              subtitle={
                summary.balance >= 0
                  ? 'Positive cash flow this month'
                  : 'Negative balance this month'
              }
              icon={Wallet}
              variant="balance"
            />
          </div>

          {/* 3. Main Dashboard Grid: Spending Chart & Category Budget Bars */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Recharts Bar Chart */}
            <div className="lg:col-span-7 rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <PieChartIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Spending by Category
                    </h2>
                    <p className="text-xs text-slate-500">
                      Expense distribution for {formattedMonthLabel}
                    </p>
                  </div>
                </div>
              </div>

              {chartData.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
                  <p className="text-sm font-semibold text-slate-700">No expenses recorded</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Add expense transactions to see the visual category breakdown.
                  </p>
                </div>
              ) : (
                <div className="h-72 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 10, right: 10, left: 0, bottom: 25 }}
                    >
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        interval={0}
                        angle={-20}
                        textAnchor="end"
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        tickFormatter={(val) => `${CURRENCY_SYMBOL}${val}`}
                      />
                      <Tooltip
                        formatter={(val: any) => [
                          formatCurrency(Number(val ?? 0)),
                          'Spent',
                        ]}
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="spent" radius={[6, 6, 0, 0]}>
                        {chartData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Category Budget Bars List */}
            <div className="lg:col-span-5 rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Budget Progress
                    </h2>
                    <p className="text-xs text-slate-500">
                      Live status vs monthly limits
                    </p>
                  </div>
                </div>
              </div>

              {summary.categories.length === 0 ? (
                <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
                  <p className="text-sm font-semibold text-slate-700">No categories found</p>
                </div>
              ) : (
                <div className="space-y-3 overflow-y-auto max-h-[380px] pr-1">
                  {summary.categories.map((c) => (
                    <BudgetBar key={c.categoryId} category={c} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
