'use client';
import Link from 'next/link';
import { FiArrowRight, FiClipboard, FiFileText, FiTruck, FiDollarSign } from 'react-icons/fi';
import { Card, CardContent, CardHeader } from '../../components/ui/card.js';
import { LoadingState, ErrorState, EmptyState } from '../../components/data-state.js';
import { PageHeader } from '../../components/page-header.js';
import { useSession } from '../../components/session.js';
import { salesOrdersApi, shippingApi, invoiceApi, vendorPosApi } from '../../lib/api-client.js';
import { useApiData } from '../../lib/use-api-data.js';
import { salesOrderStatus } from '../../lib/master-data.js';
import { StatusBadge } from '../../components/status-badge.js';

const roleQueues = { SALES: ['orders', 'shipping'], GA: ['shipping'], AR: ['invoices'], AP: ['vendorPos'], ADMIN: ['orders', 'invoices', 'shipping', 'vendorPos'] };
const queueMeta = {
  orders: ['Sales order', '/sales-orders', FiClipboard], shipping: ['Antrean pengiriman', '/shipping', FiTruck],
  invoices: ['Invoice jatuh tempo', '/invoices', FiFileText], vendorPos: ['SO vendor belum dibayar', '/sales-orders', FiDollarSign],
};

function QueueCard({ kind, items }) {
  const [title, href, Icon] = queueMeta[kind];
  return <Card as="section" aria-labelledby={`${kind}-title`}><CardHeader className="flex items-start justify-between gap-3"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><Icon aria-hidden="true" /></span><div><h2 id={`${kind}-title`} className="font-display text-lg font-semibold">{title}</h2><p className="mt-1 text-sm text-on-surface-variant">Antrean kerja berdasarkan data operasional.</p></div></div><Link className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-primary" href={href}>Buka <FiArrowRight aria-hidden="true" /></Link></CardHeader><CardContent className="px-0 py-0">{items.length === 0 ? <EmptyState title="Antrean kosong" description="Tidak ada data yang perlu ditindaklanjuti." /> : <ul className="divide-y divide-outline-variant">{items.slice(0, 5).map((item) => <li className="flex items-center justify-between gap-4 px-5 py-4" key={item.id || item._id || item.invoiceNumber}><div className="min-w-0"><p className="truncate font-mono text-xs font-semibold text-primary">{item.soNumber || item.invoiceNumber || item.srNumber || item.doNumber || item.vendorPoNumber}</p><p className="mt-1 truncate text-sm text-on-surface-variant">{item.customerName || item.vendorName || item.status}</p></div>{item.status && <StatusBadge {...salesOrderStatus(item.status)} />}</li>)}</ul>}</CardContent></Card>;
}

export default function HomePage() {
  const user = useSession();
  const role = user?.role || 'ADMIN';
  const { data, loading, error, reload } = useApiData(() => Promise.all([salesOrdersApi.list({ limit: 100 }), shippingApi.listRequests({ limit: 100 }), invoiceApi.list({ limit: 100 }), vendorPosApi.list({ limit: 100 })]).then(([orders, shipping, invoices, vendorPos]) => ({ orders: orders?.items ?? [], shipping: shipping?.items ?? [], invoices: invoices?.invoices ?? [], vendorPos: vendorPos?.items ?? vendorPos?.vendorPos ?? [] })), []);
  const queues = roleQueues[role] || roleQueues.ADMIN;
  const items = (kind) => { const list = data?.[kind] ?? []; if (kind === 'invoices') return list.filter((item) => item.status !== 'PAID' && item.status !== 'VOID'); if (kind === 'vendorPos') return list.filter((item) => item.status !== 'PAID' && item.status !== 'CLOSED'); return list; };
  return <><PageHeader eyebrow="Dashboard" title={`Ringkasan ${role}`} description="Antrean kerja berdasarkan peran dan data operasional terbaru." />{loading ? <Card><LoadingState label="Memuat dashboard…" /></Card> : error ? <Card><ErrorState message={error.message} onRetry={reload} /></Card> : <div className="grid gap-6 xl:grid-cols-2">{queues.map((kind) => <QueueCard key={kind} kind={kind} items={items(kind)} />)}</div>}</>;
}
