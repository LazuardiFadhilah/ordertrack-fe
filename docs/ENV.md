# Environment and deployment baseline — FE

This repo is the frontend Vercel project. Its Vercel Root Directory is the repository root.

Environment files contain names only. Put values in local untracked `.env.local` files or Vercel Environment Settings. Never commit values.

## Variables

| Variable | Scope | Purpose |
|---|---|---|
| `API_SERVER_URL` | Client build configuration, server-side only | Destination for the Next.js `/api/*` rewrite |

Do not prefix `API_SERVER_URL` with `NEXT_PUBLIC_`; browser code uses same-origin `/api/*`.

## Local commands

```bash
npm ci
npm run check
npm test
npm run build
npm start
```

## Vercel

- Framework preset: Next.js
- Install Command: `npm install`
- Build Command: `npm run build`
- Output: Next.js default output
- Rewrite configuration: `next.config.mjs`
- No production deployment is part of the foundation phase.
