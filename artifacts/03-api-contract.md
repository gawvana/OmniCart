# OMNICART AI 2.0 — API CONTRACT SPECIFICATION & MATRIX
**Artifact ID:** `03-api-contract.md`  
**Execution Phase:** Phase 14 & Phase 21 (API Contracts & DTOs)  
**Standardized Error Envelope:**
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable explanation",
    "request_id": "optional-correlation-uuid"
  }
}
```

---

## Complete Frontend <-> Backend Contract Matrix

| Feature | Frontend Method | Frontend Path | Backend Route | Method | Request Body / Params | Response DTO (Bidirectional) | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Auth** | `authApi.verify` | `/auth/verify` & `/auth/me` | `/api/v1/auth/me` | `GET` | Header: `X-Telegram-Init-Data` | `User` (`id`, `telegram_user_id`, `first_name`) | **MATCHED** |
| **Lists** | `listsApi.getAll` | `/lists` | `/api/v1/lists/` | `GET` | — | `ShoppingList[]` (`id`, `name`, `emoji`, `items_count`) | **MATCHED** |
| **Lists** | `listsApi.getById`| `/lists/{id}` | `/api/v1/lists/{list_id}` | `GET` | Path: `list_id` | `ShoppingList` (`id`, `name`, `emoji`, `color`) | **MATCHED** |
| **Lists** | `listsApi.create` | `/lists` | `/api/v1/lists/` | `POST`| `{ name, emoji, color }` | `ShoppingList` | **MATCHED** |
| **Lists** | `listsApi.update` | `/lists/{id}` | `/api/v1/lists/{list_id}` | `PATCH`| Partial `{ name, emoji, color }` | `ShoppingList` | **MATCHED** |
| **Lists** | `listsApi.delete` | `/lists/{id}` | `/api/v1/lists/{list_id}` | `DELETE`| Path: `list_id` | `204 No Content` / `{ status: "deleted" }` | **MATCHED** |
| **Items** | `itemsApi.getByList` | `/items/{listId}` | `/api/v1/items/{list_id}` | `GET` | Query: `include_purchased` | `ShoppingItem[]` (`id`, `listId`/`list_id`, `isPurchased`/`is_purchased`, `price`, `notes`) | **MATCHED** |
| **Items** | `itemsApi.create` | `/items/{listId}` | `/api/v1/items/{list_id}` | `POST`| `{ name, quantity, unit, price, notes }` | `ShoppingItem` (both casing schemas) | **MATCHED** |
| **Items** | `itemsApi.purchase` | `/items/{id}/purchase` | `/api/v1/items/{item_id}/purchase` | `POST`| Path: `item_id` | `ShoppingItem` (`is_purchased=true`, budget deducted) | **MATCHED** |
| **Items** | `itemsApi.update` | `/items/{id}` | `/api/v1/items/{item_id}` | `PATCH`| Partial `{ name, quantity, is_purchased }` | `ShoppingItem` | **MATCHED** |
| **Items** | `itemsApi.delete` | `/items/{id}` | `/api/v1/items/{item_id}` | `DELETE`| Path: `item_id` | `{ success: true }` | **MATCHED** |
| **Items** | `itemsApi.bulkCreate`| `/items/{listId}/bulk` | `/api/v1/items/{list_id}/bulk` | `POST`| `{ items: [...] }` | `ShoppingItem[]` | **MATCHED** |
| **Budget**| `budgetApi.get` | `/budget` | `/api/v1/budget/` | `GET` | Query: `period` | `Budget` (`amount`, `spent`, `currency`) | **MATCHED** |
| **Budget**| `budgetApi.set` | `/budget` | `/api/v1/budget/` | `POST`| `{ amount, currency, period }` | `Budget` | **MATCHED** |
| **History**| `historyApi.get`| `/history` | `/api/v1/history/` | `GET` | Query: `cursor`, `limit` | `{ items: PurchaseHistory[], next_cursor, has_more }` | **MATCHED** |
| **Family**| `familyApi.get` | `/family` | `/api/v1/family/` | `GET` | — | `Family[]` (`id`, `name`, `members_count`) | **MATCHED** |
| **Family**| `familyApi.create`| `/family` | `/api/v1/family/` | `POST`| `{ name }` | `Family` | **MATCHED** |
| **Family**| `familyApi.invite`| `/family/{id}/invites`| `/api/v1/family/{family_id}/invites` | `POST`| Path: `family_id` | `FamilyInvite` (`token`, `expires_at`) | **MATCHED** |
| **Family**| `familyApi.join` | `/family/join` | `/api/v1/family/join` | `POST`| `{ token }` | `FamilyMember` (atomic CAS consumed) | **MATCHED** |
| **Health**| Browser/Probe | `/health/live` | `/health/live` | `GET` | — | `{ status: "alive" }` | **MATCHED** |
| **Health**| DevOps/Probe | `/health/ready` | `/health/ready` | `GET` | — | `{ status: "ready", database: "ok", redis: "ok" }` | **MATCHED** |
| **Bot**   | Telegram Hook | `/api/v1/bot/webhook` | `/api/v1/bot/webhook` | `POST`| Header: `X-Telegram-Bot-Api-Secret-Token` | `{ status: "ok" }` | **MATCHED** |
