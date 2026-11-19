import assert from 'node:assert/strict';
import test from 'node:test';
import { ApiError, customersApi, documentsApi, documentUpload, invoiceApi, paymentApi, quotationsApi, request, salesOrdersApi, vendorsApi, vendorPaymentsApi } from '../lib/api-client.js';

const originalFetch = globalThis.fetch;

test.afterEach(() => {
  globalThis.fetch = originalFetch;
});

function respond(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

test('GET requests send cookie credentials and skip empty query values', async () => {
  let captured;
  globalThis.fetch = async (url, options) => {
    captured = { url, options };
    return respond({ success: true, data: { items: [], total: 0, page: 1, limit: 20 } });
  };

  const result = await request('/api/customers', { query: { search: 'dummy', page: 1, status: '', customerId: null } });

  assert.equal(captured.url, '/api/customers?search=dummy&page=1');
  assert.equal(captured.options.method, 'GET');
  assert.equal(captured.options.credentials, 'include');
  assert.equal(captured.options.body, undefined);
  assert.equal(captured.options.headers['Content-Type'], undefined);
  assert.deepEqual(result, { items: [], total: 0, page: 1, limit: 20 });
});

test('POST requests serialize the JSON body and return data', async () => {
  let captured;
  globalThis.fetch = async (url, options) => {
    captured = { url, options };
    return respond({ success: true, data: { customer: { id: 'c1' } } }, 201);
  };

  const result = await customersApi.create({ name: 'PT Dummy' });

  assert.equal(captured.url, '/api/customers');
  assert.equal(captured.options.method, 'POST');
  assert.equal(captured.options.headers['Content-Type'], 'application/json');
  assert.deepEqual(JSON.parse(captured.options.body), { name: 'PT Dummy' });
  assert.deepEqual(result, { customer: { id: 'c1' } });
});

test('error envelopes become ApiError with status, message, and field errors', async () => {
  globalThis.fetch = async () => respond({
    success: false,
    message: 'Validation failed',
    errors: [{ field: 'npwp', message: 'NPWP must be 15 or 16 digits' }],
  }, 400);

  await assert.rejects(
    customersApi.create({ name: 'PT Dummy' }),
    (error) => {
      assert.ok(error instanceof ApiError);
      assert.equal(error.status, 400);
      assert.equal(error.message, 'Validation failed');
      assert.deepEqual(error.fieldErrors(), { npwp: 'NPWP must be 15 or 16 digits' });
      return true;
    },
  );
});

test('conflicts keep the server message for toast display', async () => {
  globalThis.fetch = async () => respond({ success: false, message: 'Quotation is not in SENT status', errors: [] }, 409);

  await assert.rejects(quotationsApi.convert('q1', {}), (error) => {
    assert.equal(error.status, 409);
    assert.equal(error.message, 'Quotation is not in SENT status');
    return true;
  });
});

test('network failures surface an ApiError with status 0', async () => {
  globalThis.fetch = async () => {
    throw new TypeError('fetch failed');
  };

  await assert.rejects(salesOrdersApi.list(), (error) => {
    assert.ok(error instanceof ApiError);
    assert.equal(error.status, 0);
    assert.match(error.message, /Tidak dapat menghubungi server/);
    return true;
  });
});

test('invoice and payment helpers use backend invoice routes and request bodies', async () => {
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, method: options.method, body: options.body ? JSON.parse(options.body) : undefined });
    return respond({ success: true, data: {} });
  };
  await invoiceApi.list({ status: 'ISSUED' });
  await invoiceApi.get('inv 1');
  await invoiceApi.create({ soId: 'so1', dueDate: '2027-01-01' });
  await paymentApi.create({ invoiceId: 'inv1', amount: 25 });
  assert.deepEqual(calls, [
    { url: '/api/invoices?status=ISSUED', method: 'GET', body: undefined },
    { url: '/api/invoices/inv%201', method: 'GET', body: undefined },
    { url: '/api/invoices', method: 'POST', body: { soId: 'so1', dueDate: '2027-01-01' } },
    { url: '/api/invoices/payments', method: 'POST', body: { invoiceId: 'inv1', amount: 25 } },
  ]);
});

test('resource helpers call the contracted phase 3 paths', async () => {
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, method: options.method, body: options.body ? JSON.parse(options.body) : undefined });
    return respond({ success: true, data: {} });
  };

  await customersApi.update('c 1', { name: 'PT Dummy' });
  await vendorsApi.list({ search: 'supply' });
  await vendorsApi.get('v1');
  await quotationsApi.send('q1');
  await quotationsApi.lose('q1');
  await quotationsApi.convert('q1', { customerPoNumber: 'PO/1' });
  await salesOrdersApi.get('so1');

  assert.deepEqual(calls, [
    { url: '/api/customers/c%201', method: 'PATCH', body: { name: 'PT Dummy' } },
    { url: '/api/vendors?search=supply', method: 'GET', body: undefined },
    { url: '/api/vendors/v1', method: 'GET', body: undefined },
    { url: '/api/quotations/q1/send', method: 'POST', body: undefined },
    { url: '/api/quotations/q1/lose', method: 'POST', body: undefined },
    { url: '/api/quotations/q1/convert', method: 'POST', body: { customerPoNumber: 'PO/1' } },
    { url: '/api/sales-orders/so1', method: 'GET', body: undefined },
  ]);
});

test('document helpers use the explicit metadata, upload-token, and signed upload contract', async () => {
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, method: options.method, body: options.body instanceof Blob ? options.body.size : options.body ? JSON.parse(options.body) : undefined });
    if (url === '/api/documents/upload-token') return respond({ success: true, data: { uploadUrl: 'https://storage.test/upload', fileUrl: 'https://storage.test/file' } });
    if (url === 'https://storage.test/upload') return new Response(null, { status: 200 });
    return respond({ success: true, data: { items: [] } });
  };
  await documentsApi.list({ soId: 'so1' });
  await documentsApi.uploadToken({ soId: 'so1', fileName: 'po.pdf', mimeType: 'application/pdf', size: 4 });
  await documentsApi.create({ soId: 'so1', refType: 'PO_CUSTOMER', fileName: 'po.pdf', mimeType: 'application/pdf', size: 4, fileUrl: 'https://storage.test/file' });
  await documentUpload({ uploadUrl: 'https://storage.test/upload' }, new Blob(['data'], { type: 'application/pdf' }));
  assert.deepEqual(calls.slice(0, 3), [
    { url: '/api/documents?soId=so1', method: 'GET', body: undefined },
    { url: '/api/documents/upload-token', method: 'POST', body: { soId: 'so1', fileName: 'po.pdf', mimeType: 'application/pdf', size: 4 } },
    { url: '/api/documents', method: 'POST', body: { soId: 'so1', refType: 'PO_CUSTOMER', fileName: 'po.pdf', mimeType: 'application/pdf', size: 4, fileUrl: 'https://storage.test/file' } },
  ]);
  assert.equal(calls[3].url, 'https://storage.test/upload');
  assert.equal(calls[3].method, 'PUT');
  assert.equal(calls[3].body, 4);
});

test('vendor payment API calls /api/vendor-payments endpoint', async () => {
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, method: options.method, body: options.body ? JSON.parse(options.body) : undefined });
    return respond({ success: true, data: {} });
  };

  await vendorPaymentsApi.list({ soId: 'so1' });
  await vendorPaymentsApi.create({ vendorPoId: 'vpo1', amount: 50000, paymentMethod: 'BANK_TRANSFER', paidAt: '2026-11-15T12:00:00+07:00' });

  assert.deepEqual(calls, [
    { url: '/api/vendor-payments?soId=so1', method: 'GET', body: undefined },
    { url: '/api/vendor-payments', method: 'POST', body: { vendorPoId: 'vpo1', amount: 50000, paymentMethod: 'BANK_TRANSFER', paidAt: '2026-11-15T12:00:00+07:00' } },
  ]);
});
