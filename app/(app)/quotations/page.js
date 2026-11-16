'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import { EmptyState, ErrorState, LoadingState } from '../../../components/data-state.js';
import { PageHeader } from '../../../components/page-header.js';
import { Pagination } from '../../../components/pagination.js';
import { useSession } from '../../../components/session.js';
import { StatusBadge } from '../../../components/status-badge.js';
import { Button } from '../../../components/ui/button.js';
import { Card } from '../../../components/ui/card.js';
import { Select } from '../../../components/ui/select.js';
import { Table, TableScroll, Td, Th, Tr } from '../../../components/ui/table.js';
import { customersApi, quotationsApi } from '../../../lib/api-client.js';
import { QUOTATION_STATUSES, canWriteQuotation, formatCurrency, formatDate, quotationStatus } from '../../../lib/master-data.js';
import { useApiData } from '../../../lib/use-api-data.js';

const limit = 20;

export default function QuotationsPage() {
  const user = useSession();
  const [status, setStatus] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useApiData(() => quotationsApi.list({ status, customerId, page, limit }), [status, customerId, page]);
  const { data: customerData } = useApiData(() => customersApi.list({ limit: 100 }), []);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const hasFilter = Boolean(status || customerId);

  function changeStatus(value) {
    setStatus(value);
    setPage(1);
  }

  function changeCustomer(value) {
    setCustomerId(value);
    setPage(1);
  }

  return (
    <>
      <PageHeader
        description="Penawaran customer dari draft sampai dikonversi menjadi sales order."
        eyebrow="Penjualan"
        title="Quotation"
      />

      <Card>
        <div className="flex flex-col gap-3 border-b border-outline-variant p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="w-full sm:w-52">
              <label className="sr-only" htmlFor="quotation-status-filter">Filter status</label>
              <Select id="quotation-status-filter" onChange={(event) => changeStatus(event.target.value)} value={status}>
                <option value="">Semua status</option>
                {QUOTATION_STATUSES.map((value) => (
                  <option key={value} value={value}>{quotationStatus(value).label}</option>
                ))}
              </Select>
            </div>
            <div className="w-full sm:w-64">
              <label className="sr-only" htmlFor="quotation-customer-filter">Filter customer</label>
              <Select id="quotation-customer-filter" onChange={(event) => changeCustomer(event.target.value)} value={customerId}>
                <option value="">Semua customer</option>
                {(customerData?.items ?? []).map((customer) => (
                  <option key={customer.id} value={customer.id}>{customer.name}</option>
                ))}
              </Select>
            </div>
            {hasFilter && (
              <Button onClick={() => { changeStatus(''); changeCustomer(''); }} type="button" variant="ghost">Reset filter</Button>
            )}
          </div>
          {canWriteQuotation(user.role) && (
            <Link className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary shadow-sm transition-colors hover:bg-primary-container sm:w-auto" href="/quotations/new">
              <FiPlus aria-hidden="true" className="h-4 w-4" />
              Buat quotation
            </Link>
          )}
        </div>

        {loading ? <LoadingState label="Memuat quotation…" /> : error ? (
          <ErrorState message={error.message} onRetry={reload} />
        ) : items.length === 0 ? (
          <EmptyState
            action={canWriteQuotation(user.role) ? <Link className="text-sm font-semibold text-primary underline-offset-4 hover:underline" href="/quotations/new">Buat quotation pertama</Link> : null}
            description={hasFilter ? 'Tidak ada quotation yang cocok dengan filter.' : 'Quotation yang dibuat akan muncul di sini.'}
            title={hasFilter ? 'Filter tidak menemukan hasil' : 'Belum ada quotation'}
          />
        ) : (
          <>
            <TableScroll>
              <Table>
                <thead>
                  <tr>
                    <Th>Nomor</Th>
                    <Th>Customer</Th>
                    <Th className="text-right">Total</Th>
                    <Th>Status</Th>
                    <Th>Dibuat oleh</Th>
                    <Th>Tanggal</Th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((quotation) => {
                    const badge = quotationStatus(quotation.status);
                    return (
                      <Tr key={quotation.id}>
                        <Td>
                          <Link className="font-mono text-xs font-semibold text-primary underline-offset-4 hover:underline" href={`/quotations/${quotation.id}`}>
                            {quotation.number}
                          </Link>
                        </Td>
                        <Td className="min-w-[12rem] font-semibold">{quotation.customerName}</Td>
                        <Td className="whitespace-nowrap text-right font-semibold tabular">{formatCurrency(quotation.totalAmount)}</Td>
                        <Td><StatusBadge label={badge.label} tone={badge.tone} /></Td>
                        <Td className="whitespace-nowrap">{quotation.createdBy?.name ?? '—'}</Td>
                        <Td className="whitespace-nowrap text-on-surface-variant">{formatDate(quotation.createdAt)}</Td>
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
