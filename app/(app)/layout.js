'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FiClipboard, FiFileText, FiGrid, FiLogOut, FiMenu, FiTruck, FiUser, FiUsers, FiX } from 'react-icons/fi';
import { Toaster } from 'sonner';
import { Button } from '../../components/ui/button.js';
import { SessionContext } from '../../components/session.js';
import { canManageMasterData } from '../../lib/master-data.js';
import { getCurrentUser, logout } from '../auth-client.js';

const navigation = [
  { href: '/', label: 'Ringkasan', icon: FiGrid },
  { href: '/quotations', label: 'Quotation', icon: FiFileText },
  { href: '/sales-orders', label: 'Sales order', icon: FiClipboard },
  { href: '/shipping', label: 'Pengiriman', icon: FiTruck },
  { href: '/customers', label: 'Customer', icon: FiUsers, adminOnly: true },
  { href: '/vendors', label: 'Vendor', icon: FiTruck, adminOnly: true },
];

const shellHeaderHeight = 'h-16 lg:h-20';

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

function isActive(pathname, href) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}

function NavItem({ item, pathname, onNavigate }) {
  const Icon = item.icon;
  const active = isActive(pathname, item.href);

  return (
    <Link
      aria-current={active ? 'page' : undefined}
      className={`group flex min-h-11 min-w-0 items-center gap-3 rounded-r-md border-l-2 px-3 py-2 text-sm font-semibold transition-colors ${active ? 'border-primary bg-primary/5 text-primary' : 'border-transparent text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'}`}
      href={item.href}
      onClick={onNavigate}
    >
      <Icon aria-hidden="true" className="h-[1.1rem] w-[1.1rem] shrink-0" />
      <span className="whitespace-nowrap">{item.label}</span>
    </Link>
  );
}

function NavigationList({ pathname, user, onNavigate }) {
  return navigation
    .filter((item) => !item.adminOnly || canManageMasterData(user.role))
    .map((item) => <NavItem key={item.href} item={item} onNavigate={onNavigate} pathname={pathname} />);
}

function SessionLoading() {
  return <main aria-live="polite" className="flex min-h-screen items-center justify-center bg-surface px-4"><p className="eyebrow text-primary">Memeriksa sesi…</p></main>;
}

export default function AppLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
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

  const section = navigation.find((item) => isActive(pathname, item.href))?.label ?? 'Workspace';

  return (
    <SessionContext.Provider value={user}>
      <div className="min-h-screen overflow-x-hidden bg-surface text-on-surface">
        <a className="sr-only absolute left-3 top-3 z-[60] rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-on-primary focus:not-sr-only" href="#main-content">
          Lewati ke konten utama
        </a>

        <div className="grid min-h-screen lg:grid-cols-[15rem_minmax(0,1fr)]">
          <aside aria-label="Application navigation" className="sticky top-0 hidden h-screen min-h-0 flex-col border-r border-outline-variant/80 bg-surface-container-lowest lg:flex">
            <div className={`${shellHeaderHeight} flex shrink-0 items-center border-b border-outline-variant/80 px-5`}>
              <Link aria-label="OrderTrack overview" className="flex items-center gap-3 text-on-surface" href="/">
                <BrandMark />
                <span className="font-display text-lg font-bold tracking-tight">OrderTrack</span>
              </Link>
            </div>
            <nav aria-label="Primary" className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3 py-5">
              <p className="px-3 pb-2 eyebrow">Workspace</p>
              <NavigationList pathname={pathname} user={user} />
            </nav>
          </aside>

          <div className="min-w-0">
            <header className={`${shellHeaderHeight} sticky top-0 z-30 border-b border-outline-variant/80 bg-surface-container-lowest`}>
              <div className="flex h-full items-center gap-3 px-4 sm:gap-4 sm:px-6 lg:gap-8 lg:px-8">
                <button
                  ref={menuButtonRef}
                  aria-controls="mobile-navigation"
                  aria-expanded={isMobileNavOpen}
                  aria-label="Buka menu navigasi"
                  className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg border border-outline-variant bg-surface-container-low text-on-surface transition-colors hover:bg-surface-container focus-visible:outline-3 focus-visible:outline-primary focus-visible:outline-offset-2 lg:hidden"
                  onClick={() => setIsMobileNavOpen(true)}
                  type="button"
                >
                  <FiMenu aria-hidden="true" className="h-5 w-5" />
                </button>

                <Link aria-label="OrderTrack overview" className="flex shrink-0 items-center gap-3 text-on-surface lg:hidden" href="/">
                  <BrandMark />
                  <span className="font-display text-lg font-bold tracking-tight">OrderTrack</span>
                </Link>

                <div className="hidden min-w-0 flex-1 sm:block">
                  <p className="eyebrow truncate">Order-to-cash workspace</p>
                  <p className="mt-1 truncate text-sm text-on-surface-variant">{section}</p>
                </div>

                <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
                  <div className="flex min-w-0 items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-low px-2.5 py-2 sm:gap-3 sm:px-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><FiUser aria-hidden="true" className="h-4 w-4" /></span>
                    <div className="hidden min-w-0 max-w-[13rem] sm:block">
                      <p className="truncate text-sm font-semibold text-on-surface">{user.name}</p>
                      <p className="truncate font-mono text-[0.6875rem] tabular text-on-surface-variant">{user.role} · {user.email}</p>
                    </div>
                  </div>
                  <Button aria-label="Keluar" className="shrink-0 px-3 sm:px-4" disabled={isLoggingOut} onClick={handleLogout} type="button" variant="outline">
                    <FiLogOut aria-hidden="true" className="h-4 w-4" />
                    <span className="hidden lg:inline">{isLoggingOut ? 'Keluar…' : 'Keluar'}</span>
                  </Button>
                </div>
              </div>
            </header>

            {isMobileNavOpen && (
              <>
                <button aria-label="Tutup latar navigasi" className="fixed inset-0 z-40 bg-on-surface/45 lg:hidden" onClick={() => setIsMobileNavOpen(false)} type="button" />
                <aside
                  id="mobile-navigation"
                  aria-labelledby="mobile-navigation-title"
                  aria-modal="true"
                  className="fixed inset-y-0 left-0 z-50 flex w-[min(20rem,calc(100vw-2rem))] max-w-full flex-col overflow-y-auto border-r border-outline-variant bg-surface-container-lowest shadow-xl lg:hidden"
                  role="dialog"
                >
                  <div className="flex min-h-16 items-center justify-between border-b border-outline-variant px-4">
                    <p id="mobile-navigation-title" className="eyebrow text-primary">Application navigation</p>
                    <button
                      ref={mobileNavCloseRef}
                      aria-label="Tutup menu navigasi"
                      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface focus-visible:outline-3 focus-visible:outline-primary focus-visible:outline-offset-2"
                      onClick={() => setIsMobileNavOpen(false)}
                      type="button"
                    >
                      <FiX aria-hidden="true" className="h-5 w-5" />
                    </button>
                  </div>
                  <nav aria-label="Primary" className="flex flex-col gap-1 px-3 py-5">
                    <p className="px-3 pb-2 eyebrow">Workspace</p>
                    <NavigationList onNavigate={() => setIsMobileNavOpen(false)} pathname={pathname} user={user} />
                  </nav>
                </aside>
              </>
            )}

            <main id="main-content" className="min-w-0 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
              <div className="mx-auto max-w-[1440px]">{children}</div>
            </main>
          </div>
        </div>

        <Toaster closeButton position="top-right" richColors />
      </div>
    </SessionContext.Provider>
  );
}
