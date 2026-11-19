'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FiBell, FiCheck } from 'react-icons/fi';
import { notificationsApi } from '../../lib/api-client.js';
import { formatDateTime } from '../../lib/master-data.js';
import { ErrorState, LoadingState } from '../../components/data-state.js';

const linkFor = (item) => item.soId ? `/sales-orders/${item.soId}` : item.invoiceId ? `/invoices` : item.poId ? `/sales-orders` : '/';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState({ loading: true, error: null, items: [] });
  const load = () => { setState((s) => ({ ...s, loading: true, error: null })); notificationsApi.list({ limit: 8 }).then((data) => setState({ loading: false, error: null, items: data?.notifications ?? data?.items ?? [] })).catch((error) => setState({ loading: false, error, items: [] })); };
  useEffect(load, []);
  const unread = state.items.filter((item) => !item.isRead && !item.readAt).length;
  async function read(item) { if (!item.isRead && !item.readAt) { await notificationsApi.markRead(item._id ?? item.id); load(); } }
  return <div className="relative"><button aria-expanded={open} aria-haspopup="dialog" aria-label={`Notifikasi${unread ? `, ${unread} belum dibaca` : ''}`} className="relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container" onClick={() => setOpen((value) => !value)} type="button"><FiBell aria-hidden="true" className="h-5 w-5" />{unread > 0 && <span aria-hidden="true" className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger" />}</button>{open && <div aria-label="Notifikasi" className="absolute right-0 z-40 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-outline-variant bg-surface-container-lowest p-2 shadow-lg" role="dialog"><div className="flex items-center justify-between px-3 py-2"><h2 className="font-semibold">Notifikasi</h2>{unread > 0 && <span className="text-xs text-on-surface-variant">{unread} baru</span>}</div>{state.loading ? <LoadingState label="Memuat notifikasi…" /> : state.error ? <ErrorState message={state.error.message} onRetry={load} /> : state.items.length === 0 ? <p className="px-3 py-8 text-center text-sm text-on-surface-variant">Belum ada notifikasi.</p> : <ul className="max-h-96 overflow-y-auto">{state.items.map((item) => <li key={item._id ?? item.id}><Link className={`block rounded-lg px-3 py-3 hover:bg-surface-container ${!item.isRead && !item.readAt ? 'bg-primary/5' : ''}`} href={linkFor(item)} onClick={() => read(item)}><p className="text-sm font-semibold">{item.title ?? item.message ?? 'Aktivitas baru'}</p><p className="mt-1 text-xs text-on-surface-variant">{item.description ?? item.body ?? ''}</p><time className="mt-1 block text-xs text-on-surface-variant" dateTime={item.createdAt}>{formatDateTime(item.createdAt)}</time></Link></li>)}</ul>}{unread > 0 && <p className="flex items-center gap-1 px-3 py-2 text-xs text-on-surface-variant"><FiCheck aria-hidden="true" />Buka notifikasi untuk menandai sudah dibaca</p>}</div>}</div>;
}
