import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidthClass?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidthClass = 'max-w-lg',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/50 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        className={`w-full ${maxWidthClass} rounded-3xl bg-[var(--surface-solid)] backdrop-blur-2xl shadow-glass border border-[var(--border-strong)] p-6 sm:p-8 animate-in zoom-in-95 duration-200 relative my-8 text-[var(--text)]`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[var(--border)]">
          <div>
            <h2 id="modal-title" className="text-xl font-extrabold tracking-tight text-[var(--text)]">
              {title}
            </h2>
            {description && (
              <p className="text-xs text-[var(--text-muted)] mt-1 font-medium">{description}</p>
            )}
          </div>
          <button
            id="modal-close-btn"
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-[var(--text-subtle)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)] transition-colors focus:outline-none cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="pt-4">{children}</div>
      </div>
    </div>
  );
};
