'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FiArrowUpRight, FiDollarSign, FiSearch } from 'react-icons/fi';
import { EmptyState, ErrorState, LoadingState } from '../../../components/data-state.js';
import { PageHeader } from '../../../components/page-header.js';
import { Card, CardHeader } from '../../../components/ui/card.js';
import { Input } from '../../../components/ui/input.js';
import { Table, TableScroll, Td, Th, Tr } from '../../../components/ui/table.js';
import { vendorPaymentsApi } from '../../../lib/api-client.js';
import { formatCurrency, formatDateTime } from '../../../lib/master-data.js';
import { useApiData } from '../../../lib/use-api-data.js';

export default function VendorPaymentsPage() {
  const [search, setSearch] = useState('');
  const { data, loading, error, reload } = useApiData(() => vendorPaymentsApi.list({ limit: 100 }), []);
  const payments = data?.payments ?? [];
  const filtered = payments.filter((payment) =>
    `${payment.paymentNumber} ${payment.vendorPoNumber} ${payment.vendorName} ${payment.soNumber}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <PageHeader eyebrow="Hutang usaha" title="Pembayaran vendor" description="Catat pembayaran ke vendor untuk barang yang diterima." />
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <FiDollarSign aria-hidden="true" className="h-4 w-4 text-primary" />
              <h2 className="font-display text-lg font-semibold">Riwayat pembayaran</h2>
            </div>
            <label className="relative w-full sm:w-64">
              <span className="sr-only">Cari pembayaran</span>
              <FiSearch aria-hidden="true" className="absolute left-3 top-3 h-4 w-4 text-on-surface-variant" />
              <Input
                aria-label="Cari pembayaran"
                className="pl-9"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari nomor / vendor / SO"
                value={search}
              />
            </label>
          </div>
        </CardHeader>
        {loading ? (
          <LoadingState label="Memuat pembayaran…" />
        ) : error ? (
          <ErrorState message={error.message} onRetry={reload} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Belum ada pembayaran"
            description={search ? 'Tidak ada pembayaran yang cocok dengan pencarian.' : 'Pembayaran vendor akan muncul setelah dicatat dari Sales Order.'}
          />
        ) : (
          <>
            <div className="divide-y divide-outline-variant sm:hidden">
              {filtered.map((payment) => (
                <article className="space-y-3 px-4 py-4" key={payment._id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-sm font-semibold">{payment.paymentNumber}</p>
                      <Link className="mt-1 inline-block text-sm text-primary underline underline-offset-4" href={`/sales-orders/${payment.soId}`}>
                        {payment.soNumber}
                      </Link>
                    </div>
                  </div>
                  <p className="text-sm text-on-surface-variant">{payment.vendorName}</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-on-surface-variant">Vendor PO</p>
                      <p className="mt-1 font-mono text-xs font-semibold">{payment.vendorPoNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant">Nominal</p>
                      <p className="mt-1 font-semibold tabular">{formatCurrency(payment.amount)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-on-surface-variant">
                    <span>
                      {payment.paymentMethod} · {formatDateTime(payment.paidAt)}
                    </span>
                    <Link
                      aria-label={`Buka SO ${payment.soNumber}`}
                      className="inline-flex min-h-11 items-center text-sm font-medium text-primary"
                      href={`/sales-orders/${payment.soId}`}
                    >
                      Detail
                      <FiArrowUpRight aria-hidden="true" className="ml-1" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
            <div className="hidden sm:block">
              <TableScroll>
                <Table className="min-w-[56rem]">
                  <thead>
                    <tr>
                      <Th>Nomor pembayaran</Th>
                      <Th>Vendor PO</Th>
                      <Th>Vendor</Th>
                      <Th>Sales order</Th>
                      <Th>Tanggal</Th>
                      <Th>Metode</Th>
                      <Th className="text-right">Nominal</Th>
                      <Th>
                        <span className="sr-only">Aksi</span>
                      </Th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((payment) => (
                      <Tr key={payment._id}>
                        <Td className="whitespace-nowrap font-mono text-xs font-semibold">{payment.paymentNumber}</Td>
                        <Td className="whitespace-nowrap font-mono text-xs">{payment.vendorPoNumber}</Td>
                        <Td>{payment.vendorName}</Td>
                        <Td>
                          <Link className="font-mono text-xs text-primary underline underline-offset-4" href={`/sales-orders/${payment.soId}`}>
                            {payment.soNumber}
                          </Link>
                        </Td>
                        <Td className="whitespace-nowrap">{formatDateTime(payment.paidAt)}</Td>
                        <Td>{payment.paymentMethod}</Td>
                        <Td className="whitespace-nowrap text-right font-semibold tabular">{formatCurrency(payment.amount)}</Td>
                        <Td>
                          <Link
                            aria-label={`Buka SO ${payment.soNumber}`}
                            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-primary hover:bg-surface-container"
                            href={`/sales-orders/${payment.soId}`}
                          >
                            <FiArrowUpRight aria-hidden="true" />
                          </Link>
                        </Td>
                      </Tr>
                    ))}
                  </tbody>
                </Table>
              </TableScroll>
            </div>
          </>
        )}
      </Card>
    </>
  );
}
