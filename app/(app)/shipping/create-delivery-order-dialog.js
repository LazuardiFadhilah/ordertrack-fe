'use client';

import { useState } from 'react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { toast } from 'sonner';
import { ErrorState, Field, LoadingState } from '../../../components/data-state.js';
import { Button } from '../../../components/ui/button.js';
import { Dialog } from '../../../components/ui/dialog.js';
import { Input } from '../../../components/ui/input.js';
import { Select } from '../../../components/ui/select.js';
import { shippingApi } from '../../../lib/api-client.js';
import { useApiData } from '../../../lib/use-api-data.js';

export function CreateDeliveryOrderDialog({ open, onClose, onSuccess }) {
  const [shippingRequestId, setShippingRequestId] = useState('');
  const [items, setItems] = useState([{ soItemIndex: 0, qty: '' }]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const { data: requestsData, loading, error, reload } = useApiData(
    () => (open ? shippingApi.listRequests({ status: 'REQUESTED', limit: 100 }) : Promise.resolve(null)),
    [open],
  );

  const requests = requestsData?.items ?? [];
  const selectedRequest = requests.find((r) => r.id === shippingRequestId);

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
    setShippingRequestId('');
    setItems([{ soItemIndex: 0, qty: '' }]);
    setErrors({});
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!shippingRequestId) nextErrors.shippingRequestId = 'Pilih permintaan kirim.';

    const enrichedItems = items.map((item) => ({ soItemIndex: Number(item.soItemIndex), qty: Number(item.qty) }));
    enrichedItems.forEach((item, index) => {
      const srItem = selectedRequest?.items.find((i) => i.soItemIndex === item.soItemIndex);
      if (!srItem) {
        nextErrors[`items.${index}.soItemIndex`] = 'Item tidak ada di permintaan kirim.';
      }
      if (!Number.isInteger(item.qty) || item.qty < 1) {
        nextErrors[`items.${index}.qty`] = 'Qty minimal 1.';
      }
      if (srItem && item.qty > srItem.qty) {
        nextErrors[`items.${index}.qty`] = `Maksimal ${srItem.qty}.`;
      }
    });

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error('Periksa kembali field yang ditandai.');
      return;
    }

    setSaving(true);
    try {
      const result = await shippingApi.createDeliveryOrder({
        shippingRequestId,
        items: enrichedItems,
      });
      toast.success(`Surat jalan ${result.deliveryOrder.doNumber} dibuat.`);
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
      description="Buat surat jalan dari permintaan kirim yang sudah disetujui."
      onClose={handleClose}
      open={open}
      title="Buat Surat Jalan"
      wide
    >
      {loading ? <LoadingState label="Memuat permintaan kirim…" /> : error ? (
        <ErrorState message={error.message} onRetry={reload} />
      ) : (
        <form className="space-y-5" noValidate onSubmit={handleSubmit}>
          <Field error={errors.shippingRequestId} htmlFor="do-sr" label="Permintaan Kirim">
            <Select
              aria-invalid={Boolean(errors.shippingRequestId)}
              disabled={saving}
              id="do-sr"
              onChange={(event) => { setShippingRequestId(event.target.value); setItems([{ soItemIndex: 0, qty: '' }]); setErrors((current) => ({ ...current, shippingRequestId: undefined })); }}
              value={shippingRequestId}
            >
              <option value="">Pilih permintaan kirim</option>
              {requests.map((sr) => (
                <option key={sr.id} value={sr.id}>{sr.srNumber} — {sr.soNumber}</option>
              ))}
            </Select>
          </Field>

          {requests.length === 0 && (
            <p className="text-sm text-on-surface-variant">Belum ada permintaan kirim berstatus REQUESTED. Sales harus membuat permintaan kirim terlebih dahulu.</p>
          )}

          {selectedRequest && (
            <div className="space-y-3">
              {items.map((item, index) => {
                const srItem = selectedRequest.items.find((i) => i.soItemIndex === Number(item.soItemIndex));
                return (
                  <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4" key={index}>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="ledger-label">Item surat jalan {index + 1}</p>
                      <Button aria-label={`Hapus item ${index + 1}`} disabled={saving || items.length === 1} onClick={() => removeItem(index)} size="sm" type="button" variant="ghost">
                        <FiTrash2 aria-hidden="true" className="h-3.5 w-3.5" />
                        Hapus
                      </Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field error={errors[`items.${index}.soItemIndex`]} htmlFor={`do-item-${index}`} label="Item permintaan">
                        <Select
                          aria-invalid={Boolean(errors[`items.${index}.soItemIndex`])}
                          disabled={saving}
                          id={`do-item-${index}`}
                          onChange={(event) => updateItem(index, 'soItemIndex', event.target.value)}
                          value={item.soItemIndex}
                        >
                          {selectedRequest.items.map((srItem, i) => (
                            <option key={i} value={srItem.soItemIndex}>{srItem.sku} — {srItem.name} (max {srItem.qty})</option>
                          ))}
                        </Select>
                      </Field>
                      <Field error={errors[`items.${index}.qty`]} htmlFor={`do-qty-${index}`} label={`Qty dikirim (max ${srItem?.qty ?? 0})`}>
                        <Input
                          aria-invalid={Boolean(errors[`items.${index}.qty`])}
                          disabled={saving}
                          id={`do-qty-${index}`}
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
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button disabled={saving} onClick={handleClose} type="button" variant="ghost">Batal</Button>
            <Button disabled={saving || !selectedRequest} type="submit">{saving ? 'Menyimpan…' : 'Simpan Surat Jalan'}</Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
