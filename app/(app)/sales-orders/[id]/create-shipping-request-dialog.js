'use client';

import { useState } from 'react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { toast } from 'sonner';
import { ErrorState, Field, LoadingState } from '../../../../components/data-state.js';
import { Button } from '../../../../components/ui/button.js';
import { Dialog } from '../../../../components/ui/dialog.js';
import { Input } from '../../../../components/ui/input.js';
import { Select } from '../../../../components/ui/select.js';
import { shippingApi } from '../../../../lib/api-client.js';

export function CreateShippingRequestDialog({ open, onClose, onSuccess, salesOrder }) {
  const [items, setItems] = useState([{ soItemIndex: 0, qty: '' }]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const availableItems = salesOrder?.items ?? [];

  function addItem() {
    setItems((current) => [...current, { soItemIndex: 0, qty: '' }]);
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
    setItems([{ soItemIndex: 0, qty: '' }]);
    setErrors({});
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};

    const enrichedItems = items.map((item) => ({ soItemIndex: Number(item.soItemIndex), qty: Number(item.qty) }));
    enrichedItems.forEach((item, index) => {
      if (!Number.isInteger(item.soItemIndex) || item.soItemIndex < 0 || item.soItemIndex >= availableItems.length) {
        nextErrors[`items.${index}.soItemIndex`] = 'Pilih item yang valid.';
      }
      if (!Number.isInteger(item.qty) || item.qty < 1) {
        nextErrors[`items.${index}.qty`] = 'Qty minimal 1.';
      }
      const soItem = availableItems[item.soItemIndex];
      if (soItem) {
        const available = soItem.qtyReceived - (soItem.qtyShipped || 0);
        if (item.qty > available) {
          nextErrors[`items.${index}.qty`] = `Sisa bisa dikirim: ${available}.`;
        }
      }
    });

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error('Periksa kembali field yang ditandai.');
      return;
    }

    setSaving(true);
    try {
      const result = await shippingApi.createRequest({
        soId: salesOrder.id,
        items: enrichedItems,
      });
      toast.success(`Permintaan kirim ${result.shippingRequest.srNumber} dibuat.`);
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
      description="Buat permintaan pengiriman untuk item yang sudah diterima."
      onClose={handleClose}
      open={open}
      title="Buat Permintaan Kirim"
      wide
    >
      <form className="space-y-5" noValidate onSubmit={handleSubmit}>
        <div className="space-y-3">
          {items.map((item, index) => {
            const soItem = availableItems[item.soItemIndex];
            const available = soItem ? soItem.qtyReceived - (soItem.qtyShipped || 0) : 0;
            return (
              <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4" key={index}>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="ledger-label">Item dikirim {index + 1}</p>
                  <Button aria-label={`Hapus item ${index + 1}`} disabled={saving || items.length === 1} onClick={() => removeItem(index)} size="sm" type="button" variant="ghost">
                    <FiTrash2 aria-hidden="true" className="h-3.5 w-3.5" />
                    Hapus
                  </Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field error={errors[`items.${index}.soItemIndex`]} htmlFor={`sr-item-${index}`} label="Item SO">
                    <Select
                      aria-invalid={Boolean(errors[`items.${index}.soItemIndex`])}
                      disabled={saving}
                      id={`sr-item-${index}`}
                      onChange={(event) => updateItem(index, 'soItemIndex', event.target.value)}
                      value={item.soItemIndex}
                    >
                      {availableItems.map((soItem, i) => (
                        <option key={i} value={i}>{soItem.sku} — {soItem.name}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field error={errors[`items.${index}.qty`]} htmlFor={`sr-qty-${index}`} label={`Qty dikirim (sisa ${available})`}>
                    <Input
                      aria-invalid={Boolean(errors[`items.${index}.qty`])}
                      disabled={saving}
                      id={`sr-qty-${index}`}
                      min="1"
                      onChange={(event) => updateItem(index, 'qty', event.target.value)}
                      step="1"
                      type="number"
                      value={item.qty}
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
          <Button disabled={saving} type="submit">{saving ? 'Menyimpan…' : 'Simpan Permintaan'}</Button>
        </div>
      </form>
    </Dialog>
  );
}
