'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiAlertCircle, FiArrowRight, FiCheckCircle, FiLock, FiShield } from 'react-icons/fi';
import { Button } from '../../components/ui/button.js';
import { Input } from '../../components/ui/input.js';
import { GENERIC_AUTH_ERROR, login, validateLogin } from '../auth-client.js';

function BrandMark() {
  return (
    <span aria-hidden="true" className="grid h-9 w-9 shrink-0 grid-cols-2 gap-0.5 rounded-lg bg-primary p-1.5 shadow-sm">
      <span className="rounded-[2px] bg-on-primary" />
      <span className="rounded-[2px] bg-primary" />
      <span className="rounded-[2px] bg-primary" />
      <span className="rounded-[2px] bg-on-primary" />
    </span>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const isLoading = status === 'loading';

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    if (status === 'error') {
      setStatus('idle');
      setMessage('');
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const errors = validateLogin(form);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setStatus('error');
      setMessage('Review the highlighted fields before signing in.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      await login(form);
      setStatus('success');
      setMessage('Signed in. Loading your workspace…');
      router.replace('/');
    } catch (error) {
      setStatus('error');
      setMessage(error.message || GENERIC_AUTH_ERROR);
    }
  }

  return (
    <main className="min-h-screen bg-surface px-4 py-5 text-on-surface sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-6xl items-center justify-center sm:min-h-[calc(100vh-4rem)]">
        <section aria-labelledby="login-title" className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-outline-variant/80 bg-surface-container-lowest shadow-xl shadow-primary/5 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="hidden overflow-hidden bg-primary p-10 text-on-primary lg:flex lg:flex-col lg:justify-between lg:p-12">
            <div>
              <div className="flex items-center gap-3">
                <BrandMark />
                <span className="font-display text-lg font-bold tracking-tight">OrderTrack</span>
              </div>
              <div className="mt-24 max-w-md">
                <p className="eyebrow text-indigo-200">Operational command surface</p>
                <h1 className="mt-4 font-display text-5xl font-semibold leading-[1.05] tracking-[-0.04em]">
                  Keep every handoff visible.
                </h1>
                <p className="mt-6 text-sm leading-7 text-indigo-100">
                  Follow order-to-cash operations from quotation through payment in one focused workspace.
                </p>
              </div>
              <dl className="mt-10 overflow-hidden rounded-xl border border-white/15 text-sm">
                <div className="flex items-center justify-between gap-4 border-b border-white/15 px-4 py-3">
                  <dt className="text-indigo-200">Surface</dt>
                  <dd className="font-semibold">Overview</dd>
                </div>
                <div className="flex items-center justify-between gap-4 border-b border-white/15 px-4 py-3">
                  <dt className="text-indigo-200">Access</dt>
                  <dd className="font-semibold">Role-aware</dd>
                </div>
                <div className="flex items-center justify-between gap-4 px-4 py-3">
                  <dt className="text-indigo-200">Session</dt>
                  <dd className="flex items-center gap-2 font-semibold"><FiCheckCircle aria-hidden="true" className="h-4 w-4 text-indigo-200" />HttpOnly</dd>
                </div>
              </dl>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-white/15 pt-5 text-xs text-indigo-200">
              <span>ORDERTRACK / ACCESS</span>
              <span className="font-medium">FOUNDATION</span>
            </div>
          </div>

          <div className="p-5 sm:p-9 lg:p-12">
            <div className="mb-10 flex items-center justify-between gap-4 lg:hidden">
              <div className="flex items-center gap-3">
                <BrandMark />
                <span className="font-display text-lg font-bold tracking-tight">OrderTrack</span>
              </div>
              <span className="rounded-full bg-surface-container px-3 py-1.5 text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-primary">Secure access</span>
            </div>

            <div className="flex items-center gap-2 text-primary">
              <FiShield aria-hidden="true" className="h-4 w-4" />
              <p className="eyebrow text-primary">Secure workspace access</p>
            </div>
            <h2 id="login-title" className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] text-on-surface sm:text-4xl">
              Welcome back
            </h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-on-surface-variant">
              Use your approved OrderTrack account to continue to the operations workspace.
            </p>

            {message && (
              <div
                aria-live="polite"
                className={`mt-6 flex items-start gap-3 rounded-lg border px-4 py-3 text-sm leading-6 ${status === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : status === 'error' ? 'border-red-200 bg-red-50 text-red-800' : 'border-outline-variant bg-surface-container-low text-on-surface-variant'}`}
                role={status === 'error' ? 'alert' : 'status'}
              >
                {status === 'success' ? <FiCheckCircle aria-hidden="true" className="mt-1 h-4 w-4 shrink-0" /> : <FiAlertCircle aria-hidden="true" className="mt-1 h-4 w-4 shrink-0" />}
                <span>{message}</span>
              </div>
            )}

            <form className="mt-8 space-y-5" noValidate onSubmit={handleSubmit}>
              <div>
                <label className="ledger-label block" htmlFor="email">Email address</label>
                <Input
                  aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                  aria-invalid={Boolean(fieldErrors.email)}
                  autoComplete="email"
                  disabled={isLoading}
                  invalid={Boolean(fieldErrors.email)}
                  id="email"
                  name="email"
                  onChange={(event) => updateField('email', event.target.value)}
                  type="email"
                  value={form.email}
                />
                {fieldErrors.email && <p className="mt-2 text-sm text-red-800" id="email-error">{fieldErrors.email}</p>}
              </div>

              <div>
                <label className="ledger-label block" htmlFor="password">Password</label>
                <Input
                  aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                  aria-invalid={Boolean(fieldErrors.password)}
                  autoComplete="current-password"
                  disabled={isLoading}
                  invalid={Boolean(fieldErrors.password)}
                  id="password"
                  name="password"
                  onChange={(event) => updateField('password', event.target.value)}
                  type="password"
                  value={form.password}
                />
                {fieldErrors.password && <p className="mt-2 text-sm text-red-800" id="password-error">{fieldErrors.password}</p>}
              </div>

              <Button aria-busy={isLoading} className="mt-2 w-full" disabled={isLoading} type="submit">
                {isLoading ? 'Signing in…' : 'Sign in'}
                {!isLoading && <FiArrowRight aria-hidden="true" className="h-4 w-4" />}
              </Button>
            </form>

            <div className="mt-9 flex items-start gap-3 border-t border-outline-variant pt-5 text-xs leading-5 text-on-surface-variant">
              <FiLock aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p>Access is verified by the OrderTrack service. Session cookies remain unavailable to browser scripts.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
