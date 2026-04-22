# API vs UI: where modify/upload is still missing

These endpoints are implemented and DB-backed, but the listed UIs still do not call them (or are no-ops).

| Area | File | Gap |
|------|------|-----|
| Admin gallery | [src/app/admin/gallery/gallery-management-client.tsx](../src/app/admin/gallery/gallery-management-client.tsx) | Uses in-memory `mockGalleryItems`; `handleSaveItem`, `handleConfirmDelete`, `saveOrder`, `cancelOrderEdit` do not call `GET/POST /api/gallery`, `PUT/DELETE /api/gallery/[id]`, or `PUT /api/gallery/reorder`. |
| Docs list | [src/components/operations/management/doc-list.tsx](../src/components/operations/management/doc-list.tsx) | Only creates via `POST /api/docs`. No edit/delete UI for `PUT/DELETE /api/docs/[id]`. |
| SSE attachments (management) | [src/components/operations/management/sse-attachment-list.tsx](../src/components/operations/management/sse-attachment-list.tsx) | Only creates via `POST /api/sse`. No UI for `PUT/DELETE /api/sse/[id]` (status/update/delete). |
| Intel block | [src/components/operations/management/intel-block-form.tsx](../src/components/operations/management/intel-block-form.tsx) | Upsert-only via `POST`; no explicit delete/clear flow. |
| Object storage | [src/app/api/object-storage/save-upload-key/route.ts](../src/app/api/object-storage/save-upload-key/route.ts) | `uploadType === "document"` branch is commented out; uploads never persist document metadata to the DB. |
