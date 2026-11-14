# OrderTrack FE

Frontend OrderTrack: dashboard operasional Order-to-Cash berbasis Next.js.

## Stack

- Next.js App Router
- React
- Tailwind CSS
- JavaScript ES modules
- Node.js 20+

## Development

```bash
npm ci
npm run dev
```

Buka `http://localhost:3000`.

## Checks

```bash
npm run check
npm test
npm run build
npm audit --omit=dev
```

## Environment

Salin `.env.example` menjadi `.env.local` bila perlu. `API_SERVER_URL` dipakai oleh `next.config.mjs` untuk rewrite server-side `/api/*`; kode browser tetap memanggil path same-origin `/api/*`.

Jangan commit `.env.local` atau secret.

## Docs

- `docs/API.md` — kontrak endpoint yang dipakai FE
- `docs/ENV.md` — konfigurasi environment dan deployment
- `docs/design-tokens.md` — arahan visual dari Stitch
- `docs/tasks/TASK-003-client-scaffold-shell.md` — scope FE fase fondasi
- `docs/QA-REPORT-002.md` — bukti QA fase 1

Stitch adalah referensi visual, bukan markup yang dicopy. Data pada fase awal masih placeholder/dummy.
