'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { FiArrowLeft, FiBox, FiClipboard, FiDollarSign, FiPlus, FiSend, FiTruck, FiFileText } from 'react-icons/fi';
import { ErrorState, LoadingState } from '../../../../components/data-state.js';
import { PageHeader } from '../../../../components/page-header.js';
import { useSession } from '../../../../components/session.js';
import { StatusBadge } from '../../../../components/status-badge.js';
import { Button } from '../../../../components/ui/button.js';
import { Card, CardContent, CardHeader } from '../../../../components/ui/card.js';
import { Table, TableScroll, Td, Th, Tr } from '../../../../components/ui/table.js';
import { documentsApi, documentUpload, invoiceApi, salesOrdersApi, shippingApi, vendorPaymentsApi } from '../../../../lib/api-client.js';
import { PaymentDialog } from './payment-dialog.js';
import { VendorPaymentDialog } from './vendor-payment-dialog.js';
import { formatCurrency, formatDateTime, salesOrderStatus } from '../../../../lib/master-data.js';
import { canCreateGoodsReceipt, canCreateVendorPo } from '../../../../lib/phase4-helpers.js';
import { useApiData } from '../../../../lib/use-api-data.js';
import { CreateGoodsReceiptDialog } from './create-goods-receipt-dialog.js';
import { CreateShippingRequestDialog } from './create-shipping-request-dialog.js';
import { CreateVendorPoDialog } from './create-vendor-po-dialog.js';
import { DocumentsPanel } from './documents-panel.js';
import { SalesOrderTimeline } from './timeline.jsx';

function InfoItem({ label, children }) {
  return (
    <div>
      <dt className="ledger-label">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-on-surface">{children}</dd>
    </div>
  );
}

function Quantity({ value, ordered }) {
  const reached = Number(value) > 0;
  return (
    <span className={`tabular ${reached ? 'font-semibold text-on-surface' : 'text-on-surface-variant'}`}>
      {value}
      <span className="text-xs font-normal text-on-surface-variant"> / {ordered}</span>
    </span>
  );
}

const TABS = [
  { key: 'items', label: 'Item & progres', icon: FiBox },
  { key: 'vendorPos', label: 'Vendor PO', icon: FiTruck },
  { key: 'goodsReceipts', label: 'Penerimaan barang', icon: FiClipboard },
  { key: 'shipping', label: 'Pengiriman', icon: FiSend },
  { key: 'invoices', label: 'Invoice & pembayaran', icon: FiFileText },
  { key: 'vendorPayments', label: 'Pembayaran vendor', icon: FiDollarSign },
  { key: 'documents', label: 'Dokumen', icon: FiFileText },
];

export default function SalesOrderDetailPage() {
  const { id } = useParams();
  const user = useSession();
  const { data, loading, error, reload } = useApiData(() => salesOrdersApi.get(id), [id]);
  const order = data?.salesOrder;
  const [activeTab, setActiveTab] = useState('items');
  const [openVendorPo, setOpenVendorPo] = useState(false);
  const [openGoodsReceipt, setOpenGoodsReceipt] = useState(false);
  const [openShippingRequest, setOpenShippingRequest] = useState(false);
  const [openPayment, setOpenPayment] = useState(false);
  const [openVendorPayment, setOpenVendorPayment] = useState(false);
  const [invoiceError, setInvoiceError] = useState('');
  const [creatingInvoice, setCreatingInvoice] = useState(false);
  const { data: invoiceData, loading: loadingInvoice, error: errorInvoice, reload: reloadInvoice } = useApiData(
    () => (activeTab === 'invoices' ? invoiceApi.list({ limit: 100 }) : Promise.resolve(null)),
    [activeTab],
  );
  const invoice = (invoiceData?.invoices ?? []).find((item) => String(item.soId) === String(id) && item.status !== 'VOID');
  const { data: invoiceDetail, loading: loadingPayments, error: errorPayments, reload: reloadPayments } = useApiData(
    () => (activeTab === 'invoices' && invoice ? invoiceApi.get(invoice._id) : Promise.resolve(null)),
    [activeTab, invoice?._id],
  );

  const { data: requestsData, loading: loadingRequests, error: errorRequests, reload: reloadRequests } = useApiData(
    () => (activeTab === 'shipping' ? shippingApi.listRequests({ soId: id, limit: 100 }) : Promise.resolve(null)),
    [activeTab, id],
  );
  const { data: deliveryData, loading: loadingDelivery, error: errorDelivery, reload: reloadDelivery } = useApiData(
    () => (activeTab === 'shipping' ? shippingApi.listDeliveryOrders({ soId: id, limit: 100 }) : Promise.resolve(null)),
    [activeTab, id],
  );
  const requests = requestsData?.items ?? [];
  const deliveryOrders = deliveryData?.items ?? [];
  const { data: vendorPaymentData, loading: loadingVendorPayments, error: errorVendorPayments, reload: reloadVendorPayments } = useApiData(
    () => (activeTab === 'vendorPayments' ? vendorPaymentsApi.list({ soId: id, limit: 100 }) : Promise.resolve(null)),
    [activeTab, id],
  );
  const vendorPayments = vendorPaymentData?.payments ?? [];

  if (loading && !order) {
    return (
      <>
        <PageHeader eyebrow="Penjualan" title="Detail sales order" />
        <Card><LoadingState label="Memuat sales order…" /></Card>
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <PageHeader eyebrow="Penjualan" title="Detail sales order" />
        <Card><ErrorState message={error?.message ?? 'Sales order tidak ditemukan.'} onRetry={reload} /></Card>
      </>
    );
  }

  const badge = salesOrderStatus(order.status);
  const canVpo = canCreateVendorPo(user.role);
  const canGr = canCreateGoodsReceipt(user.role);
  const canSr = user.role === 'SALES' || user.role === 'GA' || user.role === 'ADMIN';
  const canInvoice = ['AR', 'ADMIN'].includes(user.role);

  async function handleCreateInvoice() {
    setCreatingInvoice(true);
    setInvoiceError('');
    try {
      await invoiceApi.create({ soId: id, dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10) });
      reloadInvoice();
      reload();
    } catch (err) { setInvoiceError(err.message); }
    finally { setCreatingInvoice(false); }
  }

  const actions = (
    <div className="flex flex-wrap items-center gap-2">
      {canVpo && (
        <Button onClick={() => setOpenVendorPo(true)} size="sm" variant="outline">
          <FiPlus aria-hidden="true" className="h-3.5 w-3.5" />
          Vendor PO
        </Button>
      )}
      {canGr && (
        <Button onClick={() => setOpenGoodsReceipt(true)} size="sm" variant="outline">
          <FiPlus aria-hidden="true" className="h-3.5 w-3.5" />
          Penerimaan
        </Button>
      )}
      {canSr && (
        <Button onClick={() => setOpenShippingRequest(true)} size="sm" variant="outline">
          <FiPlus aria-hidden="true" className="h-3.5 w-3.5" />
          Permintaan Kirim
        </Button>
      )}
      <Button onClick={() => setActiveTab('invoices')} size="sm" variant="outline"><FiFileText aria-hidden="true" className="h-3.5 w-3.5" />Invoice & AR</Button>
      <Link className="inline-flex min-h-9 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface" href="/sales-orders">
        <FiArrowLeft aria-hidden="true" className="h-4 w-4" />
        Kembali
      </Link>
    </div>
  );

  return (
    <>
      <PageHeader
        actions={actions}
        description={order.customerName}
        eyebrow="Sales order"
        title={(
          <span className="inline-flex flex-wrap items-center gap-3">
            <span className="font-mono text-xl tracking-tight sm:text-2xl">{order.soNumber}</span>
            <StatusBadge label={badge.label} tone={badge.tone} />
          </span>
        )}
      />

      <div className="mb-6 border-b border-outline-variant">
        <div className="flex flex-wrap gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                aria-current={active ? 'page' : undefined}
                className={`inline-flex min-h-11 items-center gap-2 rounded-t-lg border-b-2 px-4 py-2 text-sm font-semibold transition-colors ${active ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:bg-surface-container hover:text-on-surface'}`}
                onClick={() => setActiveTab(tab.key)}
                type="button"
              >
                <Icon aria-hidden="true" className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === 'items' && (
        <div className="grid gap-6 xl:grid-cols-12">
          <div className="min-w-0 space-y-6 xl:col-span-8">
            <Card>
              <CardHeader>
                <p className="eyebrow text-primary">Item & progres</p>
                <h2 className="mt-1 font-display text-lg font-semibold text-on-surface">Kuantitas per tahap</h2>
              </CardHeader>
              <TableScroll>
                <Table className="min-w-[52rem]">
                  <thead>
                    <tr>
                      <Th>SKU</Th>
                      <Th>Nama item</Th>
                      <Th className="text-right">Diterima</Th>
                      <Th className="text-right">Dikirim</Th>
                      <Th className="text-right">Ditagih</Th>
                      <Th className="text-right">Harga satuan</Th>
                      <Th className="text-right">Jumlah</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, index) => (
                      <Tr key={`${item.sku}-${index}`}>
                        <Td className="whitespace-nowrap font-mono text-xs">{item.sku}</Td>
                        <Td className="min-w-[12rem]">
                          <p className="font-semibold text-on-surface">{item.name}</p>
                          <p className="mt-0.5 text-xs text-on-surface-variant">Qty order: <span className="tabular font-semibold text-on-surface">{item.qtyOrdered}</span></p>
                        </Td>
                        <Td className="text-right"><Quantity ordered={item.qtyOrdered} value={item.qtyReceived} /></Td>
                        <Td className="text-right"><Quantity ordered={item.qtyOrdered} value={item.qtyShipped} /></Td>
                        <Td className="text-right"><Quantity ordered={item.qtyOrdered} value={item.qtyInvoiced} /></Td>
                        <Td className="whitespace-nowrap text-right tabular">{formatCurrency(item.unitPrice)}</Td>
                        <Td className="whitespace-nowrap text-right font-semibold tabular">{formatCurrency(Number(item.qtyOrdered) * Number(item.unitPrice))}</Td>
                      </Tr>
                    ))}
                  </tbody>
                </Table>
              </TableScroll>
              <div className="flex items-center justify-between gap-4 border-t border-outline-variant bg-surface-container-low px-5 py-4 sm:px-6">
                <p className="text-sm text-on-surface-variant">Total ({order.items.length} item)</p>
                <p className="font-display text-xl font-semibold tabular text-on-surface">{formatCurrency(order.totalAmount)}</p>
              </div>
            </Card>
          </div>

          <div className="min-w-0 xl:col-span-4">
            <Card as="aside" aria-label="Informasi sales order" className="bg-surface-container-low">
              <CardHeader>
                <p className="eyebrow">Ringkasan</p>
                <h2 className="mt-1 font-display text-lg font-semibold text-on-surface">Informasi dokumen</h2>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  <InfoItem label="Customer">{order.customerName}</InfoItem>
                  <InfoItem label="PO customer">{order.customerPoNumber || '—'}</InfoItem>
                  <InfoItem label="Quotation">
                    <Link className="font-mono text-xs text-primary underline underline-offset-4" href={`/quotations/${order.quotationId}`}>
                      {order.quotationNumber}
                    </Link>
                  </InfoItem>
                  <InfoItem label="Sales">{order.salesName ?? '—'}</InfoItem>
                  <InfoItem label="Dibuat">{formatDateTime(order.createdAt)}</InfoItem>
                </dl>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'vendorPos' && (
        <Card>
          <CardHeader>
            <p className="eyebrow text-primary">Vendor PO</p>
            <h2 className="mt-1 font-display text-lg font-semibold text-on-surface">Daftar pemesanan ke vendor</h2>
          </CardHeader>
          {(order.vendorPos ?? []).length === 0 ? (
            <div className="px-5 py-10 text-center sm:px-6">
              <p className="text-sm font-semibold text-on-surface">Belum ada Vendor PO</p>
              <p className="mt-1 text-sm text-on-surface-variant">Purchasing dapat membuat Vendor PO untuk SO ini.</p>
            </div>
          ) : (
            <TableScroll>
              <Table className="min-w-[40rem]">
                <thead>
                  <tr>
                    <Th>Nomor PO</Th>
                    <Th>Vendor</Th>
                    <Th>Status</Th>
                    <Th>Tanggal</Th>
                  </tr>
                </thead>
                <tbody>
                  {(order.vendorPos ?? []).map((vpo) => (
                    <Tr key={vpo.id}>
                      <Td className="whitespace-nowrap font-mono text-xs font-semibold">{vpo.poNumber}</Td>
                      <Td className="min-w-[12rem]">{vpo.vendorName}</Td>
                      <Td><StatusBadge label={salesOrderStatus(vpo.status).label} tone={salesOrderStatus(vpo.status).tone} /></Td>
                      <Td className="whitespace-nowrap text-on-surface-variant">{formatDateTime(vpo.createdAt)}</Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </TableScroll>
          )}
        </Card>
      )}

      {activeTab === 'goodsReceipts' && (
        <Card>
          <CardHeader>
            <p className="eyebrow text-primary">Penerimaan barang</p>
            <h2 className="mt-1 font-display text-lg font-semibold text-on-surface">Riwayat penerimaan</h2>
          </CardHeader>
          {(order.goodsReceipts ?? []).length === 0 ? (
            <div className="px-5 py-10 text-center sm:px-6">
              <p className="text-sm font-semibold text-on-surface">Belum ada penerimaan</p>
              <p className="mt-1 text-sm text-on-surface-variant">GA dapat mencatat barang masuk setelah Purchasing membuat Vendor PO.</p>
            </div>
          ) : (
            <TableScroll>
              <Table className="min-w-[40rem]">
                <thead>
                  <tr>
                    <Th>Nomor GR</Th>
                    <Th>Vendor PO</Th>
                    <Th>Diterima</Th>
                  </tr>
                </thead>
                <tbody>
                  {(order.goodsReceipts ?? []).map((gr) => (
                    <Tr key={gr.id}>
                      <Td className="whitespace-nowrap font-mono text-xs font-semibold">{gr.grNumber}</Td>
                      <Td className="min-w-[12rem]">{gr.vendorPoNumber}</Td>
                      <Td className="whitespace-nowrap text-on-surface-variant">{formatDateTime(gr.receivedAt)}</Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </TableScroll>
          )}
        </Card>
      )}

      {activeTab === 'invoices' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div><p className="eyebrow text-primary">Piutang usaha</p><h2 className="mt-1 font-display text-lg font-semibold">Invoice & pembayaran</h2></div>
              <div className="flex flex-wrap gap-2">
                {canInvoice && !invoice && ['SHIPPED', 'DO_RETURNED', 'COMPLETED'].includes(order.status) && <Button disabled={creatingInvoice} onClick={handleCreateInvoice}>{creatingInvoice ? 'Membuat…' : 'Buat invoice'}</Button>}
                {canInvoice && invoice && ['ISSUED', 'PARTIALLY_PAID'].includes(invoice.status) && <Button onClick={() => setOpenPayment(true)}>Catat pembayaran</Button>}
              </div>
            </div>
          </CardHeader>
          {invoiceError && <p className="mx-6 mb-4 rounded-md border border-danger/30 bg-danger/5 p-3 text-sm text-danger" role="alert">{invoiceError}</p>}
          {loadingInvoice ? <LoadingState label="Memuat invoice…" /> : errorInvoice ? <ErrorState message={errorInvoice.message} onRetry={reloadInvoice} /> : invoice ? (
            <div className="space-y-5 px-5 pb-6 sm:px-6">
              <dl className="grid gap-4 border-y border-outline-variant py-4 sm:grid-cols-2 lg:grid-cols-4">
                <InfoItem label="Nomor invoice"><span className="font-mono">{invoice.invoiceNumber}</span></InfoItem>
                <InfoItem label="Status"><StatusBadge label={invoice.status} tone={invoice.status === 'PAID' ? 'done' : invoice.status === 'PARTIALLY_PAID' ? 'waiting' : 'progress'} /></InfoItem>
                <InfoItem label="Total invoice">{formatCurrency(invoice.totalAmount)}</InfoItem>
                <InfoItem label="Sisa piutang">{formatCurrency(Math.max(0, invoice.totalAmount - invoice.paidAmount))}</InfoItem>
              </dl>
              <TableScroll><Table className="min-w-[38rem]"><thead><tr><Th>Produk</Th><Th className="text-right">Qty</Th><Th className="text-right">Harga</Th><Th className="text-right">Jumlah</Th></tr></thead><tbody>{invoice.items.map((item, index) => <Tr key={`${item.sku}-${index}`}><Td><span className="font-mono text-xs">{item.sku}</span><span className="ml-2 font-medium">{item.name}</span></Td><Td className="text-right tabular">{item.qty}</Td><Td className="text-right tabular">{formatCurrency(item.unitPrice)}</Td><Td className="text-right font-semibold tabular">{formatCurrency(item.totalPrice)}</Td></Tr>)}</tbody></Table></TableScroll>
              <div><h3 className="mb-2 text-sm font-semibold text-on-surface">Riwayat pembayaran</h3>{loadingPayments ? <LoadingState label="Memuat pembayaran…" /> : errorPayments ? <ErrorState message={errorPayments.message} onRetry={reloadPayments} /> : (invoiceDetail?.payments ?? []).length ? <TableScroll><Table className="min-w-[34rem]"><thead><tr><Th>Nomor pembayaran</Th><Th>Tanggal</Th><Th>Metode</Th><Th className="text-right">Nominal</Th></tr></thead><tbody>{invoiceDetail.payments.map((payment) => <Tr key={payment._id}><Td className="font-mono text-xs">{payment.paymentNumber}</Td><Td>{formatDateTime(payment.paidAt)}</Td><Td>{payment.paymentMethod}</Td><Td className="text-right font-semibold tabular">{formatCurrency(payment.amount)}</Td></Tr>)}</tbody></Table></TableScroll> : <p className="text-sm text-on-surface-variant">Belum ada pembayaran.</p>}</div>
            </div>
          ) : <div className="px-5 py-10 text-center sm:px-6"><p className="text-sm font-semibold">Belum ada invoice untuk SO ini</p><p className="mt-1 text-sm text-on-surface-variant">Invoice dapat dibuat setelah pengiriman selesai.</p></div>}
        </Card>
      )}

      {activeTab === 'shipping' && (
        <Card>
          <CardHeader>
            <p className="eyebrow text-primary">Pengiriman</p>
            <h2 className="mt-1 font-display text-lg font-semibold text-on-surface">Riwayat pengiriman</h2>
          </CardHeader>
          {loadingRequests || loadingDelivery ? (
            <LoadingState label="Memuat data pengiriman…" />
          ) : errorRequests || errorDelivery ? (
            <ErrorState message={(errorRequests ?? errorDelivery).message} onRetry={() => { reloadRequests(); reloadDelivery(); }} />
          ) : (
            <div className="space-y-6 px-5 py-2 sm:px-6">
              <div>
                <h3 className="mb-2 text-sm font-semibold text-on-surface">Permintaan kirim</h3>
                {requests.length === 0 ? (
                  <p className="text-sm text-on-surface-variant">Belum ada permintaan kirim.</p>
                ) : (
                  <TableScroll>
                    <Table className="min-w-[36rem]">
                      <thead>
                        <tr>
                          <Th>Nomor SR</Th>
                          <Th>Status</Th>
                          <Th>Item</Th>
                          <Th>Dibuat</Th>
                        </tr>
                      </thead>
                      <tbody>
                        {requests.map((sr) => (
                          <Tr key={sr.id}>
                            <Td className="whitespace-nowrap font-mono text-xs font-semibold">{sr.srNumber}</Td>
                            <Td><StatusBadge label={salesOrderStatus(sr.status).label} tone={salesOrderStatus(sr.status).tone} /></Td>
                            <Td className="text-sm">{sr.items.map((it) => `${it.sku} (${it.qty})`).join(', ')}</Td>
                            <Td className="whitespace-nowrap text-on-surface-variant">{formatDateTime(sr.createdAt)}</Td>
                          </Tr>
                        ))}
                      </tbody>
                    </Table>
                  </TableScroll>
                )}
              </div>
              <div>
                <h3 className="mb-2 text-sm font-semibold text-on-surface">Surat jalan</h3>
                {deliveryOrders.length === 0 ? (
                  <p className="text-sm text-on-surface-variant">Belum ada surat jalan.</p>
                ) : (
                  <TableScroll>
                    <Table className="min-w-[36rem]">
                      <thead>
                        <tr>
                          <Th>Nomor DO</Th>
                          <Th>Status</Th>
                          <Th>Item</Th>
                          <Th>Dibuat</Th>
                        </tr>
                      </thead>
                      <tbody>
                        {deliveryOrders.map((doItem) => (
                          <Tr key={doItem.id}>
                            <Td className="whitespace-nowrap font-mono text-xs font-semibold">{doItem.doNumber}</Td>
                            <Td><StatusBadge label={salesOrderStatus(doItem.status).label} tone={salesOrderStatus(doItem.status).tone} /></Td>
                            <Td className="text-sm">{doItem.items.map((it) => `${it.sku} (${it.qty})`).join(', ')}</Td>
                            <Td className="whitespace-nowrap text-on-surface-variant">{formatDateTime(doItem.createdAt)}</Td>
                          </Tr>
                        ))}
                      </tbody>
                    </Table>
                  </TableScroll>
                )}
              </div>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'items' && <SalesOrderTimeline soId={id} />}

      {activeTab === 'documents' && <DocumentsPanel canUpload={['SALES', 'GA', 'AR', 'ADMIN'].includes(user.role)} soId={id} />}

      {activeTab === 'vendorPayments' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div><p className="eyebrow text-primary">Hutang usaha</p><h2 className="mt-1 font-display text-lg font-semibold">Pembayaran vendor</h2></div>
              <Button onClick={() => setOpenVendorPayment(true)}>Catat pembayaran</Button>
            </div>
          </CardHeader>
          {loadingVendorPayments ? <LoadingState label="Memuat pembayaran…" /> : errorVendorPayments ? <ErrorState message={errorVendorPayments.message} onRetry={reloadVendorPayments} /> : vendorPayments.length === 0 ? (
            <div className="px-5 py-10 text-center sm:px-6"><p className="text-sm font-semibold">Belum ada pembayaran vendor</p><p className="mt-1 text-sm text-on-surface-variant">Pembayaran vendor akan muncul setelah dicatat.</p></div>
          ) : (
            <TableScroll><Table className="min-w-[50rem]"><thead><tr><Th>Nomor pembayaran</Th><Th>Vendor PO</Th><Th>Vendor</Th><Th>Tanggal</Th><Th>Metode</Th><Th className="text-right">Nominal</Th></tr></thead><tbody>{vendorPayments.map((payment) => <Tr key={payment._id}><Td className="font-mono text-xs font-semibold">{payment.paymentNumber}</Td><Td className="font-mono text-xs">{payment.vendorPoNumber}</Td><Td>{payment.vendorName}</Td><Td className="whitespace-nowrap">{formatDateTime(payment.paidAt)}</Td><Td>{payment.paymentMethod}</Td><Td className="text-right font-semibold tabular">{formatCurrency(payment.amount)}</Td></Tr>)}</tbody></Table></TableScroll>
          )}
        </Card>
      )}

      <CreateVendorPoDialog
        onClose={() => setOpenVendorPo(false)}
        onSuccess={reload}
        open={openVendorPo}
        salesOrder={order}
      />
      <CreateGoodsReceiptDialog
        onClose={() => setOpenGoodsReceipt(false)}
        onSuccess={reload}
        open={openGoodsReceipt}
        salesOrder={order}
      />
      <CreateShippingRequestDialog
        onClose={() => setOpenShippingRequest(false)}
        onSuccess={() => { reload(); reloadRequests(); }}
        open={openShippingRequest}
        salesOrder={order}
      />
      {invoice && <PaymentDialog invoice={invoice} onClose={() => setOpenPayment(false)} onSuccess={() => { reloadInvoice(); reloadPayments(); reload(); }} open={openPayment} />}
      <VendorPaymentDialog salesOrder={order} onClose={() => setOpenVendorPayment(false)} onSuccess={() => { reloadVendorPayments(); reload(); }} open={openVendorPayment} />
    </>
  );
}
