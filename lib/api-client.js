const NETWORK_ERROR = 'Tidak dapat menghubungi server. Periksa koneksi lalu coba lagi.';
const FALLBACK_ERROR = 'Permintaan gagal diproses. Coba lagi.';

const statusMessages = {
  401: 'Sesi Anda berakhir. Silakan masuk kembali.',
  403: 'Anda tidak punya akses ke data ini.',
  404: 'Data tidak ditemukan.',
  409: 'Status data sudah berubah. Muat ulang lalu coba lagi.',
};

export class ApiError extends Error {
  constructor(message, { status = 0, errors = [] } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = Array.isArray(errors) ? errors : [];
  }

  fieldErrors() {
    return Object.fromEntries(this.errors.filter((item) => item?.field).map((item) => [item.field, item.message]));
  }
}

export async function readBody(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function buildQuery(query) {
  if (!query) return '';
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    params.set(key, String(value));
  }
  const search = params.toString();
  return search ? `?${search}` : '';
}

export async function request(path, { method = 'GET', body, query, signal } = {}) {
  const hasBody = body !== undefined;
  let response;

  try {
    response = await fetch(`${path}${buildQuery(query)}`, {
      method,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      },
      body: hasBody ? JSON.stringify(body) : undefined,
      cache: 'no-store',
      signal,
    });
  } catch (error) {
    if (error?.name === 'AbortError') throw error;
    throw new ApiError(NETWORK_ERROR, { status: 0 });
  }

  const payload = await readBody(response);

  if (!response.ok || payload?.success === false) {
    throw new ApiError(payload?.message || statusMessages[response.status] || FALLBACK_ERROR, {
      status: response.status,
      errors: payload?.errors,
    });
  }

  return payload?.data ?? null;
}

const resourcePath = (base, id) => `${base}/${encodeURIComponent(id)}`;

export const customersApi = {
  list: (query) => request('/api/customers', { query }),
  get: (id) => request(resourcePath('/api/customers', id)),
  create: (body) => request('/api/customers', { method: 'POST', body }),
  update: (id, body) => request(resourcePath('/api/customers', id), { method: 'PATCH', body }),
};

export const vendorsApi = {
  list: (query) => request('/api/vendors', { query }),
  get: (id) => request(resourcePath('/api/vendors', id)),
  create: (body) => request('/api/vendors', { method: 'POST', body }),
  update: (id, body) => request(resourcePath('/api/vendors', id), { method: 'PATCH', body }),
};

export const quotationsApi = {
  list: (query) => request('/api/quotations', { query }),
  get: (id) => request(resourcePath('/api/quotations', id)),
  create: (body) => request('/api/quotations', { method: 'POST', body }),
  update: (id, body) => request(resourcePath('/api/quotations', id), { method: 'PATCH', body }),
  send: (id) => request(`${resourcePath('/api/quotations', id)}/send`, { method: 'POST' }),
  lose: (id) => request(`${resourcePath('/api/quotations', id)}/lose`, { method: 'POST' }),
  convert: (id, body) => request(`${resourcePath('/api/quotations', id)}/convert`, { method: 'POST', body }),
};

export const salesOrdersApi = {
  list: (query) => request('/api/sales-orders', { query }),
  get: (id) => request(resourcePath('/api/sales-orders', id)),
};

export const notificationsApi = {
  list: (query) => request('/api/notifications', { query }),
  timeline: (soId, query) => request(`/api/notifications/timeline/${encodeURIComponent(soId)}`, { query }),
  get: (id) => request(resourcePath('/api/notifications', id)),
  markRead: (id) => request(`${resourcePath('/api/notifications', id)}/read`, { method: 'PATCH' }),
};

export const documentsApi = {
  list: (query) => request('/api/documents', { query }),
  create: (body) => request('/api/documents', { method: 'POST', body }),
  uploadToken: (body) => request('/api/documents/upload-token', { method: 'POST', body }),
};

export const documentUpload = async (token, file) => {
  const response = await fetch(token.uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
  if (!response.ok) throw new ApiError('Upload dokumen gagal.', { status: response.status });
  return response;
};

export const invoiceApi = {
  list: (query) => request('/api/invoices', { query }),
  get: (id) => request(resourcePath('/api/invoices', id)),
  create: (body) => request('/api/invoices', { method: 'POST', body }),
};

export const paymentApi = {
  create: (body) => request('/api/invoices/payments', { method: 'POST', body }),
};

export const vendorPosApi = {
  list: (query) => request('/api/vendor-pos', { query }),
  get: (id) => request(resourcePath('/api/vendor-pos', id)),
  create: (body) => request('/api/vendor-pos', { method: 'POST', body }),
};

export const goodsReceiptsApi = {
  list: (query) => request('/api/goods-receipts', { query }),
  get: (id) => request(resourcePath('/api/goods-receipts', id)),
  create: (body) => request('/api/goods-receipts', { method: 'POST', body }),
};

export const shippingApi = {
  listRequests: (query) => request('/api/shipping/shipping-requests', { query }),
  getRequest: (id) => request(resourcePath('/api/shipping/shipping-requests', id)),
  createRequest: (body) => request('/api/shipping/shipping-requests', { method: 'POST', body }),
  listDeliveryOrders: (query) => request('/api/shipping/delivery-orders', { query }),
  getDeliveryOrder: (id) => request(resourcePath('/api/shipping/delivery-orders', id)),
  createDeliveryOrder: (body) => request('/api/shipping/delivery-orders', { method: 'POST', body }),
  markSignedReturned: (id) => request(`${resourcePath('/api/shipping/delivery-orders', id)}/signed-returned`, { method: 'PATCH' }),
};

export const vendorPaymentsApi = {
  list: (query) => request('/api/vendor-payments', { query }),
  create: (body) => request('/api/vendor-payments', { method: 'POST', body }),
};

