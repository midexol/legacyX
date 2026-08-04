# LegacyX OTC Marketplace — API Contract

This is the spec the frontend (`src/lib/api.js`, `src/pages/Marketplace.jsx`) is built against.
Implement these endpoints in whatever stack you're using — the frontend only needs the request/response
shapes below to match exactly.

**Base URL:** the frontend reads `VITE_API_BASE_URL` from a `.env` file (see `.env.example`). Point that
at wherever this API is deployed. Until it's set, the frontend runs on local mock data automatically —
you don't need a backend running for the frontend to work while you build this.

All responses are JSON. All endpoints are prefixed with `/api`.

---

## Core privacy rule (read this first)

The whole pitch of this marketplace is that trade details stay private. That means:

- **`GET /api/orders` must NEVER return a wallet address, exact amount, or exact price.**
  Amounts come back bucketed into a range (see below). Prices aren't returned at all on this endpoint.
- Only `GET /api/orders/mine` (a user looking at *their own* orders) returns full, unredacted detail.
- How you actually enforce "only the owner can see their own order" is up to your auth approach — at
  minimum, verify the requester controls the wallet address they're asking about (e.g. a signed message
  challenge). Don't just trust an `address` query param with no verification in production — that's fine
  as a placeholder for now, but flag it before this goes anywhere real.

---

## `GET /api/orders`

Public. No auth required. Returns the active trades list shown on the Marketplace page.

**Response 200:**
```json
[
  {
    "id": "LX-8821",
    "asset": "FXRP",
    "amountRange": "100-500",
    "status": "matched",
    "createdAt": 1735689600000
  }
]
```

- `id` — string, your format, frontend just displays it as-is
- `asset` — one of `"FXRP" | "FLR" | "C2FLR"`
- `amountRange` — string bucket, not an exact number. Suggested buckets: `"0-100"`, `"100-500"`,
  `"500-1000"`, `"1000+"` — but use whatever bucketing makes sense for real volume once you see it
- `status` — one of `"pending" | "matched" | "settled" | "cancelled"`
- `createdAt` — unix ms timestamp

Sort order doesn't matter — the frontend sorts by `createdAt` descending itself.

---

## `GET /api/stats`

Public. No auth required. Powers the three stat cards at the top of the Marketplace page.

**Response 200:**
```json
{
  "priceUsd": 0.5214,
  "volume24hUsd": 284000,
  "tradesSettled": 142
}
```

---

## `POST /api/orders`

Creates a new sell listing. Requires a connected wallet on the frontend (the UI already gates this —
the form doesn't render at all unless `isConnected` is true), but you should still validate server-side.

**Request body:**
```json
{
  "asset": "FXRP",
  "amount": "500",
  "minPrice": "0.52",
  "sellerAddress": "0x9F2a...44Cb"
}
```

- `amount` and `minPrice` are sent as strings (not numbers) to avoid float precision issues — parse them
  server-side with a decimal-safe method, not `parseFloat`.
- `sellerAddress` is sent as-is for now. See the privacy note above about verifying this properly before
  production — right now nothing stops someone from submitting an address they don't control.

**Response 201:**
```json
{
  "id": "LX-8826",
  "asset": "FXRP",
  "amountRange": "100-500",
  "status": "pending",
  "createdAt": 1735689700000
}
```

Return the same redacted shape as `GET /api/orders` — the frontend doesn't need the full order back,
just enough to add it to the list optimistically.

**Response 400** (validation failure):
```json
{ "error": "amount must be greater than 0" }
```

The frontend surfaces this `error` string directly in a toast, so keep it short and human-readable.

---

## `GET /api/orders/mine?address=0x...`

Returns the connected wallet's own orders, **unredacted** (full amount, full price, buyer address once
matched). This is the one endpoint allowed to return real numbers and addresses, and only for the
order's owner.

**Response 200:**
```json
[
  {
    "id": "LX-8821",
    "asset": "FXRP",
    "amount": "500",
    "minPrice": "0.52",
    "matchedPrice": "0.54",
    "buyerAddress": "0x71C...9e2",
    "status": "matched",
    "createdAt": 1735689600000,
    "updatedAt": 1735689900000
  }
]
```

The frontend doesn't call this endpoint yet (no "My Orders" view exists in the UI currently), but the
client function (`fetchMyOrders`) is already wired up and ready for whenever that view gets built.

---

## `GET /api/settlements`

Public. No auth required. Powers the "Recent Settlements" table. Same redaction rules as `GET /api/orders` —
no wallet addresses or exact amounts/prices, only what's genuinely meant to be public (the tx hash and
that a settlement occurred).

**Response 200:**
```json
[
  { "hash": "0x4a2f...c31e", "asset": "FXRP", "amountRange": "100-500", "settledAt": 1735689600000 }
]
```

- `hash` — the on-chain transaction hash, this one *is* meant to be public (that's the "public settlement,
  private details" pitch — anyone can verify a settlement happened on-chain, nobody can see who or how much)
- `amountRange` — same bucketing as `/api/orders`

---

## Things intentionally left open for you to decide

- **Matching logic** — how/when a `pending` order becomes `matched` isn't specified here; that's your
  system's job, not the frontend's concern. The frontend just polls/refetches `GET /api/orders`.
- **Settlement** — whether/how a matched trade actually moves funds (on-chain, escrow, manual) is
  entirely a backend/contract decision not reflected in this contract yet.
- **Auth** — wallet-signature-based auth is the obvious fit given this is a Web3 app, but that's your
  call on implementation. Whatever you choose, `sellerAddress` in `POST /api/orders` and the `address`
  param in `GET /api/orders/mine` are the two places that need real verification before production.
