'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import { ErrorState, LoadingState } from '../../../../components/data-state.js';
import { PageHeader } from '../../../../components/page-header.js';
import { StatusBadge } from '../../../../components/status-badge.js';
import { Card, CardContent, CardHeader } from '../../../../components/ui/card.js';
import { Table, TableScroll, Td, Th, Tr } from '../../../../components/ui/table.js';
import { salesOrdersApi } from '../../../../lib/api-client.js';
import { formatCurrency, formatDateTime, salesOrderStatus } from '../../../../lib/master-data.js';
import { useApiData } from '../../../../lib/use-api-data.js';

function InfoItem({ label, children }) {
  return (
    <div>
      <dt className="ledger-label">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-on-surface">{children}</dd>
    </div>
  );
}

function Quantity({ value, ordered }) {
  const reached = Number(value) > 0;
  return (
    <span className={`tabular ${reached ? 'font-semibold text-on-surface' : 'text-on-surface-variant'}`}>
      {value}
      <span className="text-xs font-normal text-on-surface-variant"> / {ordered}</span>
    </span>
  );
}

export default function SalesOrderDetailPage() {
  const { id } = useParams();
  const { data, loading, error, reload } = useApiData(() => salesOrdersApi.get(id), [id]);
  const order = data?.salesOrder;

  if (loading && !order) {
    return (
      <>
        <PageHeader eyebrow="Penjualan" title="Detail sales order" />
        <Card><LoadingState label="Memuat sales order…" /></Card>
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <PageHeader eyebrow="Penjualan" title="Detail sales order" />
        <Card><ErrorState message={error?.message ?? 'Sales order tidak ditemukan.'} onRetry={reload} /></Card>
      </>
    );
  }

  const badge = salesOrderStatus(order.status);

  return (
    <>
      <PageHeader
        actions={<Link className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface" href="/sales-orders"><FiArrowLeft aria-hidden="true" className="h-4 w-4" />Kembali</Link>}
        description={order.customerName}
        eyebrow="Sales order"
        title={(
          <span className="inline-flex flex-wrap items-center gap-3">
            <span className="font-mono text-xl tracking-tight sm:text-2xl">{order.soNumber}</span>
            <StatusBadge label={badge.label} tone={badge.tone} />
          </span>
        )}
      />

      <div className="grid gap-6 xl:grid-cols-12">
        <div className="min-w-0 space-y-6 xl:col-span-8">
          <Card>
            <CardHeader>
              <p className="eyebrow text-primary">Item & progres</p>
              <h2 className="mt-1 font-display text-lg font-semibold text-on-surface">Kuantitas per tahap</h2>
            </CardHeader>
            <TableScroll>
              <Table className="min-w-[52rem]">
                <thead>
                  <tr>
                    <Th>SKU</Th>
                    <Th>Nama item</Th>
                    <Th className="text-right">Diterima</Th>
                    <Th className="text-right">Dikirim</Th>
                    <Th className="text-right">Ditagih</Th>
                    <Th className="text-right">Harga satuan</Th>
                    <Th className="text-right">Jumlah</Th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, index) => (
                    <Tr key={`${item.sku}-${index}`}>
                      <Td className="whitespace-nowrap font-mono text-xs">{item.sku}</Td>
                      <Td className="min-w-[12rem]">
                        <p className="font-semibold text-on-surface">{item.name}</p>
                        <p className="mt-0.5 text-xs text-on-surface-variant">Qty order: <span className="tabular font-semibold text-on-surface">{item.qtyOrdered}</span></p>
                      </Td>
                      <Td className="text-right"><Quantity ordered={item.qtyOrdered} value={item.qtyReceived} /></Td>
                      <Td className="text-right"><Quantity ordered={item.qtyOrdered} value={item.qtyShipped} /></Td>
                      <Td className="text-right"><Quantity ordered={item.qtyOrdered} value={item.qtyInvoiced} /></Td>
                      <Td className="whitespace-nowrap text-right tabular">{formatCurrency(item.unitPrice)}</Td>
                      <Td className="whitespace-nowrap text-right font-semibold tabular">{formatCurrency(Number(item.qtyOrdered) * Number(item.unitPrice))}</Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </TableScroll>
            <div className="flex items-center justify-between gap-4 border-t border-outline-variant bg-surface-container-low px-5 py-4 sm:px-6">
              <p className="text-sm text-on-surface-variant">Total ({order.items.length} item)</p>
              <p className="font-display text-xl font-semibold tabular text-on-surface">{formatCurrency(order.totalAmount)}</p>
            </div>
          </Card>

          <p className="text-xs leading-5 text-on-surface-variant">
            Progres kuantitas diterima, dikirim, dan ditagih diperbarui oleh fase berikutnya. Fase 3 hanya menampilkan nilai awal dari server.
          </p>
        </div>

        <div className="min-w-0 xl:col-span-4">
          <Card as="aside" aria-label="Informasi sales order" className="bg-surface-container-low">
            <CardHeader>
              <p className="eyebrow">Ringkasan</p>
              <h2 className="mt-1 font-display text-lg font-semibold text-on-surface">Informasi dokumen</h2>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <InfoItem label="Customer">{order.customerName}</InfoItem>
                <InfoItem label="PO customer">{order.customerPoNumber || '—'}</InfoItem>
                <InfoItem label="Quotation">
                  <Link className="font-mono text-xs text-primary underline underline-offset-4" href={`/quotations/${order.quotationId}`}>
                    {order.quotationNumber}
                  </Link>
                </InfoItem>
                <InfoItem label="Sales">{order.salesName ?? '—'}</InfoItem>
                <InfoItem label="Dibuat">{formatDateTime(order.createdAt)}</InfoItem>
              </dl>
              <p className="mt-5 border-t border-outline-variant pt-4 text-xs leading-5 text-on-surface-variant">
                Tidak ada pembuatan atau perubahan manual untuk sales order. Dokumen ini hanya lahir dari konversi quotation.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
