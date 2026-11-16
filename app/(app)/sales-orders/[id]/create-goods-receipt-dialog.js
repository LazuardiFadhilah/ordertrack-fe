'use client';

import { useState } from 'react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { toast } from 'sonner';
import { ErrorState, Field, LoadingState } from '../../../../components/data-state.js';
import { Button } from '../../../../components/ui/button.js';
import { Dialog } from '../../../../components/ui/dialog.js';
import { Input } from '../../../../components/ui/input.js';
import { Select } from '../../../../components/ui/select.js';
import { goodsReceiptsApi, vendorPosApi } from '../../../../lib/api-client.js';
import { useApiData } from '../../../../lib/use-api-data.js';

export function CreateGoodsReceiptDialog({ open, onClose, onSuccess, salesOrder }) {
  const [vendorPoId, setVendorPoId] = useState('');
  const [items, setItems] = useState([{ soItemIndex: 0, qtyReceived: '' }]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const { data: vendorPosData, loading: loadingVpos, error: vposError, reload } = useApiData(
    () => (open ? vendorPosApi.list({ soId: salesOrder?.id, limit: 100 }) : Promise.resolve(null)),
    [open, salesOrder?.id],
  );

  const availableItems = salesOrder?.items ?? [];
  const vendorPosList = vendorPosData?.items ?? [];

  function addItem() {
    setItems((current) => [...current, { soItemIndex: 0, qtyReceived: '' }]);
  }

  function removeItem(index) {
    if (items.length === 1) return;
    setItems((current) => current.filter((_, i) => i !== index));
  }

  function updateItem(index, field, value) {
    setItems((current) => current.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
    setErrors((current) => ({ ...current, [`items.${index}.${field}`]: undefined }));
  }

  function reset() {
    setVendorPoId('');
    setItems([{ soItemIndex: 0, qtyReceived: '' }]);
    setErrors({});
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!vendorPoId) nextErrors.vendorPoId = 'Pilih Vendor PO.';

    const enrichedItems = items.map((item) => ({ soItemIndex: Number(item.soItemIndex), qtyReceived: Number(item.qtyReceived) }));
    enrichedItems.forEach((item, index) => {
      if (!Number.isInteger(item.soItemIndex) || item.soItemIndex < 0 || item.soItemIndex >= availableItems.length) {
        nextErrors[`items.${index}.soItemIndex`] = 'Pilih item yang valid.';
      }
      if (!Number.isInteger(item.qtyReceived) || item.qtyReceived < 1) {
        nextErrors[`items.${index}.qtyReceived`] = 'Qty diterima minimal 1.';
      }
      const soItem = availableItems[item.soItemIndex];
      if (soItem && item.qtyReceived > soItem.qtyOrdered - soItem.qtyReceived) {
        nextErrors[`items.${index}.qtyReceived`] = `Sisa yang boleh diterima: ${soItem.qtyOrdered - soItem.qtyReceived}.`;
      }
    });

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error('Periksa kembali field yang ditandai.');
      return;
    }

    setSaving(true);
    try {
      const result = await goodsReceiptsApi.create({
        soId: salesOrder.id,
        vendorPoId,
        items: enrichedItems,
      });
      toast.success(`Goods Receipt ${result.goodsReceipt.grNumber} dibuat.`);
      reset();
      onSuccess();
      onClose();
    } catch (err) {
      setErrors(err.fieldErrors?.() ?? {});
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    if (!saving) onClose();
  }

  return (
    <Dialog
      description="Catat barang yang diterima dari Vendor PO."
      onClose={handleClose}
      open={open}
      title="Input Penerimaan Barang"
      wide
    >
      {loadingVpos ? <LoadingState label="Memuat Vendor PO…" /> : vposError ? (
        <ErrorState message={vposError.message} onRetry={reload} />
      ) : (
        <form className="space-y-5" noValidate onSubmit={handleSubmit}>
          <Field error={errors.vendorPoId} htmlFor="gr-vpo" label="Vendor PO">
            <Select
              aria-invalid={Boolean(errors.vendorPoId)}
              disabled={saving}
              id="gr-vpo"
              onChange={(event) => { setVendorPoId(event.target.value); setErrors((current) => ({ ...current, vendorPoId: undefined })); }}
              value={vendorPoId}
            >
              <option value="">Pilih Vendor PO</option>
              {vendorPosList.map((vpo) => (
                <option key={vpo.id} value={vpo.id}>{vpo.poNumber} — {vpo.vendorName}</option>
              ))}
            </Select>
          </Field>

          {vendorPosList.length === 0 && (
            <p className="text-sm text-on-surface-variant">Belum ada Vendor PO untuk SO ini. Minta Purchasing membuat Vendor PO terlebih dahulu.</p>
          )}

          <div className="space-y-3">
            {items.map((item, index) => {
              const soItem = availableItems[item.soItemIndex];
              const remaining = soItem ? soItem.qtyOrdered - soItem.qtyReceived : 0;
              return (
                <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4" key={index}>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="ledger-label">Item diterima {index + 1}</p>
                    <Button aria-label={`Hapus item ${index + 1}`} disabled={saving || items.length === 1} onClick={() => removeItem(index)} size="sm" type="button" variant="ghost">
                      <FiTrash2 aria-hidden="true" className="h-3.5 w-3.5" />
                      Hapus
                    </Button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field error={errors[`items.${index}.soItemIndex`]} htmlFor={`gr-item-${index}`} label="Item SO">
                      <Select
                        aria-invalid={Boolean(errors[`items.${index}.soItemIndex`])}
                        disabled={saving}
                        id={`gr-item-${index}`}
                        onChange={(event) => updateItem(index, 'soItemIndex', event.target.value)}
                        value={item.soItemIndex}
                      >
                        {availableItems.map((soItem, i) => (
                          <option key={i} value={i}>{soItem.sku} — {soItem.name}</option>
                        ))}
                      </Select>
                    </Field>
                    <Field error={errors[`items.${index}.qtyReceived`]} htmlFor={`gr-qty-${index}`} label={`Qty diterima (sisa ${remaining})`}>
                      <Input
                        aria-invalid={Boolean(errors[`items.${index}.qtyReceived`])}
                        disabled={saving}
                        id={`gr-qty-${index}`}
                        min="1"
                        onChange={(event) => updateItem(index, 'qtyReceived', event.target.value)}
                        step="1"
                        type="number"
                        value={item.qtyReceived}
                      />
                    </Field>
                  </div>
                </div>
              );
            })}
            <Button disabled={saving} onClick={addItem} size="sm" type="button" variant="outline">
              <FiPlus aria-hidden="true" className="h-3.5 w-3.5" />
              Tambah item
            </Button>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button disabled={saving} onClick={handleClose} type="button" variant="ghost">Batal</Button>
            <Button disabled={saving} type="submit">{saving ? 'Menyimpan…' : 'Simpan Penerimaan'}</Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
