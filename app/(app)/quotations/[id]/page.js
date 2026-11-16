'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { FiArrowLeft, FiCheckCircle, FiRepeat, FiSend, FiXCircle } from 'react-icons/fi';
import { toast } from 'sonner';
import { ErrorState, Field, LoadingState } from '../../../../components/data-state.js';
import { PageHeader } from '../../../../components/page-header.js';
import { useSession } from '../../../../components/session.js';
import { StatusBadge } from '../../../../components/status-badge.js';
import { Button } from '../../../../components/ui/button.js';
import { Card, CardContent, CardHeader } from '../../../../components/ui/card.js';
import { Dialog } from '../../../../components/ui/dialog.js';
import { Input } from '../../../../components/ui/input.js';
import { Table, TableScroll, Td, Th, Tr } from '../../../../components/ui/table.js';
import { quotationsApi } from '../../../../lib/api-client.js';
import { canWriteQuotation, formatCurrency, formatDateTime, quotationStatus, validateCustomerPoNumber } from '../../../../lib/master-data.js';
import { useApiData } from '../../../../lib/use-api-data.js';

function InfoItem({ label, children }) {
  return (
    <div>
      <dt className="ledger-label">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-on-surface">{children}</dd>
    </div>
  );
}

export default function QuotationDetailPage() {
  const { id } = useParams();
  const user = useSession();
  const { data, loading, error, reload } = useApiData(() => quotationsApi.get(id), [id]);
  const [busy, setBusy] = useState(null);
  const [loseOpen, setLoseOpen] = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);
  const [poNumber, setPoNumber] = useState('');
  const [poError, setPoError] = useState('');
  const [converted, setConverted] = useState(null);

  const quotation = data?.quotation;
  const canWrite = canWriteQuotation(user.role);
  const isOwner = quotation?.createdBy?.id ? user.role !== 'SALES' || quotation.createdBy.id === user.id : user.role !== 'SALES';
  const canAct = canWrite && isOwner;

  async function handleSend() {
    setBusy('send');
    try {
      await quotationsApi.send(id);
      toast.success('Quotation ditandai terkirim.');
      reload();
    } catch (actionError) {
      toast.error(actionError.message);
    } finally {
      setBusy(null);
    }
  }

  async function handleLose() {
    setBusy('lose');
    try {
      await quotationsApi.lose(id);
      toast.success('Quotation ditandai tidak jadi.');
      setLoseOpen(false);
      reload();
    } catch (actionError) {
      toast.error(actionError.message);
    } finally {
      setBusy(null);
    }
  }

  async function handleConvert(event) {
    event.preventDefault();
    const nextError = validateCustomerPoNumber(poNumber);
    setPoError(nextError);
    if (nextError) return;

    setBusy('convert');
    try {
      const result = await quotationsApi.convert(id, poNumber.trim() ? { customerPoNumber: poNumber.trim() } : {});
      setConverted(result.salesOrder);
      setConvertOpen(false);
      toast.success(`Sales order ${result.salesOrder.soNumber} dibuat.`);
      reload();
    } catch (actionError) {
      toast.error(actionError.message);
    } finally {
      setBusy(null);
    }
  }

  if (loading && !quotation) {
    return (
      <>
        <PageHeader eyebrow="Penjualan" title="Detail quotation" />
        <Card><LoadingState label="Memuat quotation…" /></Card>
      </>
    );
  }

  if (error || !quotation) {
    return (
      <>
        <PageHeader eyebrow="Penjualan" title="Detail quotation" />
        <Card><ErrorState message={error?.message ?? 'Quotation tidak ditemukan.'} onRetry={reload} /></Card>
      </>
    );
  }

  const badge = quotationStatus(quotation.status);
  const linkedSalesOrderId = converted?.id ?? quotation.salesOrderId;

  return (
    <>
      <PageHeader
        actions={(
          <>
            <Link className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface" href="/quotations">
              <FiArrowLeft aria-hidden="true" className="h-4 w-4" />
              Kembali
            </Link>
            {canAct && quotation.status === 'DRAFT' && (
              <Button disabled={Boolean(busy)} onClick={handleSend} type="button" variant="outline">
                <FiSend aria-hidden="true" className="h-4 w-4" />
                {busy === 'send' ? 'Mengirim…' : 'Tandai terkirim'}
              </Button>
            )}
            {canAct && (quotation.status === 'DRAFT' || quotation.status === 'SENT') && (
              <Button disabled={Boolean(busy)} onClick={() => setLoseOpen(true)} type="button" variant="danger">
                <FiXCircle aria-hidden="true" className="h-4 w-4" />
                Tidak jadi
              </Button>
            )}
            {canAct && quotation.status === 'SENT' && (
              <Button disabled={Boolean(busy)} onClick={() => setConvertOpen(true)} type="button">
                <FiRepeat aria-hidden="true" className="h-4 w-4" />
                Konversi ke sales order
              </Button>
            )}
          </>
        )}
        description={quotation.customerName}
        eyebrow="Quotation"
        title={(
          <span className="inline-flex flex-wrap items-center gap-3">
            <span className="font-mono text-xl tracking-tight sm:text-2xl">{quotation.number}</span>
            <StatusBadge label={badge.label} tone={badge.tone} />
          </span>
        )}
      />

      {linkedSalesOrderId && (
        <div className="mb-6 flex flex-col gap-3 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2">
            <FiCheckCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{converted ? `Sales order ${converted.soNumber} dibuat dari quotation ini.` : 'Quotation ini sudah dikonversi menjadi sales order.'}</span>
          </p>
          <Link className="shrink-0 font-semibold underline underline-offset-4" href={`/sales-orders/${linkedSalesOrderId}`}>
            Buka sales order
          </Link>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-12">
        <div className="min-w-0 space-y-6 xl:col-span-8">
          <Card>
            <CardHeader>
              <p className="eyebrow text-primary">Item</p>
              <h2 className="mt-1 font-display text-lg font-semibold text-on-surface">Rincian penawaran</h2>
            </CardHeader>
            <TableScroll>
              <Table>
                <thead>
                  <tr>
                    <Th>SKU</Th>
                    <Th>Nama item</Th>
                    <Th className="text-right">Qty</Th>
                    <Th className="text-right">Harga satuan</Th>
                    <Th className="text-right">Jumlah</Th>
                  </tr>
                </thead>
                <tbody>
                  {quotation.items.map((item, index) => (
                    <Tr key={`${item.sku}-${index}`}>
                      <Td className="whitespace-nowrap font-mono text-xs">{item.sku}</Td>
                      <Td className="min-w-[12rem] font-semibold">{item.name}</Td>
                      <Td className="text-right tabular">{item.qty}</Td>
                      <Td className="whitespace-nowrap text-right tabular">{formatCurrency(item.unitPrice)}</Td>
                      <Td className="whitespace-nowrap text-right font-semibold tabular">{formatCurrency(item.lineTotal)}</Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </TableScroll>
            <div className="flex items-center justify-between gap-4 border-t border-outline-variant bg-surface-container-low px-5 py-4 sm:px-6">
              <p className="text-sm text-on-surface-variant">Total ({quotation.items.length} item)</p>
              <p className="font-display text-xl font-semibold tabular text-on-surface">{formatCurrency(quotation.totalAmount)}</p>
            </div>
          </Card>
        </div>

        <div className="min-w-0 xl:col-span-4">
          <Card as="aside" aria-label="Informasi quotation" className="bg-surface-container-low">
            <CardHeader>
              <p className="eyebrow">Ringkasan</p>
              <h2 className="mt-1 font-display text-lg font-semibold text-on-surface">Informasi dokumen</h2>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <InfoItem label="Customer">{quotation.customerName}</InfoItem>
                <InfoItem label="Dibuat oleh">{quotation.createdBy?.name ?? '—'}</InfoItem>
                <InfoItem label="Dibuat">{formatDateTime(quotation.createdAt)}</InfoItem>
                <InfoItem label="Diperbarui">{formatDateTime(quotation.updatedAt)}</InfoItem>
                <InfoItem label="Nomor sales order">
                  {linkedSalesOrderId ? (
                    <Link className="text-primary underline underline-offset-4" href={`/sales-orders/${linkedSalesOrderId}`}>
                      {converted?.soNumber ?? 'Lihat sales order'}
                    </Link>
                  ) : '—'}
                </InfoItem>
              </dl>
              <p className="mt-5 border-t border-outline-variant pt-4 text-xs leading-5 text-on-surface-variant">
                Nomor quotation dan total final dibuat oleh server. Perubahan status hanya melalui aksi di halaman ini.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog description="Quotation yang ditandai tidak jadi tidak dapat dikirim atau dikonversi lagi." onClose={() => setLoseOpen(false)} open={loseOpen} title="Tandai quotation tidak jadi?">
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button disabled={busy === 'lose'} onClick={() => setLoseOpen(false)} type="button" variant="ghost">Batal</Button>
          <Button disabled={busy === 'lose'} onClick={handleLose} type="button" variant="danger">
            {busy === 'lose' ? 'Menyimpan…' : 'Ya, tandai tidak jadi'}
          </Button>
        </div>
      </Dialog>

      <Dialog description="Sales order lahir dari konversi quotation terkirim. Nomor PO customer bersifat opsional." onClose={() => setConvertOpen(false)} open={convertOpen} title="Konversi ke sales order">
        <form className="space-y-4" noValidate onSubmit={handleConvert}>
          <Field error={poError} hint="Maksimal 60 karakter." htmlFor="customer-po-number" label="Nomor PO customer (opsional)">
            <Input aria-invalid={Boolean(poError)} disabled={busy === 'convert'} id="customer-po-number" maxLength={60} onChange={(event) => { setPoNumber(event.target.value); setPoError(''); }} placeholder="PO/CUSTOMER/001" value={poNumber} />
          </Field>
          <div className="flex flex-col-reverse gap-2 border-t border-outline-variant pt-4 sm:flex-row sm:justify-end">
            <Button disabled={busy === 'convert'} onClick={() => setConvertOpen(false)} type="button" variant="ghost">Batal</Button>
            <Button disabled={busy === 'convert'} type="submit">{busy === 'convert' ? 'Mengonversi…' : 'Konversi sekarang'}</Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
