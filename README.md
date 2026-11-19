# OrderTrack

Aplikasi dummy untuk memperlihatkan alur order-to-cash: quotation, sales order, penerimaan barang, pengiriman, dan penagihan. Seluruh nama, kontak, NPWP, nomor dokumen, dan angka di fixture adalah fiktif; jangan masukkan data customer/vendor nyata.

## Stack

- Frontend: Next.js App Router, React, Tailwind CSS
- API fixture: Node.js HTTP server in-memory untuk demo lokal
- API produksi: Express, Mongoose, MongoDB di repo backend terpisah

## Jalankan lokal (fixture tanpa database)

Terminal 1:

```bash
npm ci
npm run mock:api
```

Terminal 2:

```bash
API_SERVER_URL=http://127.0.0.1:4010 npm run dev
```

Buka http://localhost:3000. Fixture tersedia lewat `admin@example.test`, `sales@example.test`, atau `ar@example.test`; form login menerima password demonstrasi apa pun. Data berhenti saat mock API dihentikan.

## Checks

```bash
npm run check
npm test
npm run build
```

## Screenshots

- Desktop: [`docs/screenshots/ordertrack-desktop.png`](docs/screenshots/ordertrack-desktop.png)
- Mobile: [`docs/screenshots/ordertrack-mobile.png`](docs/screenshots/ordertrack-mobile.png)

Screenshot diambil dari aplikasi lokal yang berjalan, menggunakan fixture dummy.

## Environment

`API_SERVER_URL` dipakai oleh `next.config.mjs` untuk rewrite server-side `/api/*`. Jangan commit `.env.local`, secret, atau data nyata.

## Docs

- `docs/API.md` — kontrak endpoint yang dipakai FE
- `docs/ENV.md` — konfigurasi environment dan deployment
- `docs/design-tokens.md` — arahan visual dari Stitch
- `docs/QA-REPORT-002.md` — bukti QA fase fondasi

Stitch adalah referensi visual, bukan markup yang dicopy.