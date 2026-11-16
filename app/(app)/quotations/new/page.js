'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FiArrowLeft, FiPlus, FiTrash2 } from 'react-icons/fi';
import { toast } from 'sonner';
import { EmptyState, ErrorState, Field, LoadingState } from '../../../../components/data-state.js';
import { PageHeader } from '../../../../components/page-header.js';
import { useSession } from '../../../../components/session.js';
import { Button } from '../../../../components/ui/button.js';
import { Card, CardContent, CardHeader } from '../../../../components/ui/card.js';
import { Input } from '../../../../components/ui/input.js';
import { Select } from '../../../../components/ui/select.js';
import { customersApi, quotationsApi } from '../../../../lib/api-client.js';
import { canWriteQuotation, computeQuotationTotals, emptyQuotationItem, formatCurrency, hasErrors, validateQuotation } from '../../../../lib/master-data.js';
import { useApiData } from '../../../../lib/use-api-data.js';

export default function NewQuotationPage() {
  const router = useRouter();
  const user = useSession();
  const canWrite = canWriteQuotation(user.role);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([emptyQuotationItem()]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const { data: customerData, loading: loadingCustomers, error: customerError, reload: reloadCustomers } = useApiData(
    () => (canWrite ? customersApi.list({ limit: 100 }) : Promise.resolve(null)),
    [canWrite],
  );

  const { lines, totalAmount } = computeQuotationTotals(items);

  function updateItem(index, field, value) {
    setItems((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)));
    setErrors((current) => ({ ...current, [`items.${index}.${field}`]: undefined }));
  }

  function addItem() {
    setItems((current) => [...current, emptyQuotationItem()]);
  }

  function removeItem(index) {
    if (items.length === 1) return;
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
    setErrors({});
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateQuotation({ customerId, items });
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) {
      toast.error('Periksa kembali field yang ditandai.');
      return;
    }

    setSaving(true);
    try {
      const result = await quotationsApi.create({
        customerId,
        items: items.map((item) => ({
          sku: item.sku.trim(),
          name: item.name.trim(),
          qty: Number(item.qty),
          unitPrice: Number(item.unitPrice),
        })),
      });
      toast.success(`Quotation ${result.quotation.number} dibuat.`);
      router.push(`/quotations/${result.quotation.id}`);
    } catch (error) {
      setErrors(error.fieldErrors?.() ?? {});
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  if (!canWrite) {
    return (
      <>
        <PageHeader description="Role Anda tidak memiliki izin membuat quotation." eyebrow="Penjualan" title="Buat quotation" />
        <Card>
          <EmptyState
            action={<Link className="text-sm font-semibold text-primary underline-offset-4 hover:underline" href="/quotations">Kembali ke daftar quotation</Link>}
            description="Hanya SALES dan ADMIN yang dapat membuat quotation."
            title="Tidak punya akses"
          />
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        actions={<Link className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface" href="/quotations"><FiArrowLeft aria-hidden="true" className="h-4 w-4" />Kembali</Link>}
        description="Nomor quotation dibuat otomatis oleh server. Total di bawah adalah perhitungan sementara; nilai tersimpan mengikuti respons server."
        eyebrow="Penjualan"
        title="Buat quotation"
      />

      <form noValidate onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <p className="eyebrow text-primary">Customer</p>
            <h2 className="mt-1 font-display text-lg font-semibold text-on-surface">Tujuan penawaran</h2>
          </CardHeader>
          <CardContent>
            {loadingCustomers ? <LoadingState label="Memuat customer…" /> : customerError ? (
              <ErrorState message={customerError.message} onRetry={reloadCustomers} />
            ) : (
              <Field error={errors.customerId} htmlFor="quotation-customer" label="Customer">
                <Select aria-invalid={Boolean(errors.customerId)} disabled={saving} id="quotation-customer" onChange={(event) => { setCustomerId(event.target.value); setErrors((current) => ({ ...current, customerId: undefined })); }} value={customerId}>
                  <option value="">Pilih customer</option>
                  {(customerData?.items ?? []).map((customer) => (
                    <option key={customer.id} value={customer.id}>{customer.name}</option>
                  ))}
                </Select>
              </Field>
            )}
            {!loadingCustomers && !customerError && (customerData?.items ?? []).length === 0 && (
              <p className="mt-3 text-sm text-on-surface-variant">Belum ada customer. Minta admin menambahkan data master customer terlebih dahulu.</p>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="eyebrow text-primary">Item</p>
              <h2 className="mt-1 font-display text-lg font-semibold text-on-surface">Baris penawaran</h2>
            </div>
            <Button disabled={saving} onClick={addItem} size="sm" type="button" variant="outline">
              <FiPlus aria-hidden="true" className="h-3.5 w-3.5" />
              Tambah item
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {errors.items && <p className="text-sm text-red-800" role="alert">{errors.items}</p>}
            {items.map((item, index) => (
              <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4" key={index}>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="ledger-label">Item {index + 1}</p>
                  <Button aria-label={`Hapus item ${index + 1}`} disabled={saving || items.length === 1} onClick={() => removeItem(index)} size="sm" type="button" variant="ghost">
                    <FiTrash2 aria-hidden="true" className="h-3.5 w-3.5" />
                    Hapus
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-12">
                  <Field className="lg:col-span-3" error={errors[`items.${index}.sku`]} htmlFor={`item-${index}-sku`} label="SKU">
                    <Input aria-invalid={Boolean(errors[`items.${index}.sku`])} disabled={saving} id={`item-${index}-sku`} maxLength={40} onChange={(event) => updateItem(index, 'sku', event.target.value)} value={item.sku} />
                  </Field>
                  <Field className="lg:col-span-4" error={errors[`items.${index}.name`]} htmlFor={`item-${index}-name`} label="Nama item">
                    <Input aria-invalid={Boolean(errors[`items.${index}.name`])} disabled={saving} id={`item-${index}-name`} maxLength={120} onChange={(event) => updateItem(index, 'name', event.target.value)} value={item.name} />
                  </Field>
                  <Field className="lg:col-span-2" error={errors[`items.${index}.qty`]} htmlFor={`item-${index}-qty`} label="Qty">
                    <Input aria-invalid={Boolean(errors[`items.${index}.qty`])} disabled={saving} id={`item-${index}-qty`} min="1" onChange={(event) => updateItem(index, 'qty', event.target.value)} step="1" type="number" value={item.qty} />
                  </Field>
                  <Field className="lg:col-span-3" error={errors[`items.${index}.unitPrice`]} htmlFor={`item-${index}-price`} label="Harga satuan">
                    <Input aria-invalid={Boolean(errors[`items.${index}.unitPrice`])} disabled={saving} id={`item-${index}-price`} min="0" onChange={(event) => updateItem(index, 'unitPrice', event.target.value)} step="0.01" type="number" value={item.unitPrice} />
                  </Field>
                </div>
                <p className="mt-3 border-t border-outline-variant pt-3 text-right text-sm text-on-surface-variant">
                  Jumlah baris: <span className="tabular font-semibold text-on-surface">{formatCurrency(lines[index]?.lineTotal)}</span>
                </p>
              </div>
            ))}
          </CardContent>
          <div className="flex flex-col gap-3 border-t border-outline-variant bg-surface-container-low px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-sm text-on-surface-variant">Total sementara ({items.length} item)</p>
            <p className="font-display text-xl font-semibold tabular text-on-surface">{formatCurrency(totalAmount)}</p>
          </div>
        </Card>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Link className="inline-flex min-h-11 items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface" href="/quotations">
            Batal
          </Link>
          <Button disabled={saving} type="submit">{saving ? 'Menyimpan…' : 'Simpan quotation'}</Button>
        </div>
      </form>
    </>
  );
}
