import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

test('phase 10 dashboard defines role queues without notification center', () => {
  const page = fs.readFileSync('app/(app)/page.js', 'utf8');
  for (const role of ['SALES', 'GA', 'AR', 'AP', 'ADMIN']) assert.match(page, new RegExp(role));
  for (const api of ['salesOrdersApi', 'shippingApi', 'invoiceApi', 'vendorPosApi']) assert.match(page, new RegExp(api));
  assert.match(page, /LoadingState/);
  assert.match(page, /ErrorState/);
  assert.match(page, /EmptyState/);
  assert.doesNotMatch(page, /notification|notifikasi/i);
});
