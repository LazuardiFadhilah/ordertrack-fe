'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GENERIC_AUTH_ERROR, login, validateLogin } from '../auth-client.js';

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
    <main className="min-h-screen bg-surface px-4 py-6 text-on-surface sm:px-6 sm:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl items-center justify-center sm:min-h-[calc(100vh-5rem)]">
        <section aria-labelledby="login-title" className="grid w-full max-w-5xl border border-outline-variant bg-surface-container-lowest lg:grid-cols-[1.1fr_0.9fr]">
          <div className="hidden border-r border-outline-variant bg-surface-container-low p-8 lg:flex lg:flex-col lg:justify-between lg:p-12">
            <div>
              <div className="flex items-center gap-3">
                <span aria-hidden="true" className="grid h-8 w-8 shrink-0 grid-cols-2 gap-px bg-primary p-1">
                  <span className="bg-on-primary" />
                  <span className="bg-primary" />
                  <span className="bg-primary" />
                  <span className="bg-on-primary" />
                </span>
                <span className="font-display text-lg font-bold tracking-tight">OrderTrack</span>
              </div>
              <p className="eyebrow mt-16 text-primary">Operational command surface</p>
              <h1 className="mt-3 max-w-md font-display text-4xl font-semibold tracking-tight text-on-surface">
                Keep every handoff visible.
              </h1>
              <p className="mt-5 max-w-md text-sm leading-6 text-on-surface-variant">
                Sign in to the OrderTrack workspace to follow order-to-cash operations from quotation through payment.
              </p>
            </div>
            <p className="font-mono text-xs tabular text-on-surface-variant">AUTH / SESSION GATE</p>
          </div>

          <div className="p-5 sm:p-8 lg:p-12">
            <div className="mb-8 lg:hidden">
              <div className="flex items-center gap-3">
                <span aria-hidden="true" className="grid h-8 w-8 shrink-0 grid-cols-2 gap-px bg-primary p-1">
                  <span className="bg-on-primary" />
                  <span className="bg-primary" />
                  <span className="bg-primary" />
                  <span className="bg-on-primary" />
                </span>
                <span className="font-display text-lg font-bold tracking-tight">OrderTrack</span>
              </div>
            </div>

            <p className="eyebrow text-primary">Secure workspace access</p>
            <h2 id="login-title" className="mt-2 font-display text-3xl font-semibold tracking-tight text-on-surface">
              Sign in
            </h2>
            <p className="mt-3 text-sm leading-6 text-on-surface-variant">
              Use your approved OrderTrack account to continue.
            </p>

            {message && (
              <div
                aria-live="polite"
                className={`mt-6 border px-4 py-3 text-sm leading-6 ${status === 'success' ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : status === 'error' ? 'border-red-300 bg-red-50 text-red-800' : 'border-outline-variant bg-surface-container-low text-on-surface-variant'}`}
                role={status === 'error' ? 'alert' : 'status'}
              >
                {message}
              </div>
            )}

            <form className="mt-8 space-y-5" noValidate onSubmit={handleSubmit}>
              <div>
                <label className="ledger-label block" htmlFor="email">Email address</label>
                <input
                  aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                  aria-invalid={Boolean(fieldErrors.email)}
                  autoComplete="email"
                  className="mt-2 block min-h-11 w-full border border-outline bg-surface-container-lowest px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none"
                  disabled={isLoading}
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
                <input
                  aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                  aria-invalid={Boolean(fieldErrors.password)}
                  autoComplete="current-password"
                  className="mt-2 block min-h-11 w-full border border-outline bg-surface-container-lowest px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none"
                  disabled={isLoading}
                  id="password"
                  name="password"
                  onChange={(event) => updateField('password', event.target.value)}
                  type="password"
                  value={form.password}
                />
                {fieldErrors.password && <p className="mt-2 text-sm text-red-800" id="password-error">{fieldErrors.password}</p>}
              </div>

              <button
                className="inline-flex min-h-11 w-full items-center justify-center bg-primary px-4 py-3 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isLoading}
                type="submit"
              >
                {isLoading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <p className="mt-8 border-t border-outline-variant pt-4 text-xs leading-5 text-on-surface-variant">
              Access is verified by the OrderTrack service. Session cookies remain unavailable to browser scripts.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
