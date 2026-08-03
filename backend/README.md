# LegacyX Backend

REST API for the **Private OTC Marketplace** — the one piece of LegacyX that actually needs a backend.
Vault creation, beneficiaries, inheritance conditions, and claims are handled entirely client-side by the
frontend (wallet + `localStorage` — see `frontend/src/components/wallet/VaultDataProvider.jsx`), so this
service doesn't model any of that.

The contract this API implements is **`frontend/API_CONTRACT.md`** — that file is the source of truth for
every request/response shape below. If the two ever disagree, the contract wins and this README is stale.

## Stack

- **Express + TypeScript** — REST API
- **Prisma + SQLite** — zero-config local database (swap to Postgres for shared/staging, see below)
- **node-cron** — background sweep: simulated OTC matching/settlement + a simulated market price tick
- **Vitest + Supertest** — tests

## Getting started

```bash
cd backend
npm install
cp .env.example .env
npm run prisma:migrate -- --name init   # creates dev.db and applies the schema
npm run dev                             # http://localhost:4000
```

Point the frontend at it by setting `VITE_API_BASE_URL=http://localhost:4000` in `frontend/.env` (copy from
`frontend/.env.example`). Until that's set, the frontend runs entirely on local mock data.

Run the test suite (spins up its own `test.db`, independent of your dev database):

```bash
npm test
```

## Endpoints

All responses are JSON, all prefixed with `/api`. Errors are `{ error: string }` with a 4xx/5xx status.

| Method & path | Auth | Notes |
|---|---|---|
| `GET /api/orders` | — | Public, **redacted** order book. No address, exact amount, or price — only a bucketed `amountRange`. |
| `POST /api/orders` | — | Creates a sell listing: `{ asset, amount, minPrice, sellerAddress }` (amount/minPrice as decimal **strings**). Returns the redacted shape, `201`. |
| `GET /api/orders/mine?address=0x...` | — | Full, unredacted detail for that address's own orders (seller or matched buyer). |
| `GET /api/stats` | — | `{ priceUsd, volume24hUsd, tradesSettled }` for the stats row. |
| `GET /api/settlements` | — | Public, redacted settlement history: `{ hash, asset, amountRange, settledAt }`. |

**Auth note (flagged in the contract, not fixed here):** `sellerAddress` on `POST /api/orders` and `address`
on `GET /api/orders/mine` are trusted as-is — nothing verifies the caller actually controls that wallet.
That's an explicitly-allowed placeholder for the hackathon; before this goes anywhere real, gate both behind
proof of address ownership (e.g. a signed-message challenge).

## How matching/settlement works

The contract deliberately leaves this open ("that's your system's job, not the frontend's concern") — there's
no real counterparty liquidity or on-chain settlement to integrate here. Instead, a background sweep
(`src/services/matching.service.ts`, cadence `MATCHING_INTERVAL_SECONDS`) simulates it:

1. A `pending` order older than `OTC_MATCH_DELAY_MS` "finds a buyer" — assigned a mock buyer address and a
   `matchedPrice` at or above the seller's `minPrice` — and becomes `matched`.
2. A `matched` order older than `OTC_SETTLE_DELAY_MS` "settles on-chain" — a settlement record is created
   with a mock tx hash (`src/utils/mockChain.ts`) — and becomes `settled`.

The frontend just polls `GET /api/orders` every 15s and sees the status move along on its own.

`GET /api/stats`'s `priceUsd` is nudged by a small bounded random walk on the same sweep tick (no real
Flare/FTSO price feed integration — out of scope for the hackathon, see `src/services/stats.service.ts`).
`volume24hUsd` and `tradesSettled` are computed live from settlement records, so they start at `0` and grow
for real as orders actually settle — no seed/fake data.

## Decimal safety

`amount`/`minPrice`/`matchedPrice` are stored and validated as **strings**, never parsed with `parseFloat`
(per the contract). `src/utils/decimal.ts` validates the format and does comparisons/bucketing via
BigInt fixed-point arithmetic, so there's no float precision loss anywhere real money math happens. The
one exception is `volume24hUsd` in `GET /api/stats`, which is a display-only aggregate, not a ledger.

## Environment variables

See `.env.example`:
- `DATABASE_URL` — `file:./dev.db` by default. For Postgres, change `provider` in `prisma/schema.prisma`.
- `MATCHING_INTERVAL_SECONDS` — how often the background sweep runs.
- `OTC_MATCH_DELAY_MS` / `OTC_SETTLE_DELAY_MS` — simulated delay before pending→matched and matched→settled.
  Lower these for faster demos.
- `FRONTEND_ORIGIN` — CORS origin, defaults to Vite's dev server (`http://localhost:5173`).

## Project layout

```
backend/
├── prisma/
│   ├── schema.prisma      # OtcOrder / OtcSettlement / MarketStat
│   └── migrations/
├── src/
│   ├── app.ts             # express app wiring
│   ├── index.ts           # entrypoint: http server + scheduler + graceful shutdown
│   ├── config/env.ts      # validated environment config
│   ├── db/prisma.ts       # PrismaClient singleton
│   ├── jobs/scheduler.ts  # cron: matching sweep + price tick
│   ├── controllers/ · routes/ · services/   # orders, stats, settlements
│   └── utils/             # ApiError, decimal-safe math, mock tx/address, public id mapping
└── tests/                 # vitest + supertest, own sqlite db (tests/globalSetup.ts)
```
