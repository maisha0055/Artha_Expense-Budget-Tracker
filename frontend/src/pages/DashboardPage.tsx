import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { summaryApi } from '../api/summary';
import { StatCard } from '../components/StatCard';
import { BudgetBar } from '../components/BudgetBar';
import { BudgetWarningBanner } from '../components/BudgetWarningBanner';
import { formatCurrency, CURRENCY_SYMBOL } from '../constants/currency';
import { useTheme } from '../theme/useTheme';
import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Calendar,
  AlertCircle,
  RefreshCw,
  BarChart3,
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

const getCurrentMonth = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export const DashboardPage: React.FC = () => {
  const [month, setMonth] = useState<string>(getCurrentMonth);
  const { resolvedTheme } = useTheme();

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

  // The ONLY data source for the dashboard is the /summary endpoint
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

  // Theme-aware chart colors
  const CHART_COLORS = resolvedTheme === 'dark'
    ? [
        '#40bfc1', // Teal
        '#ff6f5e', // Coral
        '#ff6b8b', // Accessible rose tint
        '#5ce1e3', // Bright teal
        '#ff8e80', // Soft coral
        '#38bdf8', // Sky
        '#fb7185', // Soft rose
      ]
    : [
        '#40bfc1', // Teal
        '#ff6f5e', // Coral
        '#f0134d', // Rose
        '#259f9f', // Deep teal
        '#e85a4a', // Darker coral
        '#58ced0', // Bright teal
        '#c90d3e', // Deep rose
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
      {/* Top Header & Styled Month Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-black tracking-widest text-[var(--accent-rose-text)] uppercase">
            ARTHA INSIGHTS
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text)]">
            Financial Dashboard
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            Overview for <span className="font-bold text-[var(--text)]">{formattedMonthLabel}</span>
          </p>
        </div>

        {/* Month Selector Bar */}
        <div className="flex items-center gap-1.5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] backdrop-blur-md p-1.5 shadow-xs">
          <button
            type="button"
            id="prev-month-btn"
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
              id="dashboard-month-input"
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="border-none bg-transparent py-1 text-xs font-bold text-[var(--text)] focus:outline-none cursor-pointer"
            />
          </div>

          <button
            type="button"
            id="next-month-btn"
            onClick={handleNextMonth}
            className="rounded-xl p-2 text-[var(--text-muted)] hover:bg-[var(--accent-teal-tint)] hover:text-[var(--accent-teal-text)] transition cursor-pointer"
            title="Next month"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4 stroke-[2.2]" />
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 rounded-3xl bg-[var(--surface)] border border-[var(--border)]" />
            ))}
          </div>
          <div className="h-72 rounded-3xl bg-[var(--surface)] border border-[var(--border)]" />
          <div className="h-72 rounded-3xl bg-[var(--surface)] border border-[var(--border)]" />
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="rounded-3xl border border-[var(--accent-rose-border)] bg-[var(--accent-rose-tint)] p-8 text-center shadow-glass">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-rose)] text-white mb-3 shadow-rose-glow">
            <AlertCircle className="h-6 w-6 stroke-[2.2]" />
          </div>
          <h2 className="text-base font-bold text-[var(--accent-rose-text)]">
            Failed to load dashboard summary
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1 max-w-md mx-auto">
            {(error as Error)?.message || 'Unable to retrieve financial summary for this month.'}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 btn-primary inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            Retry Query
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
              icon={ArrowUpRight}
              variant="income"
            />
            <StatCard
              title="Total Expenses"
              amount={formatCurrency(summary.totalExpenses, true)}
              subtitle={`Recorded in ${formattedMonthLabel}`}
              icon={ArrowDownRight}
              variant="expense"
            />
            <StatCard
              title="Net Balance"
              amount={formatCurrency(summary.balance)}
              subtitle={
                summary.balance >= 0
                  ? 'Positive savings this month'
                  : 'Deficit spending this month'
              }
              icon={Wallet}
              variant="balance"
            />
          </div>

          {/* 3. Main Dashboard Grid: Spending Chart & Category Budget Bars */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Recharts Bar Chart */}
            <div className="lg:col-span-7 rounded-3xl glass-card p-6 shadow-glass border border-[var(--border)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent-teal-tint)] text-[var(--accent-teal-text)] border border-[var(--accent-teal-border)]">
                    <BarChart3 className="h-5 w-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-[var(--text)]">
                      Spending by Category
                    </h2>
                    <p className="text-xs text-[var(--text-muted)]">
                      Expense distribution for {formattedMonthLabel}
                    </p>
                  </div>
                </div>
              </div>

              {chartData.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--surface)] p-6 text-center">
                  <p className="text-sm font-bold text-[var(--text)]">No expenses recorded</p>
                  <p className="text-xs text-[var(--text-subtle)] mt-1">
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
                        tick={{
                          fontSize: 11,
                          fill: resolvedTheme === 'dark' ? 'rgba(245, 240, 227, 0.70)' : '#3a595d',
                          fontWeight: 600,
                        }}
                        interval={0}
                        angle={-20}
                        textAnchor="end"
                      />
                      <YAxis
                        tick={{
                          fontSize: 11,
                          fill: resolvedTheme === 'dark' ? 'rgba(245, 240, 227, 0.70)' : '#3a595d',
                          fontWeight: 600,
                        }}
                        tickFormatter={(val) => `${CURRENCY_SYMBOL}${val}`}
                      />
                      <Tooltip
                        formatter={(val: unknown) => [
                          formatCurrency(Number(val ?? 0)),
                          'Spent',
                        ]}
                        contentStyle={{
                          backgroundColor: resolvedTheme === 'dark' ? '#10292e' : 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(10px)',
                          borderRadius: '16px',
                          border: resolvedTheme === 'dark' ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(18, 53, 58, 0.12)',
                          boxShadow: resolvedTheme === 'dark' ? '0 10px 25px -4px rgba(0, 0, 0, 0.5)' : '0 10px 25px -4px rgba(18, 53, 58, 0.08)',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: resolvedTheme === 'dark' ? '#f5f0e3' : '#12353a',
                        }}
                      />
                      <Bar dataKey="spent" radius={[8, 8, 0, 0]}>
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
            <div className="lg:col-span-5 rounded-3xl glass-card p-6 shadow-glass border border-[var(--border)] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent-coral-tint)] text-[var(--accent-coral-text)] border border-[var(--accent-coral-border)]">
                    <ShieldCheck className="h-5 w-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-[var(--text)]">
                      Budget Progress
                    </h2>
                    <p className="text-xs text-[var(--text-muted)]">
                      Real-time status vs monthly limits
                    </p>
                  </div>
                </div>
              </div>

              {summary.categories.length === 0 ? (
                <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--surface)] p-6 text-center">
                  <p className="text-sm font-bold text-[var(--text)]">No categories found</p>
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
