import React, { useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { ToastContext } from './ToastContext';
import type { ToastItem, ToastType } from './ToastContext';

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info', title?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* Toast container */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none p-2"
      >
        {toasts.map((toast) => {
          const typeConfig = {
            success: {
              border: 'border-[var(--accent-teal-border)]',
              bg: 'bg-[var(--surface-solid)]/95',
              icon: CheckCircle2,
              iconColor: 'text-[var(--accent-teal-text)]',
              titleColor: 'text-[var(--accent-teal-text)]',
              tint: 'bg-[var(--accent-teal-tint)]',
            },
            error: {
              border: 'border-[var(--accent-rose-border)]',
              bg: 'bg-[var(--surface-solid)]/95',
              icon: AlertCircle,
              iconColor: 'text-[var(--accent-rose)]',
              titleColor: 'text-[var(--accent-rose-text)]',
              tint: 'bg-[var(--accent-rose-tint)]',
            },
            warning: {
              border: 'border-[var(--accent-coral-border)]',
              bg: 'bg-[var(--surface-solid)]/95',
              icon: AlertTriangle,
              iconColor: 'text-[var(--accent-coral)]',
              titleColor: 'text-[var(--accent-coral-text)]',
              tint: 'bg-[var(--accent-coral-tint)]',
            },
            info: {
              border: 'border-[var(--border-strong)]',
              bg: 'bg-[var(--surface-solid)]/95',
              icon: Info,
              iconColor: 'text-[var(--accent-teal-text)]',
              titleColor: 'text-[var(--text)]',
              tint: 'bg-[var(--accent-teal-tint)]',
            },
          }[toast.type];

          const Icon = typeConfig.icon;

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 rounded-2xl border ${typeConfig.border} ${typeConfig.bg} backdrop-blur-md p-4 shadow-glass transition-all duration-200 animate-in slide-in-from-bottom-3`}
            >
              <div className={`p-1.5 rounded-xl ${typeConfig.tint} shrink-0 mt-0.5`}>
                <Icon className={`h-4 w-4 ${typeConfig.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                {toast.title && (
                  <p className={`text-xs font-bold tracking-tight ${typeConfig.titleColor}`}>
                    {toast.title}
                  </p>
                )}
                <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed break-words">
                  {toast.message}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="rounded-lg p-1 text-[var(--text-subtle)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)] transition cursor-pointer"
                aria-label="Dismiss toast"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
