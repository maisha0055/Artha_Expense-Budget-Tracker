import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

const CURRENT_YEAR = new Date().getFullYear();

export const Layout: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-[var(--bg-page)] text-[var(--text)] flex flex-col font-sans selection:bg-[var(--accent-teal-tint)] selection:text-[var(--accent-teal-text)] overflow-x-hidden transition-colors duration-200">
      {/* Decorative ambient background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        {/* Teal blob top-left */}
        <div 
          className="absolute -top-32 -left-32 w-96 sm:w-[520px] h-96 sm:h-[520px] rounded-full blur-3xl"
          style={{ 
            background: 'radial-gradient(circle, var(--accent-teal) 0%, transparent 70%)',
            opacity: 'var(--blob-teal-opacity)'
          }}
        />
        {/* Coral/Rose blob bottom-right */}
        <div 
          className="absolute -bottom-32 -right-32 w-96 sm:w-[560px] h-96 sm:h-[560px] rounded-full blur-3xl"
          style={{ 
            background: 'radial-gradient(circle, var(--accent-coral) 0%, var(--accent-rose) 60%, transparent 80%)',
            opacity: 'var(--blob-coral-opacity)'
          }}
        />
      </div>

      {/* Navigation (Sidebar for desktop, header/tabs for mobile) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col md:ml-64 transition-all">
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 md:pb-10">
          <Outlet />
        </main>

        <footer className="border-t border-[var(--border)] bg-[var(--surface)] backdrop-blur-md py-6 text-xs text-[var(--text-subtle)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <p>© {CURRENT_YEAR} ARTHA. All rights reserved.</p>
            <p className="text-[var(--text-muted)] font-medium">Personal Budgeting & Expense System</p>
          </div>
        </footer>
      </div>
    </div>
  );
};
