'use client';

import Link from 'next/link';
import { useState } from 'react';
import { EmptyState, ErrorState, LoadingState } from '../../../components/data-state.js';
import { PageHeader } from '../../../components/page-header.js';
import { Pagination } from '../../../components/pagination.js';
import { useSession } from '../../../components/session.js';
import { StatusBadge } from '../../../components/status-badge.js';
import { Card } from '../../../components/ui/card.js';
import { Select } from '../../../components/ui/select.js';
import { Table, TableScroll, Td, Th, Tr } from '../../../components/ui/table.js';
import { salesOrdersApi } from '../../../lib/api-client.js';
import { SALES_ORDER_STATUSES, formatCurrency, formatDate, salesOrderStatus } from '../../../lib/master-data.js';
import { useApiData } from '../../../lib/use-api-data.js';

const limit = 20;

export default function SalesOrdersPage() {
  const user = useSession();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useApiData(() => salesOrdersApi.list({ status, page, limit }), [status, page]);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const ownOnly = user.role === 'SALES';

  function changeStatus(value) {
    setStatus(value);
    setPage(1);
  }

  return (
    <>
      <PageHeader
        description={ownOnly ? 'Sales order milik Anda. Server hanya mengirimkan order dengan salesId Anda.' : 'Semua sales order yang lahir dari konversi quotation.'}
        eyebrow="Penjualan"
        title="Sales order"
      />

      <Card>
        <div className="flex flex-col gap-3 border-b border-outline-variant p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:w-56">
            <label className="sr-only" htmlFor="so-status-filter">Filter status</label>
            <Select id="so-status-filter" onChange={(event) => changeStatus(event.target.value)} value={status}>
              <option value="">Semua status</option>
              {SALES_ORDER_STATUSES.map((value) => (
                <option key={value} value={value}>{salesOrderStatus(value).label}</option>
              ))}
            </Select>
          </div>
          <p className="text-xs text-on-surface-variant">Sales order dibuat hanya melalui konversi quotation.</p>
        </div>

        {loading ? <LoadingState label="Memuat sales order…" /> : error ? (
          <ErrorState message={error.message} onRetry={reload} />
        ) : items.length === 0 ? (
          <EmptyState
            description={status ? 'Tidak ada sales order dengan status ini.' : 'Konversi quotation berstatus terkirim untuk membuat sales order pertama.'}
            title={status ? 'Filter tidak menemukan hasil' : 'Belum ada sales order'}
          />
        ) : (
          <>
            <TableScroll>
              <Table>
                <thead>
                  <tr>
                    <Th>Nomor SO</Th>
                    <Th>Customer</Th>
                    <Th>PO customer</Th>
                    <Th className="text-right">Total</Th>
                    <Th>Status</Th>
                    <Th>Sales</Th>
                    <Th>Tanggal</Th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((order) => {
                    const badge = salesOrderStatus(order.status);
                    return (
                      <Tr key={order.id}>
                        <Td>
                          <Link className="font-mono text-xs font-semibold text-primary underline-offset-4 hover:underline" href={`/sales-orders/${order.id}`}>
                            {order.soNumber}
                          </Link>
                        </Td>
                        <Td className="min-w-[12rem] font-semibold">{order.customerName}</Td>
                        <Td className="whitespace-nowrap font-mono text-xs">{order.customerPoNumber || '—'}</Td>
                        <Td className="whitespace-nowrap text-right font-semibold tabular">{formatCurrency(order.totalAmount)}</Td>
                        <Td><StatusBadge label={badge.label} tone={badge.tone} /></Td>
                        <Td className="whitespace-nowrap">{order.salesName ?? '—'}</Td>
                        <Td className="whitespace-nowrap text-on-surface-variant">{formatDate(order.createdAt)}</Td>
                      </Tr>
                    );
                  })}
                </tbody>
              </Table>
            </TableScroll>
            <Pagination disabled={loading} limit={limit} onPageChange={setPage} page={page} total={total} />
          </>
        )}
      </Card>
    </>
  );
}
