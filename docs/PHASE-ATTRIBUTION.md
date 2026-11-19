# Frontend phase attribution audit

This note records the file ownership represented by the existing `main` history without rewriting commits.

| Commit | Historical label | Actual ownership |
| --- | --- | --- |
| `f81e304` | `feat: add role-aware phase 10 dashboard` | Phase 8 document UI (`app/(app)/sales-orders/[id]/documents-panel.js`), related sales-order wiring (`app/(app)/sales-orders/[id]/page.js`), document API client support (`lib/api-client.js`), dashboard changes (`app/(app)/page.js`), and associated tests (`test/client-shell.test.js`, `test/dashboard.test.js`). |
| `e627b1a` | `feat(phase8): add sales order documents UI` | API-client test coverage only (`test/api-client.test.js`); it does not contain the document-panel or dashboard implementation. |

## Audit conclusion

The Phase 8 document UI files are present on `main`, but their implementation is owned by `f81e304`; `e627b1a` adds only follow-up API-client tests. The dashboard implementation is also owned by `f81e304`. This corrective note makes that attribution explicit while preserving all existing behavior and history.

Verification for this corrective commit:

- `npm test`
- `npm run build`
