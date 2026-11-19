'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FiArrowUpRight, FiFileText, FiSearch } from 'react-icons/fi';
import { EmptyState, ErrorState, LoadingState } from '../../../components/data-state.js';
import { PageHeader } from '../../../components/page-header.js';
import { StatusBadge } from '../../../components/status-badge.js';
import { Button } from '../../../components/ui/button.js';
import { Card, CardHeader } from '../../../components/ui/card.js';
import { Input } from '../../../components/ui/input.js';
import { Select } from '../../../components/ui/select.js';
import { Table, TableScroll, Td, Th, Tr } from '../../../components/ui/table.js';
import { invoiceApi } from '../../../lib/api-client.js';
import { formatCurrency, formatDate, salesOrderStatus } from '../../../lib/master-data.js';
import { useApiData } from '../../../lib/use-api-data.js';

const STATUS = {
  ISSUED: { label: 'Terbit', tone: 'progress' },
  PARTIALLY_PAID: { label: 'Dibayar sebagian', tone: 'waiting' },
  PAID: { label: 'Lunas', tone: 'done' },
  VOID: { label: 'Void', tone: 'problem' },
  DRAFT: { label: 'Draft', tone: 'draft' },
};

export default function InvoicesPage() {
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const { data, loading, error, reload } = useApiData(() => invoiceApi.list({ status, limit: 100 }), [status]);
  const invoices = data?.invoices ?? [];
  const filtered = invoices.filter((invoice) => `${invoice.invoiceNumber} ${invoice.soNumber} ${invoice.customerName}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <PageHeader eyebrow="Piutang usaha" title="Penagihan" description="Pantau invoice pelanggan dan sisa piutang." />
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2"><FiFileText aria-hidden="true" className="h-4 w-4 text-primary" /><h2 className="font-display text-lg font-semibold">Daftar invoice</h2></div>
            <div className="grid w-full min-w-0 gap-2 sm:w-[min(100%,28rem)] sm:grid-cols-[minmax(0,1fr)_11rem]">
              <label className="relative min-w-0"><span className="sr-only">Cari invoice</span><FiSearch aria-hidden="true" className="absolute left-3 top-3 h-4 w-4 text-on-surface-variant" /><Input aria-label="Cari invoice" className="w-full pl-9" onChange={(event) => setSearch(event.target.value)} placeholder="Cari nomor / customer" value={search} /></label>
              <Select aria-label="Filter status" className="min-w-0" onChange={(event) => setStatus(event.target.value)} value={status}><option value="">Semua status</option><option value="ISSUED">Terbit</option><option value="PARTIALLY_PAID">Dibayar sebagian</option><option value="PAID">Lunas</option><option value="VOID">Void</option></Select>
            </div>
          </div>
        </CardHeader>
        {loading ? <LoadingState label="Memuat invoice…" /> : error ? <ErrorState message={error.message} onRetry={reload} /> : filtered.length === 0 ? <EmptyState title="Belum ada invoice" description={search ? 'Tidak ada invoice yang cocok dengan pencarian.' : 'Invoice akan muncul setelah diterbitkan dari Sales Order.'} /> : (
          <>
            <div className="divide-y divide-outline-variant sm:hidden">{filtered.map((invoice) => { const outstanding = Math.max(0, Number(invoice.totalAmount) - Number(invoice.paidAmount)); return <article className="space-y-3 px-4 py-4" key={invoice._id}><div className="flex items-start justify-between gap-3"><div><p className="font-mono text-sm font-semibold">{invoice.invoiceNumber}</p><Link className="mt-1 inline-block text-sm text-primary underline underline-offset-4" href={`/sales-orders/${invoice.soId}`}>{invoice.soNumber}</Link></div><StatusBadge {...(STATUS[invoice.status] ?? { label: invoice.status, tone: 'draft' })} /></div><p className="text-sm text-on-surface-variant">{invoice.customerName}</p><div className="grid grid-cols-2 gap-3 text-sm"><div><p className="text-xs text-on-surface-variant">Nilai invoice</p><p className="mt-1 font-semibold tabular">{formatCurrency(invoice.totalAmount)}</p></div><div><p className="text-xs text-on-surface-variant">Sisa piutang</p><p className="mt-1 font-semibold tabular">{formatCurrency(outstanding)}</p></div></div><div className="flex items-center justify-between text-xs text-on-surface-variant"><span>Jatuh tempo · {formatDate(invoice.dueDate)}</span><Link aria-label={`Buka invoice ${invoice.invoiceNumber}`} className="inline-flex min-h-11 items-center text-sm font-medium text-primary" href={`/sales-orders/${invoice.soId}`}>Detail<FiArrowUpRight aria-hidden="true" className="ml-1" /></Link></div></article>; })}</div>
            <div className="hidden sm:block"><TableScroll><Table className="min-w-[54rem]"><thead><tr><Th>Nomor invoice</Th><Th>Sales order</Th><Th>Customer</Th><Th>Status</Th><Th>Jatuh tempo</Th><Th className="text-right">Nilai</Th><Th className="text-right">Sisa piutang</Th><Th><span className="sr-only">Aksi</span></Th></tr></thead><tbody>{filtered.map((invoice) => { const outstanding = Math.max(0, Number(invoice.totalAmount) - Number(invoice.paidAmount)); return <Tr key={invoice._id}><Td className="whitespace-nowrap font-mono text-xs font-semibold">{invoice.invoiceNumber}</Td><Td><Link className="font-mono text-xs text-primary underline underline-offset-4" href={`/sales-orders/${invoice.soId}`}>{invoice.soNumber}</Link></Td><Td>{invoice.customerName}</Td><Td><StatusBadge {...(STATUS[invoice.status] ?? { label: invoice.status, tone: 'draft' })} /></Td><Td className="whitespace-nowrap">{formatDate(invoice.dueDate)}</Td><Td className="whitespace-nowrap text-right tabular">{formatCurrency(invoice.totalAmount)}</Td><Td className="whitespace-nowrap text-right font-semibold tabular">{formatCurrency(outstanding)}</Td><Td><Link aria-label={`Buka invoice ${invoice.invoiceNumber}`} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-primary hover:bg-surface-container" href={`/sales-orders/${invoice.soId}`}><FiArrowUpRight aria-hidden="true" /></Link></Td></Tr>; })}</tbody></Table></TableScroll></div>
          </>
        )}
      </Card>
    </>
  );
}
