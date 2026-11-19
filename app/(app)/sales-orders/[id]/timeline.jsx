'use client';

import { useApiData } from '../../../../lib/use-api-data.js';
import { notificationsApi } from '../../../../lib/api-client.js';
import { formatDateTime } from '../../../../lib/master-data.js';
import { Card, CardContent, CardHeader } from '../../../../components/ui/card.js';
import { EmptyState, ErrorState, LoadingState } from '../../../../components/data-state.js';

export function SalesOrderTimeline({ soId }) {
  const { data, loading, error, reload } = useApiData(() => notificationsApi.timeline(soId), [soId]);
  const items = data?.notifications ?? data?.items ?? data?.timeline ?? [];
  return <Card className="mt-6"><CardHeader><p className="eyebrow text-primary">Riwayat</p><h2 className="mt-1 font-display text-lg font-semibold">Aktivitas sales order</h2></CardHeader><CardContent>{loading ? <LoadingState label="Memuat aktivitas…" /> : error ? <ErrorState message={error.message} onRetry={reload} /> : items.length === 0 ? <EmptyState title="Belum ada aktivitas" description="Perubahan pada sales order akan muncul di sini." /> : <ol className="space-y-4 border-l border-outline-variant pl-4">{items.map((item, index) => <li className="relative" key={item._id ?? item.id ?? `${item.eventType}-${index}`}><span aria-hidden="true" className="absolute -left-[1.32rem] top-1.5 h-2 w-2 rounded-full bg-primary" /><p className="text-sm font-semibold">{item.title ?? item.message ?? item.eventType ?? item.type ?? 'Aktivitas'}</p><p className="mt-1 text-sm text-on-surface-variant">{item.description ?? item.body ?? item.actorName ?? ''}</p><time className="mt-1 block text-xs text-on-surface-variant" dateTime={item.createdAt}>{formatDateTime(item.createdAt)}</time></li>)}</ol>}</CardContent></Card>;
}
