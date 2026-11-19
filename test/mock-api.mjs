// Local fixture API for phase 3 visual evidence. Dummy data only, no secrets.
// Run: npm run mock:api, then `API_SERVER_URL=http://127.0.0.1:4010 npm run dev`.
import http from 'node:http';

const port = Number(process.env.MOCK_PORT) || 4010;

const users = {
  ADMIN: { id: 'u-admin', name: 'Dummy ADMIN User', email: 'admin@example.test', role: 'ADMIN' },
  SALES: { id: 'u-sales', name: 'Dummy SALES User', email: 'sales@example.test', role: 'SALES' },
  AR: { id: 'u-ar', name: 'Dummy AR User', email: 'ar@example.test', role: 'AR' },
};

const now = '2026-11-16T02:00:00.000Z';
const customers = [
  { id: 'c1', name: 'PT Dummy Nusantara', address: 'Jl. Contoh Raya No. 1, Jakarta', contact: 'Rani - 081200000001', npwp: '0123456789012345', npwpName: 'PT Dummy Nusantara', taxAddress: 'Jl. Contoh Raya No. 1, Jakarta', createdAt: now, updatedAt: now },
  { id: 'c2', name: 'PT Sinar Abadi', address: 'Jl. Merdeka No. 22, Bandung', contact: 'Budi - 081200000002', npwp: '012345678901234', npwpName: 'PT Sinar Abadi', taxAddress: 'Jl. Merdeka No. 22, Bandung', createdAt: now, updatedAt: now },
  { id: 'c3', name: 'CV Karya Bersama', address: 'Jl. Diponegoro No. 5, Surabaya', contact: 'Sinta - 081200000003', npwp: '9876543210987654', npwpName: 'CV Karya Bersama', taxAddress: 'Jl. Diponegoro No. 5, Surabaya', createdAt: now, updatedAt: now },
];
const vendors = [
  { id: 'v1', name: 'CV Dummy Supply', contact: 'Sari - 081200000004', createdAt: now, updatedAt: now },
  { id: 'v2', name: 'PT Logam Jaya', contact: 'Andi - 081200000005', createdAt: now, updatedAt: now },
];

const quotations = [
  {
    id: 'q1', number: 'QTN-2026-11-0001', customerId: 'c1', customerName: 'PT Dummy Nusantara',
    items: [
      { sku: 'DUM-001', name: 'Barang Dummy A', qty: 10, unitPrice: 150000, lineTotal: 1500000 },
      { sku: 'DUM-002', name: 'Barang Dummy B', qty: 12, unitPrice: 150000, lineTotal: 1800000 },
    ],
    totalAmount: 3300000, status: 'SENT', createdBy: { id: 'u-sales', name: 'Dummy SALES User' },
    salesOrderId: null, createdAt: now, updatedAt: now,
  },
  {
    id: 'q2', number: 'QTN-2026-11-0002', customerId: 'c2', customerName: 'PT Sinar Abadi',
    items: [{ sku: 'DUM-003', name: 'Barang Dummy C', qty: 4, unitPrice: 275000, lineTotal: 1100000 }],
    totalAmount: 1100000, status: 'DRAFT', createdBy: { id: 'u-sales', name: 'Dummy SALES User' },
    salesOrderId: null, createdAt: now, updatedAt: now,
  },
  {
    id: 'q3', number: 'QTN-2026-11-0003', customerId: 'c1', customerName: 'PT Dummy Nusantara',
    items: [{ sku: 'DUM-001', name: 'Barang Dummy A', qty: 10, unitPrice: 150000, lineTotal: 1500000 }],
    totalAmount: 1500000, status: 'CONVERTED', createdBy: { id: 'u-sales', name: 'Dummy SALES User' },
    salesOrderId: 'so1', createdAt: now, updatedAt: now,
  },
  {
    id: 'q4', number: 'QTN-2026-11-0004', customerId: 'c3', customerName: 'CV Karya Bersama',
    items: [{ sku: 'DUM-004', name: 'Barang Dummy D', qty: 2, unitPrice: 500000, lineTotal: 1000000 }],
    totalAmount: 1000000, status: 'LOST', createdBy: { id: 'u-sales', name: 'Dummy SALES User' },
    salesOrderId: null, createdAt: now, updatedAt: now,
  },
];

const salesOrders = [
  {
    id: 'so1', soNumber: 'SO-2026-11-0001', customerPoNumber: 'PO/DUMMY/001', customerId: 'c1', customerName: 'PT Dummy Nusantara',
    quotationId: 'q3', quotationNumber: 'QTN-2026-11-0003', salesId: 'u-sales', salesName: 'Dummy SALES User',
    items: [{ sku: 'DUM-001', name: 'Barang Dummy A', qtyOrdered: 10, qtyReceived: 4, qtyShipped: 0, qtyInvoiced: 0, unitPrice: 150000 }],
    totalAmount: 1500000, status: 'PO_RECEIVED', createdAt: now,
  },
  {
    id: 'so2', soNumber: 'SO-2026-11-0002', customerPoNumber: 'PO/DUMMY/002', customerId: 'c2', customerName: 'PT Sinar Abadi',
    quotationId: 'q3', quotationNumber: 'QTN-2026-11-0003', salesId: 'u-sales', salesName: 'Dummy SALES User',
    items: [
      { sku: 'DUM-003', name: 'Barang Dummy C', qtyOrdered: 8, qtyReceived: 8, qtyShipped: 5, qtyInvoiced: 2, unitPrice: 275000 },
      { sku: 'DUM-005', name: 'Barang Dummy E', qtyOrdered: 3, qtyReceived: 3, qtyShipped: 3, qtyInvoiced: 3, unitPrice: 125000 },
    ],
    totalAmount: 1750000, status: 'SHIPPED', createdAt: now,
  },
];

let sequence = 4;
let invoiceSequence = 0;
const invoices = [];
const payments = [];

function json(response, status, payload) {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(payload));
}

const ok = (response, data, status = 200) => json(response, status, { success: true, data });
const fail = (response, status, message, errors = []) => json(response, status, { success: false, message, errors });

function currentUser(request) {
  const role = /mock_role=(SALES|AR|ADMIN)/.exec(request.headers.cookie ?? '')?.[1] ?? 'ADMIN';
  return users[role];
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let raw = '';
    request.on('data', (chunk) => { raw += chunk; });
    request.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });
    request.on('error', reject);
  });
}

function paginate(response, items, url) {
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit')) || 20));
  return ok(response, { items: items.slice((page - 1) * limit, page * limit), total: items.length, page, limit });
}

function npwpError(body) {
  const digits = String(body.npwp ?? '').replace(/\D/g, '');
  if (digits.length !== 15 && digits.length !== 16) {
    return [{ field: 'npwp', message: 'NPWP must be 15 or 16 digits' }];
  }
  return [];
}

function matchesSearch(value, search) {
  return !search || String(value).toLowerCase().includes(search.toLowerCase());
}

function customerPayload(body) {
  return {
    name: String(body.name ?? '').trim(),
    address: String(body.address ?? '').trim(),
    contact: String(body.contact ?? '').trim(),
    npwp: String(body.npwp ?? '').replace(/\D/g, ''),
    npwpName: String(body.npwpName ?? '').trim(),
    taxAddress: String(body.taxAddress ?? '').trim(),
  };
}

function quotationTotals(items) {
  const lines = items.map((item) => ({
    sku: String(item.sku ?? '').trim(),
    name: String(item.name ?? '').trim(),
    qty: Number(item.qty),
    unitPrice: Number(item.unitPrice),
    lineTotal: Math.round(Number(item.qty) * Number(item.unitPrice) * 100) / 100,
  }));
  return { lines, totalAmount: Math.round(lines.reduce((sum, line) => sum + line.lineTotal, 0) * 100) / 100 };
}

async function handle(request, response) {
  const url = new URL(request.url, `http://127.0.0.1:${port}`);
  const path = url.pathname;
  const method = request.method ?? 'GET';
  const user = currentUser(request);

  if (path === '/api/health') return ok(response, { service: 'mock-server', status: 'ok' });

  if (path === '/api/auth/login' && method === 'POST') {
    const body = await readJson(request);
    const role = String(body.email ?? '').toLowerCase().includes('sales') ? 'SALES' : String(body.email ?? '').toLowerCase().includes('ar@') ? 'AR' : 'ADMIN';
    response.setHeader('set-cookie', `mock_role=${role}; Path=/; HttpOnly; SameSite=Lax`);
    return ok(response, { user: users[role] });
  }

  if (path === '/api/auth/logout') {
    response.setHeader('set-cookie', 'mock_role=; Path=/; Max-Age=0');
    return ok(response, null);
  }

  if (path === '/api/auth/me') return ok(response, { user });

  if (path === '/api/customers' && method === 'GET') {
    const search = url.searchParams.get('search');
    return paginate(response, customers.filter((item) => matchesSearch(item.name, search) || matchesSearch(item.npwp, search)), url);
  }

  if (path === '/api/customers' && method === 'POST') {
    const body = await readJson(request);
    const errors = npwpError(body);
    if (errors.length) return fail(response, 400, 'Validation failed', errors);
    const customer = { id: `c${customers.length + 1}-${Date.now()}`, ...customerPayload(body), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    customers.unshift(customer);
    return ok(response, { customer }, 201);
  }

  const customerMatch = /^\/api\/customers\/([^/]+)$/.exec(path);
  if (customerMatch && method === 'GET') {
    const customer = customers.find((item) => item.id === customerMatch[1]);
    return customer ? ok(response, { customer }) : fail(response, 404, 'Customer not found');
  }
  if (customerMatch && method === 'PATCH') {
    const customer = customers.find((item) => item.id === customerMatch[1]);
    if (!customer) return fail(response, 404, 'Customer not found');
    const body = await readJson(request);
    if (body.npwp !== undefined) {
      const errors = npwpError(body);
      if (errors.length) return fail(response, 400, 'Validation failed', errors);
    }
    Object.assign(customer, customerPayload({ ...customer, ...body }), { updatedAt: new Date().toISOString() });
    return ok(response, { customer });
  }

  if (path === '/api/vendors' && method === 'GET') {
    return paginate(response, vendors.filter((item) => matchesSearch(item.name, url.searchParams.get('search'))), url);
  }
  if (path === '/api/vendors' && method === 'POST') {
    const body = await readJson(request);
    const vendor = { id: `v${vendors.length + 1}-${Date.now()}`, name: String(body.name ?? '').trim(), contact: String(body.contact ?? '').trim(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    vendors.unshift(vendor);
    return ok(response, { vendor }, 201);
  }
  const vendorMatch = /^\/api\/vendors\/([^/]+)$/.exec(path);
  if (vendorMatch && method === 'GET') {
    const vendor = vendors.find((item) => item.id === vendorMatch[1]);
    return vendor ? ok(response, { vendor }) : fail(response, 404, 'Vendor not found');
  }
  if (vendorMatch && method === 'PATCH') {
    const vendor = vendors.find((item) => item.id === vendorMatch[1]);
    if (!vendor) return fail(response, 404, 'Vendor not found');
    const body = await readJson(request);
    Object.assign(vendor, { name: String(body.name ?? vendor.name).trim(), contact: String(body.contact ?? vendor.contact).trim(), updatedAt: new Date().toISOString() });
    return ok(response, { vendor });
  }

  if (path === '/api/quotations' && method === 'GET') {
    const status = url.searchParams.get('status');
    const customerId = url.searchParams.get('customerId');
    const visible = user.role === 'SALES' ? quotations.filter((item) => item.createdBy.id === user.id) : quotations;
    return paginate(response, visible.filter((item) => (!status || item.status === status) && (!customerId || item.customerId === customerId)), url);
  }

  if (path === '/api/quotations' && method === 'POST') {
    const body = await readJson(request);
    const customer = customers.find((item) => item.id === body.customerId);
    if (!customer) return fail(response, 400, 'Validation failed', [{ field: 'customerId', message: 'Customer not found' }]);
    if (!Array.isArray(body.items) || body.items.length === 0) return fail(response, 400, 'Validation failed', [{ field: 'items', message: 'At least one item is required' }]);
    const { lines, totalAmount } = quotationTotals(body.items);
    sequence += 1;
    const quotation = {
      id: `q-new-${Date.now()}`, number: `QTN-2026-11-${String(sequence).padStart(4, '0')}`, customerId: customer.id, customerName: customer.name,
      items: lines, totalAmount, status: 'DRAFT', createdBy: { id: user.id, name: user.name }, salesOrderId: null,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    quotations.unshift(quotation);
    return ok(response, { quotation }, 201);
  }

  const quotationMatch = /^\/api\/quotations\/([^/]+)(\/[a-z]+)?$/.exec(path);
  if (quotationMatch) {
    const quotation = quotations.find((item) => item.id === quotationMatch[1]);
    const action = quotationMatch[2];
    if (!quotation) return fail(response, 404, 'Quotation not found');
    if (user.role === 'SALES' && quotation.createdBy.id !== user.id) return fail(response, 403, 'Forbidden');

    if (!action && method === 'GET') return ok(response, { quotation });

    if (!action && method === 'PATCH') {
      if (quotation.status !== 'DRAFT') return fail(response, 409, 'Only DRAFT quotations can be edited');
      const body = await readJson(request);
      const customer = customers.find((item) => item.id === body.customerId) ?? customers.find((item) => item.id === quotation.customerId);
      const { lines, totalAmount } = quotationTotals(body.items ?? quotation.items);
      Object.assign(quotation, { customerId: customer.id, customerName: customer.name, items: lines, totalAmount, updatedAt: new Date().toISOString() });
      return ok(response, { quotation });
    }

    if (action === '/send' && method === 'POST') {
      if (quotation.status !== 'DRAFT') return fail(response, 409, 'Only DRAFT quotations can be sent');
      quotation.status = 'SENT';
      quotation.updatedAt = new Date().toISOString();
      return ok(response, { quotation });
    }

    if (action === '/lose' && method === 'POST') {
      if (!['DRAFT', 'SENT'].includes(quotation.status)) return fail(response, 409, 'Quotation cannot be lost in its current status');
      quotation.status = 'LOST';
      quotation.updatedAt = new Date().toISOString();
      return ok(response, { quotation });
    }

    if (action === '/convert' && method === 'POST') {
      if (quotation.status !== 'SENT') return fail(response, 409, 'Only SENT quotations can be converted');
      const body = await readJson(request);
      const salesOrder = {
        id: `so-new-${Date.now()}`, soNumber: `SO-2026-11-${String(salesOrders.length + 1).padStart(4, '0')}`,
        customerPoNumber: String(body.customerPoNumber ?? '').slice(0, 60), customerId: quotation.customerId, customerName: quotation.customerName,
        quotationId: quotation.id, quotationNumber: quotation.number, salesId: quotation.createdBy.id, salesName: quotation.createdBy.name,
        items: quotation.items.map((item) => ({ sku: item.sku, name: item.name, qtyOrdered: item.qty, qtyReceived: 0, qtyShipped: 0, qtyInvoiced: 0, unitPrice: item.unitPrice })),
        totalAmount: quotation.totalAmount, status: 'PO_RECEIVED', createdAt: new Date().toISOString(),
      };
      salesOrders.unshift(salesOrder);
      quotation.status = 'CONVERTED';
      quotation.salesOrderId = salesOrder.id;
      quotation.updatedAt = new Date().toISOString();
      return ok(response, {
        quotation: { id: quotation.id, number: quotation.number, status: quotation.status, salesOrderId: quotation.salesOrderId },
        salesOrder: { id: salesOrder.id, soNumber: salesOrder.soNumber, status: salesOrder.status },
      }, 201);
    }
  }

  if (path === '/api/invoices' && method === 'GET') {
    if (!['ADMIN', 'AR', 'SALES'].includes(user.role)) return fail(response, 403, 'Forbidden');
    const status = url.searchParams.get('status');
    const rows = invoices.filter((item) => !status || item.status === status);
    return ok(response, { invoices: rows, total: rows.length, page: 1, limit: 100 });
  }
  if (path === '/api/invoices' && method === 'POST') {
    if (!['ADMIN', 'AR'].includes(user.role)) return fail(response, 403, 'Forbidden');
    const body = await readJson(request);
    const so = salesOrders.find((item) => item.id === body.soId);
    if (!so) return fail(response, 404, 'Sales Order not found');
    if (!['SHIPPED', 'DO_RETURNED', 'COMPLETED'].includes(so.status)) return fail(response, 409, 'Sales Order cannot be invoiced');
    if (invoices.some((item) => item.soId === so.id && item.status !== 'VOID')) return fail(response, 409, 'Active invoice already exists');
    invoiceSequence += 1;
    const invoice = { _id: `inv-${invoiceSequence}`, invoiceNumber: `INV-2026-11-${String(invoiceSequence).padStart(4, '0')}`, soId: so.id, soNumber: so.soNumber, customerId: so.customerId, customerName: so.customerName, items: so.items.map((item, index) => ({ soItemIndex: index, sku: item.sku, name: item.name, qty: item.qtyShipped || item.qtyOrdered, unitPrice: item.unitPrice, totalPrice: (item.qtyShipped || item.qtyOrdered) * item.unitPrice })), totalAmount: so.totalAmount, paidAmount: 0, status: 'ISSUED', dueDate: body.dueDate, issuedBy: user.id, createdAt: new Date().toISOString() };
    invoices.unshift(invoice); so.status = 'INVOICING';
    return ok(response, { invoice }, 201);
  }
  const invoiceMatch = path.startsWith('/api/invoices/') ? path.slice('/api/invoices/'.length) : null;
  if (invoiceMatch && method === 'GET' && invoiceMatch !== 'payments') {
    if (!['ADMIN', 'AR', 'SALES'].includes(user.role)) return fail(response, 403, 'Forbidden');
    const invoice = invoices.find((item) => item._id === invoiceMatch);
    return invoice ? ok(response, { invoice, payments: payments.filter((item) => item.invoiceId === invoice._id), outstandingAmount: invoice.totalAmount - invoice.paidAmount }) : fail(response, 404, 'Invoice not found');
  }
  if (path === '/api/invoices/payments' && method === 'POST') {
    if (!['ADMIN', 'AR'].includes(user.role)) return fail(response, 403, 'Forbidden');
    const body = await readJson(request);
    const invoice = invoices.find((item) => item._id === body.invoiceId);
    if (!invoice) return fail(response, 404, 'Invoice not found');
    const amount = Number(body.amount);
    const outstanding = invoice.totalAmount - invoice.paidAmount;
    if (!Number.isFinite(amount) || amount <= 0 || amount > outstanding) return fail(response, 409, 'Payment exceeds outstanding balance');
    invoice.paidAmount += amount;
    invoice.status = invoice.paidAmount >= invoice.totalAmount ? 'PAID' : 'PARTIALLY_PAID';
    if (invoice.status === 'PAID') { const so = salesOrders.find((item) => item.id === invoice.soId); if (so) so.status = 'PAID'; }
    const payment = { _id: `pay-${payments.length + 1}`, paymentNumber: `PAY-2026-11-${String(payments.length + 1).padStart(4, '0')}`, invoiceId: invoice._id, soId: invoice.soId, amount, paymentMethod: body.paymentMethod, paidAt: body.paidAt || new Date().toISOString(), receivedBy: user.id };
    payments.unshift(payment);
    return ok(response, { payment, invoice, outstandingAmount: invoice.totalAmount - invoice.paidAmount }, 201);
  }

  if (path === '/api/sales-orders' && method === 'GET') {
    const status = url.searchParams.get('status');
    const customerId = url.searchParams.get('customerId');
    const visible = user.role === 'SALES' ? salesOrders.filter((item) => item.salesId === user.id) : salesOrders;
    return paginate(response, visible.filter((item) => (!status || item.status === status) && (!customerId || item.customerId === customerId)), url);
  }

  const salesOrderMatch = /^\/api\/sales-orders\/([^/]+)$/.exec(path);
  if (salesOrderMatch && method === 'GET') {
    const salesOrder = salesOrders.find((item) => item.id === salesOrderMatch[1]);
    if (!salesOrder) return fail(response, 404, 'Sales order not found');
    if (user.role === 'SALES' && salesOrder.salesId !== user.id) return fail(response, 403, 'Forbidden');
    return ok(response, { salesOrder });
  }

  return fail(response, 404, 'Mock route not found');
}

const server = http.createServer((request, response) => {
  handle(request, response).catch((error) => {
    console.error(error);
    fail(response, 500, 'Mock server error');
  });
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Mock phase 3 API listening on http://127.0.0.1:${port}`);
});
