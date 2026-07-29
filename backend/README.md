# LegacyX Backend

REST API, database, and inheritance-condition/OTC-matching engine for LegacyX. This covers everything in the project brief's "Backend Developer" track: APIs, database, verification logic, and (mocked) Flare integrations. Smart contracts (`contracts/`) and the web UI (`frontend/`) are separate tracks — this service simulates the on-chain effects those will eventually provide (mock tx hashes, vault balances) so the rest of the system already behaves correctly.

## Stack

- **Express + TypeScript** — REST API
- **Prisma + SQLite** — zero-config local database (swap to Postgres for shared/staging, see below)
- **JWT + EIP-191 wallet signatures** — auth (no passwords; you sign in with your wallet)
- **node-cron** — background verification sweep + OTC matching engine
- **Vitest + Supertest** — tests

## Getting started

```bash
cd backend
npm install
cp .env.example .env
npm run prisma:migrate -- --name init   # creates dev.db and applies the schema
npm run seed                            # optional demo data (see prisma/seed.ts)
npm run dev                             # http://localhost:4000
```

Run the test suite (spins up its own `test.db`, independent of your dev database):

```bash
npm test
```

## How the domain maps to the brief

| Brief concept | Implementation |
|---|---|
| "I haven't logged in for 12 months" | `INACTIVITY` condition, checked against `vault.lastHeartbeatAt` + `vault.inactivityDays` by a background sweep (`VERIFICATION_INTERVAL_SECONDS`) |
| "My family provides proof I passed away" / "A legal document is verified" | `MANUAL_APPROVAL` / `LEGAL_DOCUMENT` conditions, marked satisfied via a trusted-verifier endpoint gated by `ADMIN_API_KEY` (stands in for a real death-certificate/legal-document integration) |
| "Two trusted people approve the request" | `MULTI_PARTY_APPROVAL` condition — each approver proves control of their address with a wallet signature, no login required |
| Vault unlock | A vault unlocks the moment **any one** of its conditions is satisfied. `balance` is snapshotted into `unlockedBalance` at that instant, so each beneficiary's payout is fixed regardless of claim order |
| Private OTC marketplace | Off-chain price-time-priority order book + matching engine. The order book never reveals an order's owner, amount-vs-owner correlation, or price origin to anyone but the order's own owner — only the resulting trade (amount/price/tx hash) is public |

Real Flare integrations (FAssets, FDC/attestations for death-certificate-style proofs, actual on-chain settlement) are out of scope here and mocked (`src/utils/mockChain.ts` generates plausible tx hashes) — the API shapes are designed so swapping the mock for a real contract call later doesn't change any endpoint's contract.

## Auth

There's no password login — you sign in with your wallet, SIWE-style:

1. `POST /api/auth/nonce { address }` → `{ message }` (message embeds a fresh one-time nonce)
2. Sign `message` with your wallet (`personal_sign` / `wallet.signMessage(message)`)
3. `POST /api/auth/verify { address, signature }` → `{ token, address }`

Use `Authorization: Bearer <token>` on subsequent requests. The nonce rotates after each successful verify, so a signature can't be replayed for a second session.

Some actions don't need a session at all and instead verify a one-off signature over a fixed message (multi-party condition approval, claim execution) — useful because a beneficiary or approver may never have signed in to LegacyX before.

## API reference

All request/response bodies are JSON. Errors are `{ error: string, details?: unknown }` with an appropriate 4xx/5xx status.

### Auth
| Method & path | Auth | Body | Notes |
|---|---|---|---|
| `POST /api/auth/nonce` | — | `{ address }` | Returns `{ message }` to sign |
| `POST /api/auth/verify` | — | `{ address, signature }` | Returns `{ token, address }` |

### Vaults (all require `Authorization: Bearer <token>`, scoped to the caller as owner)
| Method & path | Body | Notes |
|---|---|---|
| `POST /api/vaults` | `{ name, currency?, inactivityDays? }` | `currency` defaults `FXRP`, `inactivityDays` defaults `365` |
| `GET /api/vaults` | — | Vaults owned by the caller |
| `GET /api/vaults/:id` | — | 403 if you don't own it |
| `POST /api/vaults/:id/deposit` | `{ amount }` | Mock on-chain deposit; records a `VaultTransaction` |
| `POST /api/vaults/:id/withdraw` | `{ amount }` | 400 if `amount > balance` |
| `POST /api/vaults/:id/heartbeat` | — | Resets the inactivity countdown ("I'm still here") |
| `POST /api/vaults/:id/verify` | — | On-demand: re-check this vault's `INACTIVITY` condition now instead of waiting for the next cron tick |
| `POST /api/vaults/:id/simulate-inactivity` | — | **Demo/QA helper.** Backdates the heartbeat past `inactivityDays` so the next verify call unlocks the vault, without waiting out the real window |

### Beneficiaries (nested under a vault, same owner auth)
| Method & path | Body | Notes |
|---|---|---|
| `POST /api/vaults/:id/beneficiaries` | `{ name, address, allocation }` | `allocation` is a percent (0–100]; rejected if it pushes the vault's total over 100% |
| `GET /api/vaults/:id/beneficiaries` | — | |
| `DELETE /api/vaults/:id/beneficiaries/:beneficiaryId` | — | Blocked once the vault has unlocked |

### Inheritance conditions
| Method & path | Auth | Body | Notes |
|---|---|---|---|
| `POST /api/vaults/:id/conditions` | owner | `{ type, config? }` | `type` ∈ `INACTIVITY`, `MANUAL_APPROVAL`, `MULTI_PARTY_APPROVAL`, `LEGAL_DOCUMENT`. `config` required for the latter two — see below |
| `GET /api/vaults/:id/conditions` | owner | — | |
| `POST /api/conditions/:conditionId/approve` | signature | `{ address, signature }` | Only for `MULTI_PARTY_APPROVAL`; `address` must be one of the condition's `approvers` |
| `POST /api/conditions/:conditionId/verify` | `x-admin-key` header | — | Only for `MANUAL_APPROVAL` / `LEGAL_DOCUMENT`; marks satisfied immediately |

`config` shapes:
- `MULTI_PARTY_APPROVAL`: `{ requiredApprovals: number, approvers: string[] }` (≥2 approvers, `requiredApprovals` between 1 and `approvers.length`)
- `LEGAL_DOCUMENT`: `{ documentRef: string }`

Approval signature message: `` Approve inheritance condition ${conditionId} for vault ${vaultId} ``

### Claims
| Method & path | Auth | Body | Notes |
|---|---|---|---|
| `GET /api/claims/:address` | — | — | Everything this address can currently claim across all unlocked vaults |
| `POST /api/claims/:vaultId/:beneficiaryId` | signature | `{ signature }` | 400 if the vault isn't unlocked yet, 409 if already claimed |

Claim signature message: `` Claim inheritance payout from vault ${vaultId} as beneficiary ${beneficiaryId} ``

### Private OTC marketplace
| Method & path | Auth | Body | Notes |
|---|---|---|---|
| `POST /api/otc/orders` | required | `{ side, amount, price, vaultId? }` | `side` ∈ `BUY`, `SELL`. Triggers an immediate matching pass |
| `GET /api/otc/orders` | optional | — | Anonymized order book; pass a token to also see `mine: true`/`ownerAddress` on your own rows |
| `DELETE /api/otc/orders/:id` | required | — | Owner-only, only while `OPEN` |
| `GET /api/otc/trades` | — | — | Settled trades (amount/price/tx hash only — no owner info, ever) |

The matching engine runs price-time priority: best (lowest) open sell crossed against best (highest) open buy, filling the smaller order in full and reducing the larger order's remaining amount, at the earlier-placed order's price. It also runs on a timer (`MATCHING_INTERVAL_SECONDS`) so orders left unmatched still settle eventually.

## Environment variables

See `.env.example`. Notable ones:
- `ADMIN_API_KEY` — shared secret for the trusted-verifier endpoints (`MANUAL_APPROVAL`/`LEGAL_DOCUMENT` verification). Treat like a password; rotate before any real deployment.
- `VERIFICATION_INTERVAL_SECONDS` / `MATCHING_INTERVAL_SECONDS` — background sweep cadence.
- `DATABASE_URL` — `file:./dev.db` by default. For Postgres, change `provider` in `prisma/schema.prisma` to `"postgresql"` and point this at a real instance (the schema deliberately avoids SQLite-only features, and enum-like fields are plain validated strings for the same reason — see the comment at the top of `schema.prisma`).

## Project layout

```
backend/
├── prisma/
│   ├── schema.prisma      # data model
│   ├── migrations/
│   └── seed.ts            # demo data matching the brief's Alice/mother/brother/daughter example
├── src/
│   ├── app.ts             # express app wiring
│   ├── index.ts           # entrypoint: http server + scheduler + graceful shutdown
│   ├── config/env.ts      # validated environment config
│   ├── db/prisma.ts       # PrismaClient singleton
│   ├── jobs/scheduler.ts  # cron: verification sweep + OTC matching
│   ├── middleware/        # auth (JWT/admin-key), validation, error handling
│   ├── routes/ · controllers/ · services/   # one pair per resource (vault, beneficiary, condition, claim, otc, auth)
│   └── utils/             # ApiError, mock tx hashes, signature verification, JWT
└── tests/                 # vitest + supertest, own sqlite db (tests/globalSetup.ts)
```
