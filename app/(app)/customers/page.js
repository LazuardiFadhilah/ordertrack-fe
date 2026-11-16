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
import { Textarea } from '../../../components/ui/textarea.js';
import { customersApi } from '../../../lib/api-client.js';
import { canManageMasterData, hasErrors, normalizeNpwp, validateCustomer } from '../../../lib/master-data.js';
import { useApiData } from '../../../lib/use-api-data.js';

const limit = 20;
const emptyForm = { name: '', address: '', contact: '', npwp: '', npwpName: '', taxAddress: '' };

function CustomerDialog({ customer, onClose, onSaved }) {
  const [form, setForm] = useState(() => ({
    name: customer?.name ?? '',
    address: customer?.address ?? '',
    contact: customer?.contact ?? '',
    npwp: customer?.npwp ?? '',
    npwpName: customer?.npwpName ?? '',
    taxAddress: customer?.taxAddress ?? '',
  }));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateCustomer(form);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setSaving(true);
    const payload = {
      name: form.name.trim(),
      address: form.address.trim(),
      contact: form.contact.trim(),
      npwp: normalizeNpwp(form.npwp),
      npwpName: form.npwpName.trim(),
      taxAddress: form.taxAddress.trim(),
    };

    try {
      if (customer) await customersApi.update(customer.id, payload);
      else await customersApi.create(payload);
      toast.success(customer ? 'Customer diperbarui.' : 'Customer ditambahkan.');
      onSaved();
    } catch (error) {
      setErrors(error.fieldErrors?.() ?? {});
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog description="Lengkapi data legal customer. NPWP dan alamat pajak dipakai AR saat menerbitkan faktur pajak." onClose={onClose} open title={customer ? 'Ubah customer' : 'Tambah customer'}>
      <form className="space-y-4" noValidate onSubmit={handleSubmit}>
        <Field error={errors.name} htmlFor="customer-name" label="Nama customer">
          <Input aria-invalid={Boolean(errors.name)} disabled={saving} id="customer-name" maxLength={120} onChange={(event) => update('name', event.target.value)} value={form.name} />
        </Field>
        <Field error={errors.contact} htmlFor="customer-contact" label="Kontak">
          <Input aria-invalid={Boolean(errors.contact)} disabled={saving} id="customer-contact" maxLength={80} onChange={(event) => update('contact', event.target.value)} placeholder="Nama - nomor telepon" value={form.contact} />
        </Field>
        <Field error={errors.address} htmlFor="customer-address" label="Alamat">
          <Textarea aria-invalid={Boolean(errors.address)} disabled={saving} id="customer-address" onChange={(event) => update('address', event.target.value)} value={form.address} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field error={errors.npwp} hint="15 atau 16 digit angka." htmlFor="customer-npwp" label="NPWP">
            <Input aria-invalid={Boolean(errors.npwp)} disabled={saving} id="customer-npwp" inputMode="numeric" onChange={(event) => update('npwp', event.target.value)} value={form.npwp} />
          </Field>
          <Field error={errors.npwpName} htmlFor="customer-npwp-name" label="Nama NPWP">
            <Input aria-invalid={Boolean(errors.npwpName)} disabled={saving} id="customer-npwp-name" onChange={(event) => update('npwpName', event.target.value)} value={form.npwpName} />
          </Field>
        </div>
        <Field error={errors.taxAddress} htmlFor="customer-tax-address" label="Alamat pajak">
          <Textarea aria-invalid={Boolean(errors.taxAddress)} disabled={saving} id="customer-tax-address" onChange={(event) => update('taxAddress', event.target.value)} value={form.taxAddress} />
        </Field>
        <div className="flex flex-col-reverse gap-2 border-t border-outline-variant pt-4 sm:flex-row sm:justify-end">
          <Button disabled={saving} onClick={onClose} type="button" variant="ghost">Batal</Button>
          <Button disabled={saving} type="submit">{saving ? 'Menyimpan…' : 'Simpan customer'}</Button>
        </div>
      </form>
    </Dialog>
  );
}

export default function CustomersPage() {
  const user = useSession();
  const canWrite = canManageMasterData(user.role);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState(null);
  const { data, loading, error, reload } = useApiData(() => customersApi.list({ search, page, limit }), [search, page]);

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
          <Button onClick={() => setDialog({ customer: null })} type="button">
            <FiPlus aria-hidden="true" className="h-4 w-4" />
            Tambah customer
          </Button>
        )}
        description="Data customer beserta blok NPWP untuk penerbitan faktur pajak."
        eyebrow="Data master"
        title="Customer"
      />

      <Card>
        <form className="flex flex-col gap-3 border-b border-outline-variant p-4 sm:flex-row sm:items-center" onSubmit={handleSearch} role="search">
          <div className="relative min-w-0 flex-1">
            <FiSearch aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
            <Input aria-label="Cari customer berdasarkan nama atau NPWP" className="pl-10" onChange={(event) => setSearchInput(event.target.value)} placeholder="Cari nama atau NPWP" value={searchInput} />
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="outline">Cari</Button>
            {search && <Button onClick={resetSearch} type="button" variant="ghost">Reset</Button>}
          </div>
        </form>

        {loading ? <LoadingState label="Memuat customer…" /> : error ? (
          <ErrorState message={error.message} onRetry={reload} />
        ) : items.length === 0 ? (
          <EmptyState
            action={canWrite ? <Button onClick={() => setDialog({ customer: null })} size="sm" type="button" variant="outline"><FiPlus aria-hidden="true" className="h-4 w-4" />Tambah customer</Button> : null}
            description={search ? 'Tidak ada customer yang cocok dengan pencarian.' : 'Customer pertama akan muncul di sini setelah ditambahkan.'}
            title={search ? 'Pencarian tidak menemukan hasil' : 'Belum ada customer'}
          />
        ) : (
          <>
            <TableScroll>
              <Table>
                <thead>
                  <tr>
                    <Th>Nama</Th>
                    <Th>Kontak</Th>
                    <Th>NPWP</Th>
                    <Th>Alamat</Th>
                    {canWrite && <Th className="text-right">Aksi</Th>}
                  </tr>
                </thead>
                <tbody>
                  {items.map((customer) => (
                    <Tr key={customer.id}>
                      <Td className="min-w-[14rem]">
                        <p className="font-semibold text-on-surface">{customer.name}</p>
                        <p className="mt-0.5 text-xs text-on-surface-variant">{customer.npwpName}</p>
                      </Td>
                      <Td className="whitespace-nowrap">{customer.contact}</Td>
                      <Td className="whitespace-nowrap font-mono text-xs tabular">{customer.npwp}</Td>
                      <Td className="max-w-[18rem] text-on-surface-variant">{customer.address}</Td>
                      {canWrite && (
                        <Td className="text-right">
                          <Button aria-label={`Ubah ${customer.name}`} onClick={() => setDialog({ customer })} size="sm" type="button" variant="outline">
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
        <CustomerDialog
          customer={dialog.customer}
          onClose={() => setDialog(null)}
          onSaved={() => {
            setDialog(null);
            reload();
          }}
        />
      )}
    </>
  );
}
