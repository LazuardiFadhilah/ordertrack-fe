const navigation = [
  { label: 'Overview', glyph: '◈', active: true },
  { label: 'Sales orders', glyph: '▤' },
  { label: 'Documents', glyph: '▧' },
  { label: 'Activity', glyph: '◌' },
];

function BrandMark() {
  return (
    <span aria-hidden="true" className="grid h-8 w-8 shrink-0 grid-cols-2 gap-px bg-primary p-1">
      <span className="bg-on-primary" />
      <span className="bg-primary" />
      <span className="bg-primary" />
      <span className="bg-on-primary" />
    </span>
  );
}

function NavItem({ item }) {
  return (
    <a
      aria-current={item.active ? 'page' : undefined}
      className={`group flex min-h-10 shrink-0 items-center gap-3 whitespace-nowrap border-l-2 px-3 py-2 text-sm font-medium transition-colors md:justify-center md:border-l-0 md:border-t-2 md:px-0 lg:justify-start lg:border-t-0 lg:border-l-2 lg:px-3 ${
        item.active
          ? 'border-primary bg-surface-container-high text-primary'
          : 'border-transparent text-on-surface-variant hover:border-outline hover:bg-surface-container-low hover:text-on-surface'
      }`}
      href={item.active ? '#main-content' : `#${item.label.toLowerCase().replaceAll(' ', '-')}`}
    >
      <span aria-hidden="true" className="font-display text-base leading-none md:text-lg">
        {item.glyph}
      </span>
      <span className="md:sr-only lg:not-sr-only">{item.label}</span>
    </a>
  );
}

function PlaceholderPanel() {
  return (
    <section aria-labelledby="placeholder-title" className="border border-outline-variant bg-surface-container-lowest">
      <div className="border-b border-outline-variant px-5 py-4 sm:px-6">
        <p className="eyebrow">Workspace state</p>
        <h2 id="placeholder-title" className="mt-1 font-display text-xl font-semibold tracking-tight text-on-surface">
          Ready for approved data
        </h2>
      </div>
      <div className="px-5 py-10 sm:px-10 sm:py-14">
        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
          <div aria-hidden="true" className="mb-6 grid h-14 w-14 grid-cols-3 gap-1 border border-primary bg-surface-container-high p-2">
            <span className="bg-primary" />
            <span className="bg-primary" />
            <span className="bg-primary" />
            <span className="bg-primary" />
            <span className="bg-surface-container-lowest" />
            <span className="bg-primary" />
            <span className="bg-primary" />
            <span className="bg-primary" />
            <span className="bg-primary" />
          </div>
          <p className="eyebrow text-primary">Empty operational view</p>
          <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight text-on-surface sm:text-3xl">
            No operational data loaded
          </h3>
          <p className="mt-3 max-w-lg text-sm leading-6 text-on-surface-variant">
            This client foundation is intentionally empty. Connect an approved API contract to populate the workspace without changing its visual structure.
          </p>
          <div className="mt-8 grid w-full gap-px border border-outline-variant bg-outline-variant sm:grid-cols-3">
            <div className="bg-surface-container-lowest px-4 py-4 text-left">
              <p className="ledger-label">Data source</p>
              <p className="mt-1 text-sm font-semibold text-on-surface">Not connected</p>
            </div>
            <div className="bg-surface-container-lowest px-4 py-4 text-left">
              <p className="ledger-label">Workspace</p>
              <p className="mt-1 text-sm font-semibold text-on-surface">Placeholder</p>
            </div>
            <div className="bg-surface-container-lowest px-4 py-4 text-left">
              <p className="ledger-label">Next step</p>
              <p className="mt-1 text-sm font-semibold text-on-surface">API approval</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SystemPanel() {
  return (
    <aside aria-labelledby="system-panel-title" className="border border-outline-variant bg-surface-container-low">
      <div className="border-b border-outline-variant px-5 py-4">
        <p className="eyebrow">Foundation checks</p>
        <h2 id="system-panel-title" className="mt-1 font-display text-lg font-semibold text-on-surface">
          Shell status
        </h2>
      </div>
      <dl className="divide-y divide-outline-variant">
        <div className="flex items-start justify-between gap-4 px-5 py-4">
          <dt className="text-sm text-on-surface-variant">Client route</dt>
          <dd className="text-right text-sm font-semibold text-emerald-700">Available</dd>
        </div>
        <div className="flex items-start justify-between gap-4 px-5 py-4">
          <dt className="text-sm text-on-surface-variant">Responsive shell</dt>
          <dd className="text-right text-sm font-semibold text-emerald-700">Enabled</dd>
        </div>
        <div className="flex items-start justify-between gap-4 px-5 py-4">
          <dt className="text-sm text-on-surface-variant">Domain data</dt>
          <dd className="text-right text-sm font-semibold text-on-surface-variant">Intentionally empty</dd>
        </div>
      </dl>
    </aside>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <a className="sr-only absolute left-3 top-3 z-50 bg-primary px-4 py-3 text-sm font-semibold text-on-primary focus:not-sr-only" href="#main-content">
        Skip to main content
      </a>
      <div className="flex min-h-screen flex-col md:flex-row">
        <aside aria-label="Application navigation" className="border-b border-outline-variant bg-surface-container-lowest md:w-16 md:border-b-0 md:border-r lg:w-60">
          <div className="flex items-center justify-between gap-3 border-b border-outline-variant px-4 py-4 md:h-16 md:justify-center md:px-0 lg:justify-start lg:px-5">
            <a className="flex items-center gap-3 text-on-surface" href="#main-content" aria-label="OrderTrack overview">
              <BrandMark />
              <span className="font-display text-lg font-bold tracking-tight md:sr-only lg:not-sr-only">OrderTrack</span>
            </a>
            <span className="eyebrow md:hidden">Client shell</span>
          </div>
          <nav aria-label="Primary" className="flex flex-wrap gap-1 px-3 py-3 md:block md:px-2 lg:px-3">
            {navigation.map((item) => <NavItem key={item.label} item={item} />)}
          </nav>
          <div className="hidden border-t border-outline-variant px-5 py-5 md:hidden lg:block">
            <p className="eyebrow">Environment</p>
            <p className="mt-2 text-sm font-semibold text-on-surface">Foundation</p>
            <p className="mt-1 text-xs leading-5 text-on-surface-variant">UI only · no live records</p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-outline-variant bg-surface-container-lowest px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="eyebrow">Order-to-cash workspace</p>
                <p className="mt-1 text-sm text-on-surface-variant">Client foundation / overview</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-2 border border-outline-variant bg-surface-container-low px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant">
                  <span aria-hidden="true" className="h-2 w-2 bg-emerald-600" />
                  Preview
                </span>
                <span className="border border-outline-variant px-3 py-2 font-mono text-xs tabular text-on-surface-variant">v0.1</span>
              </div>
            </div>
          </header>

          <main id="main-content" className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
            <div className="mx-auto max-w-[1440px]">
              <div className="mb-6 flex flex-col gap-4 border-b border-outline-variant pb-6 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="eyebrow text-primary">Operational command surface</p>
                  <h1 className="mt-2 max-w-2xl font-display text-3xl font-semibold tracking-tight text-on-surface sm:text-4xl">
                    A clear starting point for every handoff.
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-on-surface-variant sm:text-base">
                    The shell is in place. It will stay quiet until an approved screen contract provides real operational records.
                  </p>
                </div>
                <p className="font-mono text-xs tabular text-on-surface-variant">ROUTE / OVERVIEW</p>
              </div>

              <div className="grid gap-6 xl:grid-cols-12">
                <div className="xl:col-span-8">
                  <PlaceholderPanel />
                </div>
                <div className="xl:col-span-4">
                  <SystemPanel />
                </div>
              </div>

              <footer className="mt-8 flex flex-col gap-2 border-t border-outline-variant pt-4 text-xs text-on-surface-variant sm:flex-row sm:items-center sm:justify-between">
                <p>OrderTrack client scaffold</p>
                <p className="font-mono tabular">NO LIVE DATA · UI FOUNDATION</p>
              </footer>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
