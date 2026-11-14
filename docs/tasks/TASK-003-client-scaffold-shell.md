# TASK-003 — Client scaffold and visual shell

Status: `MERGED`
Owner: `FE`
Branch: `feat/TASK-003-client-scaffold-shell`

## Scope

Create the Next.js App Router foundation and a minimal responsive OrderTrack shell using `docs/design-tokens.md`. The shell proves the visual system without pretending domain data exists.

## Out of scope

- Authentication flow
- Domain screens and API fetching
- Business logic or Next.js Route Handlers
- Server changes
- Copying Stitch HTML as application markup

## Acceptance criteria

- [x] Reproducible Next.js package with install, dev, check, test, and build commands.
- [x] Local-safe Geist and Space Grotesk font implementation.
- [x] Zero-radius, 1px-border industrial visual direction.
- [x] Responsive shell with semantic landmarks and placeholder state.
- [x] Visible keyboard focus and usable contrast.
- [x] No real customer/vendor/company/document data.
- [x] Build and QA pass.

## Evidence

- Commit: `49bbb81 fix(client): add checks and update postcss [TASK-003]`
- QA: `docs/QA-REPORT-002.md`
