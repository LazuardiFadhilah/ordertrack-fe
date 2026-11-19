'use client';

import { useState } from 'react';
import { FiDownload, FiEye, FiPlus } from 'react-icons/fi';
import { ErrorState, LoadingState } from '../../../../components/data-state.js';
import { Button } from '../../../../components/ui/button.js';
import { Card, CardContent, CardHeader } from '../../../../components/ui/card.js';
import { Dialog } from '../../../../components/ui/dialog.js';
import { documentsApi, documentUpload } from '../../../../lib/api-client.js';
import { useApiData } from '../../../../lib/use-api-data.js';

const LABELS = { PO_CUSTOMER: 'PO customer', VENDOR_PO: 'Vendor PO', GOODS_RECEIPT: 'Penerimaan barang', DO_SIGNED: 'DO signed', INVOICE: 'Invoice', RECEIPT_EXCHANGE: 'Tanda terima tukar faktur', PAYMENT_PROOF: 'Bukti pembayaran', OTHER: 'Lainnya' };
const MAX = 10 * 1024 * 1024;
const TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const formatSize = (size) => `${(size / 1024 / 1024).toFixed(2)} MB`;

export function DocumentsPanel({ soId, canUpload }) {
  const { data, loading, error, reload } = useApiData(() => documentsApi.list({ soId, limit: 100 }), [soId]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const documents = data?.items ?? data?.documents ?? [];
  const groups = Object.groupBy ? Object.groupBy(documents, (item) => item.refType) : documents.reduce((all, item) => ({ ...all, [item.refType]: [...(all[item.refType] ?? []), item] }), {});

  async function submit(event) {
    event.preventDefault(); setMessage('');
    const file = event.currentTarget.file.files[0];
    const refType = event.currentTarget.refType.value;
    if (!file || !TYPES.includes(file.type)) return setMessage('Pilih file PDF, JPG, atau PNG.');
    if (file.size > MAX) return setMessage('Ukuran file maksimal 10MB.');
    setBusy(true);
    try {
      const token = await documentsApi.uploadToken({ soId, fileName: file.name, mimeType: file.type, size: file.size });
      await documentUpload(token, file);
      await documentsApi.create({ soId, refType, fileName: file.name, mimeType: file.type, size: file.size, fileUrl: token.fileUrl });
      setOpen(false); reload();
    } catch (err) { setMessage(err.message); } finally { setBusy(false); }
  }

  return <Card>
    <CardHeader className="flex items-center justify-between"><div><p className="eyebrow text-primary">Folder sales order</p><h2 className="mt-1 font-display text-xl font-semibold">Dokumen</h2></div>{canUpload && <Button onClick={() => setOpen(true)} size="sm"><FiPlus /> Upload dokumen</Button>}</CardHeader>
    <CardContent>{loading ? <LoadingState label="Memuat dokumen…" /> : error ? <ErrorState message={error.message} onRetry={reload} /> : documents.length === 0 ? <p className="py-8 text-center text-sm text-on-surface-variant">Belum ada dokumen untuk sales order ini.</p> : <div className="space-y-5">{Object.entries(groups).map(([type, items]) => <section key={type}><h3 className="mb-2 text-sm font-semibold">{LABELS[type] ?? type}</h3><ul className="divide-y divide-outline-variant rounded-lg border border-outline-variant">{items.map((doc) => <li className="flex flex-wrap items-center gap-3 p-3" key={doc._id}><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{doc.fileName}</span><span className="text-xs text-on-surface-variant">{doc.mimeType} · {formatSize(doc.size)}</span></span><a aria-label={`Preview ${doc.fileName}`} className="rounded p-2 text-primary hover:bg-surface-container" href={doc.fileUrl} rel="noreferrer" target="_blank"><FiEye /></a><a aria-label={`Download ${doc.fileName}`} className="rounded p-2 text-primary hover:bg-surface-container" download href={doc.fileUrl}><FiDownload /></a></li>)}</ul></section>)}</div>}</CardContent>
    {open && <Dialog onClose={() => setOpen(false)} open title="Upload dokumen" description="PDF, JPG, atau PNG. Maksimal 10MB."><form className="space-y-4" onSubmit={submit}><label className="block text-sm font-semibold">Referensi<select className="mt-1 block w-full rounded-lg border border-outline-variant bg-surface p-2" name="refType" defaultValue="OTHER"><option value="PO_CUSTOMER">PO customer</option><option value="DO_SIGNED">DO signed</option><option value="RECEIPT_EXCHANGE">Tanda terima tukar faktur</option><option value="OTHER">Lainnya</option></select></label><label className="block text-sm font-semibold">File<input accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" className="mt-1 block w-full text-sm" name="file" required type="file" /></label>{message && <p className="text-sm text-danger" role="alert">{message}</p>}<div className="flex justify-end gap-2"><Button onClick={() => setOpen(false)} type="button" variant="outline">Batal</Button><Button disabled={busy} type="submit">{busy ? 'Mengunggah…' : 'Upload'}</Button></div></form></Dialog>}
  </Card>;
}
