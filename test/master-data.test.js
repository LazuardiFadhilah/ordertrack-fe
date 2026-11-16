import assert from 'node:assert/strict';
import test from 'node:test';
import {
  QUOTATION_STATUSES,
  SALES_ORDER_STATUSES,
  canManageMasterData,
  canWriteQuotation,
  computeOrderLineTotal,
  computeQuotationTotals,
  emptyQuotationItem,
  formatCurrency,
  formatDate,
  formatDateTime,
  hasErrors,
  isValidNpwp,
  normalizeNpwp,
  quotationStatus,
  salesOrderStatus,
  validateCustomer,
  validateCustomerPoNumber,
  validateQuotation,
  validateVendor,
} from '../lib/master-data.js';

const validCustomer = {
  name: 'PT Dummy Nusantara',
  address: 'Jl. Contoh Raya No. 1, Jakarta',
  contact: 'Rani - 081200000001',
  npwp: '01.234.567.8-901.234',
  npwpName: 'PT Dummy Nusantara',
  taxAddress: 'Jl. Contoh Raya No. 1, Jakarta',
};

test('formatCurrency renders rupiah with dot thousands and max two decimals', () => {
  assert.equal(formatCurrency(1500000), 'Rp 1.500.000');
  assert.equal(formatCurrency('1500000'), 'Rp 1.500.000');
  assert.equal(formatCurrency(0), 'Rp 0');
  assert.equal(formatCurrency(1234.5), 'Rp 1.234,5');
  assert.equal(formatCurrency(null), 'Rp 0');
  assert.equal(formatCurrency('not-a-number'), 'Rp 0');
});

test('date formatters use Indonesian medium style in Jakarta time', () => {
  assert.equal(formatDate('2026-11-16T02:00:00.000Z'), '16 Nov 2026');
  assert.equal(formatDateTime('2026-11-16T02:00:00.000Z'), '16 Nov 2026, 09.00');
  assert.equal(formatDate(null), '—');
  assert.equal(formatDate('invalid'), '—');
});

test('NPWP normalization keeps digits only and validates 15 or 16 digits', () => {
  assert.equal(normalizeNpwp('01.234.567.8-901.234'), '012345678901234');
  assert.equal(normalizeNpwp('  0123 4567 8901 2345 '), '0123456789012345');
  assert.equal(normalizeNpwp(null), '');
  assert.equal(isValidNpwp('01.234.567.8-901.234'), true);
  assert.equal(isValidNpwp('0123456789012345'), true);
  assert.equal(isValidNpwp('01234567890123'), false);
  assert.equal(isValidNpwp('01234567890123456'), false);
  assert.equal(isValidNpwp(''), false);
});

test('computeQuotationTotals derives line totals and grand total', () => {
  const { lines, totalAmount } = computeQuotationTotals([
    { sku: 'DUM-001', name: 'Barang A', qty: 10, unitPrice: 150000 },
    { sku: 'DUM-002', name: 'Barang B', qty: '2', unitPrice: '75000.5' },
  ]);

  assert.equal(lines[0].lineTotal, 1500000);
  assert.equal(lines[1].lineTotal, 150001);
  assert.equal(totalAmount, 1650001);
});

test('computeQuotationTotals tolerates empty and malformed rows', () => {
  assert.deepEqual(computeQuotationTotals([]), { lines: [], totalAmount: 0 });
  const { lines, totalAmount } = computeQuotationTotals([{ qty: '', unitPrice: null }]);
  assert.equal(lines[0].lineTotal, 0);
  assert.equal(totalAmount, 0);
  assert.equal(computeOrderLineTotal({ qtyOrdered: 3, unitPrice: 2500.25 }), 7500.75);
});

test('validateCustomer accepts the contracted shape and normalizes nothing on read', () => {
  assert.deepEqual(validateCustomer(validCustomer), {});
  assert.deepEqual(validateCustomer({ ...validCustomer, name: 'A' }).name, 'Nama customer harus 2–120 karakter.');
  assert.deepEqual(validateCustomer({ ...validCustomer, contact: '' }).contact, 'Kontak harus 3–80 karakter.');
  assert.deepEqual(validateCustomer({ ...validCustomer, address: '  ' }).address, 'Alamat wajib diisi.');
  assert.deepEqual(validateCustomer({ ...validCustomer, npwp: '123' }).npwp, 'NPWP harus 15 atau 16 digit angka.');
  assert.deepEqual(validateCustomer({ ...validCustomer, npwpName: '' }).npwpName, 'Nama NPWP wajib diisi.');
  assert.deepEqual(validateCustomer({ ...validCustomer, taxAddress: '' }).taxAddress, 'Alamat pajak wajib diisi.');
});

test('validateVendor applies the 2–120 name and 3–80 contact rules', () => {
  assert.deepEqual(validateVendor({ name: 'CV Dummy Supply', contact: 'Sari - 081200000002' }), {});
  assert.equal(validateVendor({ name: 'x', contact: 'ok' }).name, 'Nama vendor harus 2–120 karakter.');
  assert.equal(validateVendor({ name: 'CV Dummy', contact: 'ab' }).contact, 'Kontak harus 3–80 karakter.');
});

test('validateQuotation reports field paths for customer and item rows', () => {
  assert.deepEqual(validateQuotation({ customerId: 'c1', items: [{ sku: 'DUM-001', name: 'Barang A', qty: 1, unitPrice: 1000 }] }), {});

  const errors = validateQuotation({
    customerId: '',
    items: [{ sku: 'D', name: 'B', qty: 0, unitPrice: -1 }, { sku: 'DUM-002', name: 'Barang B', qty: 1.5, unitPrice: 10.999 }],
  });

  assert.equal(errors.customerId, 'Pilih customer.');
  assert.equal(errors['items.0.sku'], 'SKU harus 2–40 karakter.');
  assert.equal(errors['items.0.name'], 'Nama item harus 2–120 karakter.');
  assert.equal(errors['items.0.qty'], 'Qty harus bilangan bulat minimal 1.');
  assert.equal(errors['items.0.unitPrice'], 'Harga satuan tidak boleh negatif.');
  assert.equal(errors['items.1.qty'], 'Qty harus bilangan bulat minimal 1.');
  assert.equal(errors['items.1.unitPrice'], 'Harga satuan maksimal 2 desimal.');
  assert.deepEqual(validateQuotation({}), { customerId: 'Pilih customer.', items: 'Tambahkan minimal satu item.' });
  assert.equal(hasErrors(errors), true);
  assert.equal(hasErrors({}), false);
});

test('validateCustomerPoNumber caps the optional PO number at 60 characters', () => {
  assert.equal(validateCustomerPoNumber(''), '');
  assert.equal(validateCustomerPoNumber('a'.repeat(60)), '');
  assert.equal(validateCustomerPoNumber('a'.repeat(61)), 'Nomor PO customer maksimal 60 karakter.');
});

test('status maps cover every contracted value with labels and tones', () => {
  assert.deepEqual(QUOTATION_STATUSES, ['DRAFT', 'SENT', 'CONVERTED', 'LOST']);
  assert.deepEqual(quotationStatus('DRAFT'), { label: 'Draft', tone: 'draft' });
  assert.deepEqual(quotationStatus('SENT'), { label: 'Terkirim', tone: 'progress' });
  assert.deepEqual(quotationStatus('CONVERTED'), { label: 'Menjadi SO', tone: 'done' });
  assert.deepEqual(quotationStatus('LOST'), { label: 'Tidak jadi', tone: 'problem' });
  assert.deepEqual(quotationStatus('UNKNOWN'), { label: 'UNKNOWN', tone: 'draft' });
  assert.deepEqual(salesOrderStatus('PO_RECEIVED'), { label: 'PO diterima', tone: 'progress' });
  assert.deepEqual(salesOrderStatus('CLOSED'), { label: 'Selesai', tone: 'done' });
  assert.ok(SALES_ORDER_STATUSES.includes('PO_RECEIVED'));
});

test('role gates match the phase 3 contract table', () => {
  assert.equal(canManageMasterData('ADMIN'), true);
  assert.equal(canManageMasterData('SALES'), false);
  assert.equal(canWriteQuotation('SALES'), true);
  assert.equal(canWriteQuotation('ADMIN'), true);
  assert.equal(canWriteQuotation('AR'), false);
  assert.equal(canWriteQuotation('PURCHASING'), false);
});

test('emptyQuotationItem starts a valid single row draft', () => {
  assert.deepEqual(emptyQuotationItem(), { sku: '', name: '', qty: '1', unitPrice: '' });
});
