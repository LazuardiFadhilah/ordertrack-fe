'use client';

import { useState } from 'react';
import { FiEdit2, FiPlus, FiSearch } from 'react-icons/fi';
import { toast } from 'sonner';
import { EmptyState, ErrorState, Field, LoadingState } from '../../../components/data-state.js';
import { PageHeader } from '../../../components/page-header.js';
import { Pagination } from '../../../components/pagination.js';
import { useSession } from '../../../components/session.js';
import { Button } from '../../../components/ui/button.js';
import { Card } from '../../../components/ui/card.js';
import { Dialog } from '../../../components/ui/dialog.js';
import { Input } from '../../../components/ui/input.js';
import { Table, TableScroll, Td, Th, Tr } from '../../../components/ui/table.js';
import { vendorsApi } from '../../../lib/api-client.js';
import { canManageMasterData, hasErrors, validateVendor } from '../../../lib/master-data.js';
import { useApiData } from '../../../lib/use-api-data.js';

const limit = 20;

function VendorDialog({ vendor, onClose, onSaved }) {
  const [form, setForm] = useState({ name: vendor?.name ?? '', contact: vendor?.contact ?? '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateVendor(form);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setSaving(true);
    const payload = { name: form.name.trim(), contact: form.contact.trim() };

    try {
      if (vendor) await vendorsApi.update(vendor.id, payload);
      else await vendorsApi.create(payload);
      toast.success(vendor ? 'Vendor diperbarui.' : 'Vendor ditambahkan.');
      onSaved();
    } catch (error) {
      setErrors(error.fieldErrors?.() ?? {});
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog description="Data vendor dipakai tim purchasing saat membuat vendor PO pada fase berikutnya." onClose={onClose} open title={vendor ? 'Ubah vendor' : 'Tambah vendor'}>
      <form className="space-y-4" noValidate onSubmit={handleSubmit}>
        <Field error={errors.name} htmlFor="vendor-name" label="Nama vendor">
          <Input aria-invalid={Boolean(errors.name)} disabled={saving} id="vendor-name" maxLength={120} onChange={(event) => update('name', event.target.value)} value={form.name} />
        </Field>
        <Field error={errors.contact} htmlFor="vendor-contact" label="Kontak">
          <Input aria-invalid={Boolean(errors.contact)} disabled={saving} id="vendor-contact" maxLength={80} onChange={(event) => update('contact', event.target.value)} placeholder="Nama - nomor telepon" value={form.contact} />
        </Field>
        <div className="flex flex-col-reverse gap-2 border-t border-outline-variant pt-4 sm:flex-row sm:justify-end">
          <Button disabled={saving} onClick={onClose} type="button" variant="ghost">Batal</Button>
          <Button disabled={saving} type="submit">{saving ? 'Menyimpan…' : 'Simpan vendor'}</Button>
        </div>
      </form>
    </Dialog>
  );
}

export default function VendorsPage() {
  const user = useSession();
  const canWrite = canManageMasterData(user.role);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState(null);
  const { data, loading, error, reload } = useApiData(() => vendorsApi.list({ search, page, limit }), [search, page]);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  function handleSearch(event) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  function resetSearch() {
    setSearchInput('');
    setSearch('');
    setPage(1);
  }

  return (
    <>
      <PageHeader
        actions={canWrite && (
          <Button onClick={() => setDialog({ vendor: null })} type="button">
            <FiPlus aria-hidden="true" className="h-4 w-4" />
            Tambah vendor
          </Button>
        )}
        description="Daftar vendor pengadaan beserta kontak operasionalnya."
        eyebrow="Data master"
        title="Vendor"
      />

      <Card>
        <form className="flex flex-col gap-3 border-b border-outline-variant p-4 sm:flex-row sm:items-center" onSubmit={handleSearch} role="search">
          <div className="relative min-w-0 flex-1">
            <FiSearch aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
            <Input aria-label="Cari vendor berdasarkan nama" className="pl-10" onChange={(event) => setSearchInput(event.target.value)} placeholder="Cari nama vendor" value={searchInput} />
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="outline">Cari</Button>
            {search && <Button onClick={resetSearch} type="button" variant="ghost">Reset</Button>}
          </div>
        </form>

        {loading ? <LoadingState label="Memuat vendor…" /> : error ? (
          <ErrorState message={error.message} onRetry={reload} />
        ) : items.length === 0 ? (
          <EmptyState
            action={canWrite ? <Button onClick={() => setDialog({ vendor: null })} size="sm" type="button" variant="outline"><FiPlus aria-hidden="true" className="h-4 w-4" />Tambah vendor</Button> : null}
            description={search ? 'Tidak ada vendor yang cocok dengan pencarian.' : 'Vendor pertama akan muncul di sini setelah ditambahkan.'}
            title={search ? 'Pencarian tidak menemukan hasil' : 'Belum ada vendor'}
          />
        ) : (
          <>
            <TableScroll>
              <Table className="min-w-[36rem]">
                <thead>
                  <tr>
                    <Th>Nama vendor</Th>
                    <Th>Kontak</Th>
                    {canWrite && <Th className="text-right">Aksi</Th>}
                  </tr>
                </thead>
                <tbody>
                  {items.map((vendor) => (
                    <Tr key={vendor.id}>
                      <Td className="font-semibold">{vendor.name}</Td>
                      <Td className="whitespace-nowrap">{vendor.contact}</Td>
                      {canWrite && (
                        <Td className="text-right">
                          <Button aria-label={`Ubah ${vendor.name}`} onClick={() => setDialog({ vendor })} size="sm" type="button" variant="outline">
                            <FiEdit2 aria-hidden="true" className="h-3.5 w-3.5" />
                            Ubah
                          </Button>
                        </Td>
                      )}
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </TableScroll>
            <Pagination disabled={loading} limit={limit} onPageChange={setPage} page={page} total={total} />
          </>
        )}
      </Card>

      {dialog && (
        <VendorDialog
          onClose={() => setDialog(null)}
          onSaved={() => {
            setDialog(null);
            reload();
          }}
          vendor={dialog.vendor}
        />
      )}
    </>
  );
}
