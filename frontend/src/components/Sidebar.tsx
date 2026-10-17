import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { ThemeToggle } from '../theme/ThemeToggle';
import { 
  LayoutDashboard, 
  Receipt, 
  PiggyBank, 
  LogOut, 
  Wallet,
  User as UserIcon,
  Menu,
  X
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Transactions', path: '/transactions', icon: Receipt },
    { name: 'Categories & Budgets', path: '/categories-budgets', icon: PiggyBank },
  ];

  const getLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-150 ${
      isActive
        ? 'bg-[var(--accent-rose-tint)] text-[var(--accent-rose-text)] border border-[var(--accent-rose-border)] shadow-xs'
        : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]'
    }`;

  const getMobileTabClasses = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center justify-center gap-1 py-1.5 px-2 text-xs font-bold rounded-xl transition-colors ${
      isActive
        ? 'text-[var(--accent-rose-text)]'
        : 'text-[var(--text-subtle)] hover:text-[var(--text)]'
    }`;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col justify-between fixed top-0 left-0 bottom-0 w-64 border-r border-[var(--border)] bg-[var(--surface)] backdrop-blur-2xl z-30 p-5 shadow-glass">
        <div className="flex flex-col gap-7">
          {/* Brand Header */}
          <div className="flex items-center gap-3 px-2 pt-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#df0c42] to-[#ff6f5e] text-white shadow-rose-glow">
              <Wallet className="h-6 w-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-wider text-[var(--text)]">
                ARTHA
              </span>
              <p className="text-[11px] font-medium text-[var(--text-subtle)]">
                Expense & Budget
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink key={link.path} to={link.path} className={getLinkClasses}>
                  <Icon className="h-5 w-5 stroke-[2]" />
                  <span>{link.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Theme Toggle, User Card & Logout */}
        <div className="border-t border-[var(--border)] pt-4 flex flex-col gap-3.5">
          {/* Theme Selector */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-subtle)] px-1">
              Appearance
            </span>
            <ThemeToggle variant="segmented" />
          </div>

          {user && (
            <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent-teal-tint)] text-[var(--accent-teal-text)] border border-[var(--accent-teal-border)]">
                <UserIcon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs font-bold text-[var(--text)] truncate leading-snug">
                  {user.name}
                </p>
                <p className="text-[11px] text-[var(--text-subtle)] truncate">
                  {user.email}
                </p>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-xl text-xs font-bold text-[var(--accent-rose-text)] bg-[var(--accent-rose-tint)] border border-[var(--accent-rose-border)] hover:opacity-90 transition-all cursor-pointer"
            title="Log out of session"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-30 w-full border-b border-[var(--border)] bg-[var(--surface-solid)]/90 backdrop-blur-xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#df0c42] to-[#ff6f5e] text-white shadow-sm">
            <Wallet className="h-5 w-5" />
          </div>
          <span className="text-lg font-extrabold tracking-wider text-[var(--text)]">
            ARTHA
          </span>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle variant="compact" />
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="p-2 rounded-xl text-[var(--text)] bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--surface-hover)] focus:outline-none cursor-pointer"
            aria-label="Open mobile menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative ml-auto w-3/4 max-w-xs h-full bg-[var(--bg-page)] border-l border-[var(--border)] p-6 shadow-2xl flex flex-col justify-between z-10">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <span className="font-extrabold text-[var(--text)]">Menu</span>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 rounded-xl text-[var(--text-muted)] hover:bg-[var(--surface-hover)]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex flex-col gap-2">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      onClick={() => setMobileDrawerOpen(false)}
                      className={getLinkClasses}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{link.name}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            <div className="border-t border-[var(--border)] pt-4 flex flex-col gap-3.5">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-subtle)] px-1">
                  Appearance
                </span>
                <ThemeToggle variant="segmented" />
              </div>

              {user && (
                <div className="p-3 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
                  <p className="text-xs font-bold text-[var(--text)]">{user.name}</p>
                  <p className="text-[11px] text-[var(--text-subtle)]">{user.email}</p>
                </div>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold text-[var(--accent-rose-text)] bg-[var(--accent-rose-tint)] border border-[var(--accent-rose-border)] cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-[var(--border)] bg-[var(--surface-solid)]/90 backdrop-blur-xl px-2 py-1.5 flex items-center justify-around shadow-lg">
        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink key={link.path} to={link.path} className={getMobileTabClasses}>
              <Icon className="h-5 w-5" />
              <span>{link.name.replace('Categories & Budgets', 'Budgets')}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
};
