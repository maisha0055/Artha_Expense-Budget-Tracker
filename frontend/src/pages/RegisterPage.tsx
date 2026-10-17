import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { ThemeToggle } from '../theme/ThemeToggle';
import { Wallet, Lock, Mail, User, AlertCircle, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const errs: { name?: string; email?: string; password?: string } = {};

    if (!name.trim()) {
      errs.name = 'Full name is required.';
    }

    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errs.password = 'Password is required.';
    } else if (password.length < 8) {
      errs.password = 'Password must be at least 8 characters long.';
    } else if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password)) {
      errs.password = 'Password must contain at least one letter and one number.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await register({ name: name.trim(), email: email.trim(), password });
      navigate('/');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (!err.response) {
          setServerError('Cannot reach backend server. Please check if the API is running at http://localhost:5050.');
        } else {
          const data = err.response.data;
          let message = data?.detail;
          if (!message && data?.errors && typeof data.errors === 'object') {
            const list = Object.values(data.errors).flat() as string[];
            if (list.length > 0) message = list.join(' ');
          }
          if (!message) {
            message = data?.title || 'Registration failed. Please check your inputs.';
          }
          setServerError(message);
        }
      } else {
        setServerError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasMinLength = password.length >= 8;
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /\d/.test(password);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[var(--bg-page)] p-4 overflow-hidden font-sans transition-colors duration-200">
      {/* Floating Theme Toggle (Top-right corner) */}
      <div className="absolute top-5 right-5 z-20">
        <ThemeToggle variant="compact" />
      </div>

      {/* Decorative ambient background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <div 
          className="absolute -top-32 -left-32 w-96 sm:w-[500px] h-96 sm:h-[500px] rounded-full blur-3xl"
          style={{ 
            background: 'radial-gradient(circle, var(--accent-teal) 0%, transparent 70%)',
            opacity: 'var(--blob-teal-opacity)'
          }}
        />
        <div 
          className="absolute -bottom-32 -right-32 w-96 sm:w-[550px] h-96 sm:h-[550px] rounded-full blur-3xl"
          style={{ 
            background: 'radial-gradient(circle, var(--accent-coral) 0%, var(--accent-rose) 60%, transparent 80%)',
            opacity: 'var(--blob-coral-opacity)'
          }}
        />
      </div>

      {/* Centered Glass Card */}
      <div className="relative z-10 w-full max-w-md rounded-3xl glass-card p-8 sm:p-10 shadow-glass border border-[var(--border)]">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#df0c42] to-[#ff6f5e] text-white shadow-rose-glow mb-3">
            <Wallet className="h-7 w-7 stroke-[2.2]" />
          </div>
          <span className="text-xs font-black tracking-widest text-[var(--accent-rose-text)] uppercase mb-1">
            ARTHA
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text)]">
            Create Account
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Start tracking your expenses and budgets with Artha
          </p>
        </div>

        {/* Server Error Alert Banner */}
        {serverError && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl bg-[var(--accent-rose-tint)] border border-[var(--accent-rose-border)] p-4 text-xs font-medium text-[var(--accent-rose-text)] animate-in fade-in duration-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-[var(--accent-rose)] mt-0.5" />
            <p className="flex-1 leading-relaxed">{serverError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Name Field */}
          <div>
            <label htmlFor="register-name" className="block text-xs font-bold uppercase tracking-wider text-[var(--text)] mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-subtle)]" />
              <input
                id="register-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder="Jane Doe"
                className={`w-full rounded-2xl border bg-[var(--surface-input)] py-3 pl-10 pr-3.5 text-sm text-[var(--text)] transition placeholder:text-[var(--text-subtle)] focus:outline-none focus:ring-2 ${
                  errors.name
                    ? 'border-[var(--accent-rose)] focus:ring-[var(--accent-rose-border)]'
                    : 'border-[var(--border)] focus:border-[var(--accent-teal)] focus:ring-[var(--accent-teal-border)]'
                }`}
              />
            </div>
            {errors.name && (
              <p className="mt-1.5 text-xs font-semibold text-[var(--accent-rose-text)]">{errors.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="register-email" className="block text-xs font-bold uppercase tracking-wider text-[var(--text)] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-subtle)]" />
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="you@example.com"
                className={`w-full rounded-2xl border bg-[var(--surface-input)] py-3 pl-10 pr-3.5 text-sm text-[var(--text)] transition placeholder:text-[var(--text-subtle)] focus:outline-none focus:ring-2 ${
                  errors.email
                    ? 'border-[var(--accent-rose)] focus:ring-[var(--accent-rose-border)]'
                    : 'border-[var(--border)] focus:border-[var(--accent-teal)] focus:ring-[var(--accent-teal-border)]'
                }`}
              />
            </div>
            {errors.email && (
              <p className="mt-1.5 text-xs font-semibold text-[var(--accent-rose-text)]">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="register-password" className="block text-xs font-bold uppercase tracking-wider text-[var(--text)] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-subtle)]" />
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                placeholder="At least 8 characters (1 letter, 1 number)"
                className={`w-full rounded-2xl border bg-[var(--surface-input)] py-3 pl-10 pr-10 text-sm text-[var(--text)] transition placeholder:text-[var(--text-subtle)] focus:outline-none focus:ring-2 ${
                  errors.password
                    ? 'border-[var(--accent-rose)] focus:ring-[var(--accent-rose-border)]'
                    : 'border-[var(--border)] focus:border-[var(--accent-teal)] focus:ring-[var(--accent-teal-border)]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-subtle)] hover:text-[var(--text)] focus:outline-none cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-xs font-semibold text-[var(--accent-rose-text)]">{errors.password}</p>
            )}

            {/* Password Validation Hints */}
            <div className="mt-2.5 grid grid-cols-3 gap-2">
              <div className={`flex items-center gap-1.5 text-[11px] font-bold ${hasMinLength ? 'text-[var(--accent-teal-text)]' : 'text-[var(--text-subtle)]'}`}>
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>8+ chars</span>
              </div>
              <div className={`flex items-center gap-1.5 text-[11px] font-bold ${hasLetter ? 'text-[var(--accent-teal-text)]' : 'text-[var(--text-subtle)]'}`}>
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>1+ letter</span>
              </div>
              <div className={`flex items-center gap-1.5 text-[11px] font-bold ${hasNumber ? 'text-[var(--accent-teal-text)]' : 'text-[var(--text-subtle)]'}`}>
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>1+ number</span>
              </div>
            </div>
          </div>

          {/* Primary Submit Button */}
          <button
            id="register-submit"
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-primary py-3.5 rounded-2xl mt-4 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Creating account...</span>
              </div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-8 text-center text-xs text-[var(--text-muted)]">
          Already have an account?{' '}
          <Link 
            to="/login" 
            className="font-bold text-[var(--accent-teal-text)] hover:text-[var(--accent-rose)] underline underline-offset-2 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
