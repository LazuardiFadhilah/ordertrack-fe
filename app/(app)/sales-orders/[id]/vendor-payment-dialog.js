'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Field } from '../../../../components/data-state.js';
import { Button } from '../../../../components/ui/button.js';
import { Dialog } from '../../../../components/ui/dialog.js';
import { Input } from '../../../../components/ui/input.js';
import { Select } from '../../../../components/ui/select.js';
import { vendorPaymentsApi } from '../../../../lib/api-client.js';

export function VendorPaymentDialog({ salesOrder, open, onClose, onSuccess }) {
  const [vendorPoId, setVendorPoId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');
  const [reference, setReference] = useState('');
  const [paidAt, setPaidAt] = useState(new Date().toISOString().slice(0, 10));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const vendorPos = salesOrder?.vendorPos?.filter((vpo) => vpo.status !== 'CLOSED') ?? [];

  async function submit(event) {
    event.preventDefault();
    if (!vendorPoId) {
      setError('Pilih Vendor PO terlebih dahulu.');
      return;
    }
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setError('Nominal harus lebih dari 0.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await vendorPaymentsApi.create({
        vendorPoId,
        amount: value,
        paymentMethod,
        reference,
        paidAt: new Date(`${paidAt}T12:00:00+07:00`).toISOString(),
      });
      toast.success('Pembayaran vendor berhasil dicatat.');
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      description={`Catat pembayaran untuk barang yang diterima pada ${salesOrder.soNumber}.`}
      onClose={onClose}
      open={open}
      title="Catat pembayaran vendor"
    >
      <form className="space-y-4" onSubmit={submit}>
        <Field error={error} htmlFor="vendor-po" label="Vendor PO">
          <Select
            aria-describedby={error ? 'vendor-po-error' : undefined}
            id="vendor-po"
            onChange={(event) => setVendorPoId(event.target.value)}
            required
            value={vendorPoId}
          >
            <option value="">Pilih Vendor PO</option>
            {vendorPos.map((vpo) => (
              <option key={vpo.id} value={vpo.id}>
                {vpo.poNumber} - {vpo.vendorName}
              </option>
            ))}
          </Select>
        </Field>
        <Field htmlFor="payment-amount" label="Nominal pembayaran">
          <Input
            id="payment-amount"
            min="0.01"
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0"
            required
            step="0.01"
            type="number"
            value={amount}
          />
        </Field>
        <Field htmlFor="payment-method" label="Metode pembayaran">
          <Select id="payment-method" onChange={(event) => setPaymentMethod(event.target.value)} value={paymentMethod}>
            <option value="BANK_TRANSFER">Transfer bank</option>
            <option value="GIRO">Giro</option>
            <option value="CASH">Tunai</option>
            <option value="OTHER">Lainnya</option>
          </Select>
        </Field>
        <Field htmlFor="payment-reference" label="Referensi (opsional)">
          <Input
            id="payment-reference"
            onChange={(event) => setReference(event.target.value)}
            placeholder="Nomor referensi atau catatan"
            value={reference}
          />
        </Field>
        <Field htmlFor="paid-at" label="Tanggal pembayaran">
          <Input id="paid-at" onChange={(event) => setPaidAt(event.target.value)} required type="date" value={paidAt} />
        </Field>
        <div className="flex justify-end gap-2 border-t border-outline-variant pt-4">
          <Button onClick={onClose} type="button" variant="outline">
            Batal
          </Button>
          <Button disabled={busy} type="submit">
            {busy ? 'Menyimpan…' : 'Catat pembayaran'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
