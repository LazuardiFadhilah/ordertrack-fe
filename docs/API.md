# API Contract — OrderTrack

Status: **APPROVED — Gate 1 approved by human**
Version: `0.1.0`
Base path: `/api`

This is the shared contract between FE and BE. FE must not invent endpoints or fields.

## Response conventions

Success:

```json
{
  "success": true,
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Human-readable message",
  "errors": []
}
```

- Request and response bodies use `application/json`.
- Timestamps use ISO 8601 UTC strings.
- Validation errors use `errors` as `{ "field": "string", "message": "string" }` items.
- Auth uses an httpOnly JWT cookie; the token never appears in JSON.
- Protected endpoints return `401` without a valid session and `403` for a disallowed role.

## Phase 1 — health

### `GET /api/health`

No authentication required.

**200**

```json
{
  "success": true,
  "data": {
    "service": "server",
    "status": "ok"
  }
}
```

## Phase 2 — authentication

### `POST /api/auth/login`

Request:

```json
{
  "email": "sales@example.test",
  "password": "dummy-password"
}
```

**200** sets the configured httpOnly cookie:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "name": "string",
      "email": "sales@example.test",
      "role": "SALES"
    }
  }
}
```

**400** invalid request shape
**401** invalid credentials

### `POST /api/auth/logout`

**200**

```json
{
  "success": true,
  "data": null
}
```

### `GET /api/auth/me`

Returns the safe authenticated user profile. **401** without a valid session.

Roles: `SALES | PURCHASING | GA | AR | AP | ADMIN`

## Not yet contracted

Quotation, sales order, vendor PO, goods receipt, shipping, delivery order, documents, invoices, payments, notifications, activity logs, and cron reminders require endpoint definitions before implementation.
