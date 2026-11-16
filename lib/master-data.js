export const QUOTATION_STATUSES = ['DRAFT', 'SENT', 'CONVERTED', 'LOST'];

export const QUOTATION_STATUS_MAP = {
  DRAFT: { label: 'Draft', tone: 'draft' },
  SENT: { label: 'Terkirim', tone: 'progress' },
  CONVERTED: { label: 'Menjadi SO', tone: 'done' },
  LOST: { label: 'Tidak jadi', tone: 'problem' },
};

export const SALES_ORDER_STATUS_MAP = {
  PO_RECEIVED: { label: 'PO diterima', tone: 'progress' },
  PROCURING: { label: 'Pengadaan', tone: 'progress' },
  PARTIAL_RECEIVED: { label: 'Diterima sebagian', tone: 'waiting' },
  GOODS_RECEIVED: { label: 'Barang diterima', tone: 'progress' },
  SHIPPING_REQUESTED: { label: 'Permintaan kirim', tone: 'waiting' },
  PARTIAL_SHIPPED: { label: 'Dikirim sebagian', tone: 'waiting' },
  SHIPPED: { label: 'Dikirim', tone: 'progress' },
  DO_RETURNED: { label: 'DO dikembalikan', tone: 'progress' },
  INVOICING: { label: 'Penagihan', tone: 'waiting' },
  PAID: { label: 'Lunas', tone: 'done' },
  VENDOR_PAID: { label: 'Vendor dibayar', tone: 'done' },
  CLOSED: { label: 'Selesai', tone: 'done' },
};

export const SALES_ORDER_STATUSES = Object.keys(SALES_ORDER_STATUS_MAP);

export function quotationStatus(status) {
  return QUOTATION_STATUS_MAP[status] ?? { label: status || 'Tidak diketahui', tone: 'draft' };
}

export function salesOrderStatus(status) {
  return SALES_ORDER_STATUS_MAP[status] ?? { label: status || 'Tidak diketahui', tone: 'draft' };
}

export function canManageMasterData(role) {
  return role === 'ADMIN';
}

export function canWriteQuotation(role) {
  return role === 'SALES' || role === 'ADMIN';
}

const currencyFormatter = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 });

export function formatCurrency(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return 'Rp 0';
  return `Rp ${currencyFormatter.format(amount)}`;
}

const dateFormatter = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeZone: 'Asia/Jakarta' });
const dateTimeFormatter = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Jakarta' });

function toDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value) {
  const date = toDate(value);
  return date ? dateFormatter.format(date) : '—';
}

export function formatDateTime(value) {
  const date = toDate(value);
  return date ? dateTimeFormatter.format(date) : '—';
}

export function normalizeNpwp(value) {
  return String(value ?? '').replace(/\D/g, '');
}

export function isValidNpwp(value) {
  const digits = normalizeNpwp(value);
  return digits.length === 15 || digits.length === 16;
}

export function roundMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

export function computeQuotationTotals(items = []) {
  const lines = (Array.isArray(items) ? items : []).map((item) => {
    const qty = Number(item?.qty) || 0;
    const unitPrice = Number(item?.unitPrice) || 0;
    return { ...item, lineTotal: roundMoney(qty * unitPrice) };
  });

  return {
    lines,
    totalAmount: roundMoney(lines.reduce((sum, line) => sum + line.lineTotal, 0)),
  };
}

export function computeOrderLineTotal(item) {
  return roundMoney((Number(item?.qtyOrdered) || 0) * (Number(item?.unitPrice) || 0));
}

export function emptyQuotationItem() {
  return { sku: '', name: '', qty: '1', unitPrice: '' };
}

export function validateCustomer(input = {}) {
  const errors = {};
  const name = String(input.name ?? '').trim();
  const address = String(input.address ?? '').trim();
  const contact = String(input.contact ?? '').trim();
  const npwpName = String(input.npwpName ?? '').trim();
  const taxAddress = String(input.taxAddress ?? '').trim();

  if (name.length < 2 || name.length > 120) errors.name = 'Nama customer harus 2–120 karakter.';
  if (!address) errors.address = 'Alamat wajib diisi.';
  if (contact.length < 3 || contact.length > 80) errors.contact = 'Kontak harus 3–80 karakter.';
  if (!isValidNpwp(input.npwp)) errors.npwp = 'NPWP harus 15 atau 16 digit angka.';
  if (!npwpName) errors.npwpName = 'Nama NPWP wajib diisi.';
  if (!taxAddress) errors.taxAddress = 'Alamat pajak wajib diisi.';

  return errors;
}

export function validateVendor(input = {}) {
  const errors = {};
  const name = String(input.name ?? '').trim();
  const contact = String(input.contact ?? '').trim();

  if (name.length < 2 || name.length > 120) errors.name = 'Nama vendor harus 2–120 karakter.';
  if (contact.length < 3 || contact.length > 80) errors.contact = 'Kontak harus 3–80 karakter.';

  return errors;
}

function hasMoreThanTwoDecimals(value) {
  return Math.abs(value * 100 - Math.round(value * 100)) > 1e-6;
}

export function validateQuotation({ customerId, items } = {}) {
  const errors = {};

  if (!customerId) errors.customerId = 'Pilih customer.';
  if (!Array.isArray(items) || items.length === 0) errors.items = 'Tambahkan minimal satu item.';

  (Array.isArray(items) ? items : []).forEach((item, index) => {
    const key = `items.${index}`;
    const sku = String(item?.sku ?? '').trim();
    const name = String(item?.name ?? '').trim();
    const qty = Number(item?.qty);
    const unitPrice = Number(item?.unitPrice);

    if (sku.length < 2 || sku.length > 40) errors[`${key}.sku`] = 'SKU harus 2–40 karakter.';
    if (name.length < 2 || name.length > 120) errors[`${key}.name`] = 'Nama item harus 2–120 karakter.';
    if (!Number.isInteger(qty) || qty < 1) errors[`${key}.qty`] = 'Qty harus bilangan bulat minimal 1.';
    if (!Number.isFinite(unitPrice) || unitPrice < 0) errors[`${key}.unitPrice`] = 'Harga satuan tidak boleh negatif.';
    else if (hasMoreThanTwoDecimals(unitPrice)) errors[`${key}.unitPrice`] = 'Harga satuan maksimal 2 desimal.';
  });

  return errors;
}

export function validateCustomerPoNumber(value) {
  const poNumber = String(value ?? '').trim();
  if (poNumber.length > 60) return 'Nomor PO customer maksimal 60 karakter.';
  return '';
}

export function hasErrors(errors) {
  return Object.keys(errors ?? {}).length > 0;
}
