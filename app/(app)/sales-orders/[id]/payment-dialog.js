'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Field } from '../../../../components/data-state.js';
import { Button } from '../../../../components/ui/button.js';
import { Dialog } from '../../../../components/ui/dialog.js';
import { Input } from '../../../../components/ui/input.js';
import { Select } from '../../../../components/ui/select.js';
import { paymentApi } from '../../../../lib/api-client.js';
import { formatCurrency } from '../../../../lib/master-data.js';

export function PaymentDialog({ invoice, open, onClose, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');
  const [paidAt, setPaidAt] = useState(new Date().toISOString().slice(0, 10));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const outstanding = Math.max(0, Number(invoice.totalAmount) - Number(invoice.paidAmount));

  async function submit(event) {
    event.preventDefault();
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0 || value > outstanding) {
      setError(`Nominal harus lebih dari 0 dan maksimal ${formatCurrency(outstanding)}.`);
      return;
    }
    setBusy(true); setError('');
    try {
      await paymentApi.create({ invoiceId: invoice._id, amount: value, paymentMethod, paidAt: new Date(`${paidAt}T12:00:00+07:00`).toISOString() });
      toast.success('Pembayaran berhasil dicatat.');
      onSuccess(); onClose();
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  return <Dialog description={`Sisa piutang ${formatCurrency(outstanding)} pada ${invoice.invoiceNumber}.`} onClose={onClose} open title="Catat pembayaran AR"><form className="space-y-4" onSubmit={submit}><Field error={error} htmlFor="payment-amount" label="Nominal pembayaran"><Input aria-describedby={error ? 'payment-amount-error' : undefined} id="payment-amount" min="0.01" onChange={(event) => setAmount(event.target.value)} placeholder="0" required step="0.01" type="number" value={amount} /></Field><Field htmlFor="payment-method" label="Metode pembayaran"><Select id="payment-method" onChange={(event) => setPaymentMethod(event.target.value)} value={paymentMethod}><option value="BANK_TRANSFER">Transfer bank</option><option value="GIRO">Giro</option><option value="CASH">Tunai</option><option value="OTHER">Lainnya</option></Select></Field><Field htmlFor="paid-at" label="Tanggal pembayaran"><Input id="paid-at" onChange={(event) => setPaidAt(event.target.value)} required type="date" value={paidAt} /></Field><div className="flex justify-end gap-2 border-t border-outline-variant pt-4"><Button onClick={onClose} type="button" variant="outline">Batal</Button><Button disabled={busy} type="submit">{busy ? 'Menyimpan…' : 'Catat pembayaran'}</Button></div></form></Dialog>;
}
