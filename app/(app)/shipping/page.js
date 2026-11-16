'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiCheck, FiPackage, FiPlus, FiTruck } from 'react-icons/fi';
import { toast } from 'sonner';
import { EmptyState, ErrorState, LoadingState } from '../../../components/data-state.js';
import { PageHeader } from '../../../components/page-header.js';
import { Pagination } from '../../../components/pagination.js';
import { useSession } from '../../../components/session.js';
import { StatusBadge } from '../../../components/status-badge.js';
import { Button } from '../../../components/ui/button.js';
import { Card, CardContent, CardHeader } from '../../../components/ui/card.js';
import { Table, TableScroll, Td, Th, Tr } from '../../../components/ui/table.js';
import { shippingApi } from '../../../lib/api-client.js';
import { formatDateTime, salesOrderStatus } from '../../../lib/master-data.js';
import { useApiData } from '../../../lib/use-api-data.js';
import { CreateDeliveryOrderDialog } from './create-delivery-order-dialog.js';

const TABS = [
  { key: 'requests', label: 'Permintaan kirim', icon: FiPackage },
  { key: 'deliveryOrders', label: 'Surat jalan', icon: FiTruck },
];

const limit = 20;

function StatusCell({ status }) {
  const badge = salesOrderStatus(status);
  return <StatusBadge label={badge.label} tone={badge.tone} />;
}

export default function ShippingPage() {
  const user = useSession();
  const [activeTab, setActiveTab] = useState('requests');
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [openCreateDo, setOpenCreateDo] = useState(false);

  const apiCall = activeTab === 'requests'
    ? () => shippingApi.listRequests({ page, limit })
    : () => shippingApi.listDeliveryOrders({ page, limit });

  const { data, loading, error, reload } = useApiData(apiCall, [activeTab, page, refreshKey]);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  async function handleMarkReturned(id) {
    try {
      const result = await shippingApi.markSignedReturned(id);
      toast.success(`Surat jalan ${result.deliveryOrder.doNumber} ditandai sebagai DO kembali.`);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <>
      <PageHeader
        description="Kelola permintaan pengiriman dan surat jalan dari sales order."
        eyebrow="Operasional"
        title="Pengiriman"
      />

      <Card>
        <div className="flex flex-col gap-3 border-b border-outline-variant p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-6 border-b border-outline-variant">
            <div className="flex flex-wrap gap-1">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    aria-current={active ? 'page' : undefined}
                    className={`inline-flex min-h-11 items-center gap-2 rounded-t-lg border-b-2 px-4 py-2 text-sm font-semibold transition-colors ${active ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:bg-surface-container hover:text-on-surface'}`}
                    onClick={() => { setActiveTab(tab.key); setPage(1); }}
                    type="button"
                  >
                    <Icon aria-hidden="true" className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
          {activeTab === 'deliveryOrders' && (user.role === 'GA' || user.role === 'ADMIN') && (
            <Button onClick={() => setOpenCreateDo(true)} size="sm">
              <FiPlus aria-hidden="true" className="h-3.5 w-3.5" />
              Surat Jalan
            </Button>
          )}
        </div>

        {loading ? <LoadingState label="Memuat data pengiriman…" /> : error ? (
          <ErrorState message={error.message} onRetry={reload} />
        ) : items.length === 0 ? (
          <EmptyState
            description={activeTab === 'requests'
              ? 'Sales membuat permintaan kirim dari detail sales order.'
              : 'GA membuat surat jalan setelah permintaan kirim disetujui.'}
            title={activeTab === 'requests' ? 'Belum ada permintaan kirim' : 'Belum ada surat jalan'}
          />
        ) : (
          <>
            <TableScroll>
              <Table className="min-w-[44rem]">
                <thead>
                  <tr>
                    <Th>Nomor</Th>
                    <Th>Sales order</Th>
                    <Th>Status</Th>
                    <Th>Dibuat</Th>
                    {activeTab === 'deliveryOrders' && <Th>Aksi</Th>}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <Tr key={item.id}>
                      <Td className="whitespace-nowrap font-mono text-xs font-semibold">
                        {activeTab === 'requests' ? item.srNumber : item.doNumber}
                      </Td>
                      <Td className="min-w-[12rem]">
                        <Link className="font-mono text-xs text-primary underline underline-offset-4" href={`/sales-orders/${item.soId}`}>
                          {item.soNumber}
                        </Link>
                      </Td>
                      <Td><StatusCell status={item.status} /></Td>
                      <Td className="whitespace-nowrap text-on-surface-variant">{formatDateTime(item.createdAt)}</Td>
                      {activeTab === 'deliveryOrders' && (
                        <Td>
                          {item.status === 'SHIPPED' && (user.role === 'GA' || user.role === 'ADMIN' || user.role === 'AR') ? (
                            <Button onClick={() => handleMarkReturned(item.id)} size="sm" variant="outline">
                              <FiCheck aria-hidden="true" className="h-3.5 w-3.5" />
                              DO kembali
                            </Button>
                          ) : (
                            <span className="text-sm text-on-surface-variant">—</span>
                          )}
                        </Td>
                      )}
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </TableScroll>
            <Pagination disabled={loading} limit={limit} onPageChange={setPage} page={page} total={total} />
          </>
        )}
      </Card>

      <CreateDeliveryOrderDialog
        onClose={() => setOpenCreateDo(false)}
        onSuccess={() => setRefreshKey((k) => k + 1)}
        open={openCreateDo}
      />
    </>
  );
}
