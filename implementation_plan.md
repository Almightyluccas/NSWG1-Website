# Operations Center

A military-grade Operations Center hub for browsing, viewing, and managing operations — complete with intel sections, planning materials, SSE, and a world map for each operation. **UI only** — all data is fake/hardcoded; the user will implement backend later.

## Proposed Changes

### Sidebar Navigation

#### [MODIFY] [sidebar.tsx](file:///c:/Programming%20Projects/NSWG1-Website/src/components/dashboard/sidebar.tsx)
- Add **"Operations"** nav item with a `Crosshair` icon, linking to `/operations`
- Position it between "Dashboard" and "Calendar"

---

### Operations List Page — `/operations`

#### [NEW] [page.tsx](file:///c:/Programming%20Projects/NSWG1-Website/src/app/operations/page.tsx)
Server page with dashboard sidebar layout for members. Renders `OperationsClient`.

#### [NEW] [operations-client.tsx](file:///c:/Programming%20Projects/NSWG1-Website/src/app/operations/operations-client.tsx)
The main Operations Center listing. Contains:

- **Status filter tabs**: ACTIVE (default/prioritized) → UPCOMING → COMPLETED
- **Operation cards** in a grid, each showing:
  - Operation name (codename style, e.g. "OP TRIDENT FURY")
  - Status badge (ACTIVE = accent pulse, UPCOMING = zinc, COMPLETED = muted)
  - Classification level badge
  - Date range, AO (area of operations), assigned unit
  - Click → navigates to `/operations/[id]`
- **SSE Library section** at the bottom — a card/link leading to `/operations/sse` for the general SSE repository
- ~8-10 fake operations across all three statuses

---

### Operation Detail Page — `/operations/[id]`

#### [NEW] [page.tsx](file:///c:/Programming%20Projects/NSWG1-Website/src/app/operations/[id]/page.tsx)
Server page wrapping `OperationDetail` with dashboard sidebar layout.

#### [NEW] [operation-detail.tsx](file:///c:/Programming%20Projects/NSWG1-Website/src/app/operations/[id]/operation-detail.tsx)
The full operation detail view. Layout:

```
┌─────────────────────────────────────────────────────┐
│  OP HEADER — codename, status, classification,      │
│  date range, assigned unit, AO                      │
├────────────────────────────┬────────────────────────┤
│                            │                        │
│  OPERATION INFO            │  WORLD MAP             │
│  Mission brief, objectives │  (SVG/image with a     │
│  commander, force comp     │   marker pin on the    │
│                            │   operation's region)  │
├────────────────────────────┴────────────────────────┤
│  TABS: Intel │ Planning │ SSE                       │
├─────────────────────────────────────────────────────┤
│  Tab Content (see below)                            │
└─────────────────────────────────────────────────────┘
```

**Intel Tab** — Three sub-sections:
| Section | Description |
|---------|-------------|
| Regional Intelligence | Geographic/political context of the AO |
| Operational Intelligence | Force disposition, threat assessment, HVTs |
| Signal Intelligence (SIGINT) | Comms intercepts, electronic signatures |

Each section renders as a card with fake classified-looking content.

**Planning Tab** — Three document types:
| Document | Description |
|----------|-------------|
| CONOP (Concept of Operations) | High-level mission plan |
| FRAGO (Fragmentary Order) | Updates/modifications to the base order |
| WARNO (Warning Order) | Advance notice of upcoming operations |

Each renders as a downloadable document-style card.

**SSE Tab** — Sensitive Site Exploitation materials related to this operation:
- List of SSE items (evidence, documents, media)
- Each item shows type, date collected, status
- Link to the general SSE library page

---

### SSE Library Page — `/operations/sse`

#### [NEW] [page.tsx](file:///c:/Programming%20Projects/NSWG1-Website/src/app/operations/sse/page.tsx)
General SSE repository page (dashboard sidebar layout). Contains:
- Grid of SSE items across all operations
- Filter by operation, type, and date
- Upload button (UI only, non-functional placeholder)
- Each item links back to its parent operation

---

### World Map Component

#### [NEW] [world-map.tsx](file:///c:/Programming%20Projects/NSWG1-Website/src/components/operations/world-map.tsx)
A simplified, stylized SVG world map with:
- Dark/military styling (dark fill, accent-colored borders)
- A glowing pin/marker at the operation's coordinates
- Subtle grid overlay for the tactical look

---

## File Summary

| File | Type | Purpose |
|------|------|---------|
| [sidebar.tsx](file:///c:/Programming%20Projects/NSWG1-Website/src/components/dashboard/sidebar.tsx) | MODIFY | Add Operations nav link |
| `operations/page.tsx` | NEW | Server page for ops listing |
| `operations/operations-client.tsx` | NEW | Ops listing UI with status tabs + SSE link |
| `operations/[id]/page.tsx` | NEW | Server page for op detail |
| `operations/[id]/operation-detail.tsx` | NEW | Full op detail with map, intel, planning, SSE tabs |
| `operations/sse/page.tsx` | NEW | General SSE library page |
| `components/operations/world-map.tsx` | NEW | Stylized SVG world map component |

**Total: 6 new files, 1 modified file**

## Design Notes

- Matches existing site aesthetic: `bg-zinc-900/60`, `border-zinc-700/50`, accent color highlights, same fonts
- Classification badges use the same muted palette from Documents Center
- Active operations get a pulsing accent indicator
- World map is a simple SVG — no external mapping library needed
- All data is hardcoded — easy to swap for API calls later
