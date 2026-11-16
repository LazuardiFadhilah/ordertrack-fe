'use client';

import Link from 'next/link';
import { FiArrowRight, FiClipboard, FiFileText, FiTruck, FiUsers } from 'react-icons/fi';
import { Card, CardContent, CardHeader } from '../../components/ui/card.js';
import { StatusBadge } from '../../components/status-badge.js';
import { useSession } from '../../components/session.js';
import { canManageMasterData, canWriteQuotation, salesOrderStatus } from '../../lib/master-data.js';

const quickLinks = [
  { href: '/quotations', label: 'Quotation', description: 'Buat, kirim, dan konversi penawaran customer.', icon: FiFileText },
  { href: '/sales-orders', label: 'Sales order', description: 'Pantau order yang lahir dari konversi quotation.', icon: FiClipboard },
  { href: '/customers', label: 'Customer', description: 'Kelola data customer dan blok NPWP.', icon: FiUsers, adminOnly: true },
  { href: '/vendors', label: 'Vendor', description: 'Kelola daftar vendor pengadaan.', icon: FiTruck, adminOnly: true },
];

export default function HomePage() {
  const user = useSession();
  const links = quickLinks.filter((item) => !item.adminOnly || canManageMasterData(user.role));
  const poReceived = salesOrderStatus('PO_RECEIVED');

  return (
    <>
      <div className="mb-7 border-b border-outline-variant/80 pb-7 sm:mb-8">
        <p className="eyebrow text-primary">Order-to-cash workspace</p>
        <h1 className="mt-2 max-w-2xl font-display text-3xl font-semibold leading-tight tracking-[-0.035em] text-on-surface sm:text-4xl">
          A clear starting point for every handoff.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-on-surface-variant sm:text-base">
          Master data, quotation, dan sales order fase 3 tersedia dari satu workspace. Setiap layar mengikuti kontrak API yang sudah disetujui.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        <div className="min-w-0 xl:col-span-8">
          <Card as="section" aria-labelledby="quick-access-title">
            <CardHeader className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow text-primary">Akses cepat</p>
                <h2 id="quick-access-title" className="mt-1 font-display text-xl font-semibold tracking-tight text-on-surface">
                  Layar untuk role {user.role}
                </h2>
              </div>
              <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[0.625rem] font-bold uppercase tracking-[0.12em] text-emerald-700">Aktif</span>
            </CardHeader>
            <CardContent className="px-0 py-0">
              <ul className="divide-y divide-outline-variant">
                {links.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-container-low sm:px-6" href={item.href}>
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-outline-variant bg-surface-container-low text-primary">
                          <Icon aria-hidden="true" className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-on-surface">{item.label}</span>
                          <span className="mt-0.5 block text-sm text-on-surface-variant">{item.description}</span>
                        </span>
                        <FiArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 text-on-surface-variant transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="min-w-0 xl:col-span-4">
          <Card as="aside" aria-labelledby="access-panel-title" className="h-full bg-surface-container-low">
            <CardHeader>
              <p className="eyebrow">Hak akses</p>
              <h2 id="access-panel-title" className="mt-1 font-display text-lg font-semibold text-on-surface">Ringkasan role</h2>
            </CardHeader>
            <CardContent className="px-0 py-0">
              <dl>
                <div className="flex items-start justify-between gap-4 border-b border-outline-variant px-5 py-4">
                  <dt className="text-sm text-on-surface-variant">Master data</dt>
                  <dd className="text-right text-sm font-semibold text-on-surface">{canManageMasterData(user.role) ? 'Kelola' : 'Tidak di menu'}</dd>
                </div>
                <div className="flex items-start justify-between gap-4 border-b border-outline-variant px-5 py-4">
                  <dt className="text-sm text-on-surface-variant">Quotation</dt>
                  <dd className="text-right text-sm font-semibold text-on-surface">{canWriteQuotation(user.role) ? 'Buat & kirim' : 'Lihat saja'}</dd>
                </div>
                <div className="flex items-start justify-between gap-4 px-5 py-4">
                  <dt className="text-sm text-on-surface-variant">Sales order awal</dt>
                  <dd className="text-right"><StatusBadge label={poReceived.label} tone={poReceived.tone} /></dd>
                </div>
              </dl>
              <p className="border-t border-outline-variant px-5 py-4 text-xs leading-5 text-on-surface-variant">
                Sales order hanya lahir dari konversi quotation berstatus terkirim. Tidak ada pembuatan manual.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
