# Design Tokens — OrderTrack

Source: Stitch references from the main project. This is visual guidance, not a pixel-perfect markup contract.

## Direction

Industrial operational terminal: dense information, sharp structure, zero-radius controls, 1px borders, no ambient shadows or blur. Prefer scanability over decoration.

## Core colors

- Canvas: `#FAF8FF`
- Working panel: `#FFFFFF`
- Recessed surface: `#F2F3FF`
- Primary: `#1F108E`
- Primary action: `#3730A3`
- Primary text: `#131B2E`
- Secondary text: `#464553`
- Border: `#C8C4D5`
- Error: `#BA1A1A`

## Status colors

- Draft: background `#F1F5F9`, border `#CBD5E1`, text `#475569`
- In progress: background `#EFF6FF`, border `#93C5FD`, text `#1D4ED8`
- Waiting/overdue: background `#FFFBEB`, border `#FCD34D`, text `#B45309`
- Done/paid: background `#ECFDF5`, border `#6EE7B7`, text `#047857`
- Problem: background `#FEF2F2`, border `#FCA5A5`, text `#B91C1C`

## Typography and layout

- Headings: Space Grotesk, weight 600–700.
- Body and metadata: Geist.
- Currency and IDs use tabular numerals.
- Desktop: 240px utility rail, 12-column workspace, 16px gutters, 24px margin.
- Tablet: 64px icon rail, 8-column workspace.
- Mobile: one column, 12px margin; tables become key-value blocks.
- Controls: 36px dense input height where practical.
- Shapes: `border-radius: 0`.
- Use semantic HTML, visible keyboard focus, and responsive states.

Stitch HTML/CSS is inspiration only. Rebuild semantic, reusable React components and use dummy data until an API contract exists.
