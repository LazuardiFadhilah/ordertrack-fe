'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiActivity, FiCheckCircle, FiClipboard, FiDatabase, FiFileText, FiGrid, FiLogOut, FiMenu, FiShield, FiUser, FiX } from 'react-icons/fi';
import { Button } from '../components/ui/button.js';
import { Card, CardContent, CardHeader } from '../components/ui/card.js';
import { getCurrentUser, logout } from './auth-client.js';

const navigation = [
  { label: 'Overview', icon: FiGrid, active: true },
  { label: 'Sales orders', icon: FiClipboard },
  { label: 'Documents', icon: FiFileText },
  { label: 'Activity', icon: FiActivity },
];

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

function NavItem({ item, onNavigate }) {
  const Icon = item.icon;

  return (
    <a
      aria-current={item.active ? 'page' : undefined}
      className={`group flex min-h-11 min-w-0 items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${item.active ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'}`}
      href={item.active ? '#main-content' : `#${item.label.toLowerCase().replaceAll(' ', '-')}`}
      onClick={onNavigate}
    >
      <Icon aria-hidden="true" className="h-[1.1rem] w-[1.1rem] shrink-0" />
      <span className="whitespace-nowrap">{item.label}</span>
    </a>
  );
}

function NavigationList({ onNavigate }) {
  return navigation.map((item) => <NavItem key={item.label} item={item} onNavigate={onNavigate} />);
}

function PlaceholderPanel() {
  return (
    <Card as="section" aria-labelledby="placeholder-title" className="h-full">
      <CardHeader className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow text-primary">Workspace state</p>
          <h2 id="placeholder-title" className="mt-1 font-display text-xl font-semibold tracking-tight text-on-surface">
            Ready for approved data
          </h2>
        </div>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[0.625rem] font-bold uppercase tracking-[0.12em] text-emerald-700">Healthy</span>
      </CardHeader>
      <CardContent className="flex h-[calc(100%-5.25rem)] flex-col justify-between py-8 sm:py-10">
        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
          <div className="mb-5 flex items-center gap-2 text-primary">
            <FiDatabase aria-hidden="true" className="h-4 w-4" />
            <p className="eyebrow text-primary">Empty operational view</p>
          </div>
          <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight text-on-surface sm:text-3xl">
            No operational data loaded
          </h3>
          <p className="mt-3 max-w-lg text-sm leading-6 text-on-surface-variant">
            This client foundation is intentionally empty. Connect an approved API contract to populate the workspace without changing its visual structure.
          </p>
        </div>
        <div className="mt-8 grid overflow-hidden rounded-lg border border-outline-variant sm:grid-cols-3">
          <div className="border-b border-outline-variant bg-surface-container-lowest px-4 py-4 text-left sm:border-b-0 sm:border-r">
            <p className="ledger-label">Data source</p>
            <p className="mt-1 text-sm font-semibold text-on-surface">Not connected</p>
          </div>
          <div className="border-b border-outline-variant bg-surface-container-lowest px-4 py-4 text-left sm:border-b-0 sm:border-r">
            <p className="ledger-label">Workspace</p>
            <p className="mt-1 text-sm font-semibold text-on-surface">Placeholder</p>
          </div>
          <div className="bg-surface-container-lowest px-4 py-4 text-left">
            <p className="ledger-label">Next step</p>
            <p className="mt-1 text-sm font-semibold text-on-surface">API approval</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SystemPanel() {
  return (
    <Card as="aside" aria-labelledby="system-panel-title" className="h-full bg-surface-container-low">
      <CardHeader>
        <p className="eyebrow">Foundation checks</p>
        <h2 id="system-panel-title" className="mt-1 font-display text-lg font-semibold text-on-surface">Shell status</h2>
      </CardHeader>
      <CardContent className="px-0 py-0">
        <dl>
          <div className="flex items-start justify-between gap-4 border-b border-outline-variant px-5 py-4">
            <dt className="flex items-center gap-2 text-sm text-on-surface-variant"><FiCheckCircle aria-hidden="true" className="h-4 w-4 text-emerald-600" />Client route</dt>
            <dd className="text-right text-sm font-semibold text-emerald-700">Available</dd>
          </div>
          <div className="flex items-start justify-between gap-4 border-b border-outline-variant px-5 py-4">
            <dt className="flex items-center gap-2 text-sm text-on-surface-variant"><FiShield aria-hidden="true" className="h-4 w-4 text-emerald-600" />Session gate</dt>
            <dd className="text-right text-sm font-semibold text-emerald-700">Protected</dd>
          </div>
          <div className="flex items-start justify-between gap-4 px-5 py-4">
            <dt className="flex items-center gap-2 text-sm text-on-surface-variant"><FiDatabase aria-hidden="true" className="h-4 w-4 text-on-surface-variant" />Domain data</dt>
            <dd className="text-right text-sm font-semibold text-on-surface-variant">Intentionally empty</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}

function SessionLoading() {
  return <main aria-live="polite" className="flex min-h-screen items-center justify-center bg-surface px-4"><p className="eyebrow text-primary">Verifying session…</p></main>;
}

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const mobileNavCloseRef = useRef(null);
  const wasMobileNavOpen = useRef(false);

  useEffect(() => {
    let active = true;
    getCurrentUser().then((currentUser) => {
      if (active) {
        setUser(currentUser);
        setIsChecking(false);
      }
    }).catch(() => {
      if (active) router.replace('/login');
    });
    return () => { active = false; };
  }, [router]);

  useEffect(() => {
    if (!isMobileNavOpen) {
      if (wasMobileNavOpen.current) menuButtonRef.current?.focus();
      wasMobileNavOpen.current = false;
      return undefined;
    }

    wasMobileNavOpen.current = true;
    mobileNavCloseRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsMobileNavOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileNavOpen]);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      router.replace('/login');
    }
  }

  if (isChecking || !user) return <SessionLoading />;

  return (
    <div className="min-h-screen overflow-x-hidden bg-surface text-on-surface">
      <a className="sr-only absolute left-3 top-3 z-[60] rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-on-primary focus:not-sr-only" href="#main-content">
        Skip to main content
      </a>

      <header className="sticky top-0 z-30 border-b border-outline-variant/80 bg-surface-container-lowest">
        <div className="mx-auto flex min-h-20 w-full max-w-[1600px] items-center gap-3 px-4 sm:gap-4 sm:px-6 lg:gap-8 lg:px-8">
          <button
            ref={menuButtonRef}
            aria-controls="mobile-navigation"
            aria-expanded={isMobileNavOpen}
            aria-label="Open navigation menu"
            className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg border border-outline-variant bg-surface-container-low text-on-surface transition-colors hover:bg-surface-container focus-visible:outline-3 focus-visible:outline-primary focus-visible:outline-offset-2 lg:hidden"
            onClick={() => setIsMobileNavOpen(true)}
            type="button"
          >
            <FiMenu aria-hidden="true" className="h-5 w-5" />
          </button>

          <a className="flex shrink-0 items-center gap-3 text-on-surface" href="#main-content" aria-label="OrderTrack overview">
            <BrandMark />
            <span className="font-display text-lg font-bold tracking-tight">OrderTrack</span>
          </a>

          <div className="hidden min-w-0 flex-1 border-l border-outline-variant pl-6 sm:block">
            <p className="eyebrow truncate">Order-to-cash workspace</p>
            <p className="mt-1 truncate text-sm text-on-surface-variant">Client foundation / overview</p>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="flex min-w-0 items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-low px-2.5 py-2 sm:gap-3 sm:px-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><FiUser aria-hidden="true" className="h-4 w-4" /></span>
              <div className="hidden min-w-0 max-w-[13rem] sm:block">
                <p className="truncate text-sm font-semibold text-on-surface">{user.name}</p>
                <p className="truncate font-mono text-[0.6875rem] tabular text-on-surface-variant">{user.role} · {user.email}</p>
              </div>
            </div>
            <Button aria-label="Sign out" className="shrink-0 px-3 sm:px-4" disabled={isLoggingOut} onClick={handleLogout} type="button" variant="outline">
              <FiLogOut aria-hidden="true" className="h-4 w-4" />
              <span className="hidden lg:inline">{isLoggingOut ? 'Signing out…' : 'Sign out'}</span>
            </Button>
          </div>
        </div>
      </header>

      {isMobileNavOpen && (
        <>
          <button aria-label="Close navigation backdrop" className="fixed inset-0 z-40 bg-on-surface/45 lg:hidden" onClick={() => setIsMobileNavOpen(false)} type="button" />
          <aside
            id="mobile-navigation"
            aria-labelledby="mobile-navigation-title"
            aria-modal="true"
            className="fixed inset-y-0 left-0 z-50 flex w-[min(20rem,calc(100vw-2rem))] max-w-full flex-col overflow-y-auto border-r border-outline-variant bg-surface-container-lowest shadow-xl lg:hidden"
            role="dialog"
          >
            <div className="flex min-h-20 items-center justify-between border-b border-outline-variant px-4">
              <p id="mobile-navigation-title" className="eyebrow text-primary">Application navigation</p>
              <button
                ref={mobileNavCloseRef}
                aria-label="Close navigation menu"
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface focus-visible:outline-3 focus-visible:outline-primary focus-visible:outline-offset-2"
                onClick={() => setIsMobileNavOpen(false)}
                type="button"
              >
                <FiX aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>
            <nav aria-label="Primary" className="flex flex-col gap-1 px-3 py-4">
              <NavigationList onNavigate={() => setIsMobileNavOpen(false)} />
            </nav>
            <div className="mt-auto border-t border-outline-variant/80 px-5 py-5">
              <p className="eyebrow">Environment</p>
              <p className="mt-2 text-sm font-semibold text-on-surface">Foundation</p>
              <p className="mt-1 text-xs leading-5 text-on-surface-variant">UI only · no live records</p>
            </div>
          </aside>
        </>
      )}

      <div className="flex min-h-[calc(100vh-5rem)]">
        <aside aria-label="Application navigation" className="hidden w-60 shrink-0 border-r border-outline-variant/80 bg-surface-container-lowest lg:block">
          <div className="sticky top-20 flex max-h-[calc(100vh-5rem)] flex-col overflow-y-auto">
            <nav aria-label="Primary" className="flex flex-col gap-1 px-3 py-5">
              <NavigationList />
            </nav>
            <div className="mt-auto border-t border-outline-variant/80 px-5 py-5">
              <p className="eyebrow">Environment</p>
              <p className="mt-2 text-sm font-semibold text-on-surface">Foundation</p>
              <p className="mt-1 text-xs leading-5 text-on-surface-variant">UI only · no live records</p>
            </div>
          </div>
        </aside>

        <main id="main-content" className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          <div className="mx-auto max-w-[1440px]">
            <div className="mb-7 flex flex-col gap-4 border-b border-outline-variant/80 pb-7 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow text-primary">Operational command surface</p>
                <h1 className="mt-2 max-w-2xl font-display text-3xl font-semibold leading-tight tracking-[-0.035em] text-on-surface sm:text-4xl">
                  A clear starting point for every handoff.
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-on-surface-variant sm:text-base">
                  The shell is in place. It will stay quiet until an approved screen contract provides real operational records.
                </p>
              </div>
              <p className="font-mono text-xs tabular text-on-surface-variant">ROUTE / OVERVIEW</p>
            </div>

            <div className="grid gap-6 xl:grid-cols-12">
              <div className="min-w-0 xl:col-span-8"><PlaceholderPanel /></div>
              <div className="min-w-0 xl:col-span-4"><SystemPanel /></div>
            </div>

            <footer className="mt-8 flex flex-col gap-2 border-t border-outline-variant/80 pt-4 text-xs text-on-surface-variant sm:flex-row sm:items-center sm:justify-between">
              <p>OrderTrack client scaffold</p>
              <p className="font-mono tabular">NO LIVE DATA · UI FOUNDATION</p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
