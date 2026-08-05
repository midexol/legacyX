# LegacyX Backend

REST API, database, and inheritance-condition/OTC-matching engine for LegacyX. This covers everything in the project brief's "Backend Developer" track: APIs, database, verification logic, and (mocked) Flare integrations. Smart contracts (`contracts/`) and the web UI (`frontend/`) are separate tracks — this service simulates the on-chain effects those will eventually provide (mock tx hashes, vault balances) so the rest of the system already behaves correctly.

## Stack

- **Express + TypeScript** — REST API
- **Prisma + Postgres** — database (Render-managed in production, see "Deploying to Render" below)
- **JWT + EIP-191 wallet signatures** — auth (no passwords; you sign in with your wallet)
- **node-cron** — background verification sweep, OTC matching engine, and public marketplace simulation
- **Vitest + Supertest** — tests

## Getting started

You need a reachable Postgres database — either a local instance or a free one from Render (dashboard ->
New -> PostgreSQL, then copy the "External Database URL").

```bash
cd backend
npm install
cp .env.example .env        # then set DATABASE_URL to your Postgres connection string
npm run prisma:migrate -- --name init   # applies the schema
npm run seed                            # optional demo data (see prisma/seed.ts)
npm run dev                             # http://localhost:4000
```

Run the test suite — it needs its **own** dedicated Postgres database (never point it at dev/production; see
`tests/globalSetup.ts`, which fully resets whatever `TEST_DATABASE_URL` points to before every run):

```bash
echo 'TEST_DATABASE_URL="postgresql://user:password@localhost:5432/legacyx_test?schema=public"' > .env.test
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
| `POST /api/vaults/:id/link-chain` | `{ chainId, contractAddress }` | Links this vault to a real `LegacyVault` contract you deployed yourself (see `contracts/`). Verifies the contract's on-chain `owner()` matches your wallet before accepting the link. Once linked, the inactivity sweep and trusted-verifier attestation act on the real contract instead of local bookkeeping — see "Chain integration" below |

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
| `POST /api/vaults/:id/conditions/:conditionId/link-chain` | owner | `{ onChainId }` | Links this condition to its counterpart index in the linked contract's `conditions` array (vault must already be chain-linked). Rejects a mismatched condition type |
| `POST /api/conditions/:conditionId/approve` | signature | `{ address, signature }` | Only for `MULTI_PARTY_APPROVAL`; `address` must be one of the condition's `approvers`. **Message format depends on whether the condition is chain-linked** — see below |
| `POST /api/conditions/:conditionId/verify` | `x-admin-key` header | — | Only for `MANUAL_APPROVAL` / `LEGAL_DOCUMENT`; marks satisfied immediately (and, if chain-linked, submits the attestation on-chain first) |

`config` shapes:
- `MULTI_PARTY_APPROVAL`: `{ requiredApprovals: number, approvers: string[] }` (≥2 approvers, `requiredApprovals` between 1 and `approvers.length`)
- `LEGAL_DOCUMENT`: `{ documentRef: string }`

## Chain integration

Vaults are pure off-chain simulation (`src/utils/mockChain.ts`) until the owner deploys a real `LegacyVault` (see [contracts/README.md](../contracts/README.md)) and links it with `POST /api/vaults/:id/link-chain`. Deposit/withdraw/heartbeat/claim stay wallet-signed by the user and are **not** wired up here — the backend only ever signs the actions `LegacyVault.sol` itself lets a third party submit:

| Action | Contract call | Signed by |
|---|---|---|
| Inactivity sweep (`POST /api/vaults/:id/verify`, or the background cron) | `checkInactivity` | `OPERATOR_PRIVATE_KEY` |
| Multi-party approval relay (`POST /api/conditions/:conditionId/approve`) | `approveCondition` | `OPERATOR_PRIVATE_KEY` (the approver signs; the backend just relays) |
| Trusted-verifier attestation (`POST /api/conditions/:conditionId/verify`) | `verifyByTrustedVerifier` | `TRUSTED_VERIFIER_PRIVATE_KEY` |

For a chain-linked `MULTI_PARTY_APPROVAL` condition, the approver must sign the **on-chain digest** (`keccak256(abi.encodePacked("Approve inheritance condition ", conditionId, " for vault ", address(this)))`, signed as raw bytes) rather than the plain off-chain string — the same signature gets relayed straight into the contract, which re-verifies it independently. See `verifyOnChainApprovalSignature` in `src/utils/signature.ts`.

Configure with `RPC_URL_BY_CHAIN_ID`, `OPERATOR_PRIVATE_KEY`, and `TRUSTED_VERIFIER_PRIVATE_KEY` in `.env` — see `.env.example`.

### Ready-to-use Coston2 example

A `LegacyVault` is already deployed and pre-populated on Coston2 specifically to exercise this integration end-to-end — see [contracts/README.md](../contracts/README.md) for the full list of live contracts. To drive it from this backend:

1. Set `RPC_URL_BY_CHAIN_ID={"114":"https://coston2-api.flare.network/ext/C/rpc"}`, and your own `OPERATOR_PRIVATE_KEY` / `TRUSTED_VERIFIER_PRIVATE_KEY` (funded with a little C2FLR for gas — this vault's on-chain `trustedVerifier` is `0x54e5850b45B1Da9468Fd5faB1e85F3F7f01aB67C`, so `TRUSTED_VERIFIER_PRIVATE_KEY` must correspond to that address for `verifyByTrustedVerifier` to succeed).
2. Sign in as the vault's on-chain owner (`0x012B1d830D98b09A5e16F30c4bd7323eA2511730`) via the normal `/api/auth` flow — `link-chain` checks `owner()` against your session's wallet.
3. `POST /api/vaults` to create a DB row, then `POST /api/vaults/:id/link-chain` with `{ "chainId": 114, "contractAddress": "0x8Bb5CEE03FE7B51767459F944971949c5BC43E89" }`.
4. `POST /api/vaults/:id/conditions` with `{ "type": "INACTIVITY" }`, then `POST /api/vaults/:id/conditions/:conditionId/link-chain` with `{ "onChainId": 0 }` — this vault already has an on-chain `INACTIVITY` condition at index 0 (and `inactivityDays = 0`, so it's immediately elapsed).
5. `POST /api/vaults/:id/verify` — this submits a **real on-chain `checkInactivity` transaction** signed by your `OPERATOR_PRIVATE_KEY`, which unlocks the vault (it already holds 1 FXRP and has a beneficiary at `0x54e5850b45B1Da9468Fd5faB1e85F3F7f01aB67C`, 100% allocation). Check the resulting tx hash on [Coston2's explorer](https://coston2.testnet.flarescan.com/address/0x8Bb5CEE03FE7B51767459F944971949c5BC43E89).

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

### Public Marketplace API

A **second, separate** OTC-shaped system from the one above. `frontend/API_CONTRACT.md` is the spec the
current Vite frontend's Marketplace page is actually built against (`frontend/src/lib/api.js`,
`frontend/src/pages/Marketplace.jsx`) — and it doesn't call any of the `/api/otc/*` endpoints described
above. Rather than retrofit those (auth-required, BUY/SELL crossing book) to match a public, unauth'd,
sell-only contract shape, this is a small, additive module living alongside it. **Reconciling or retiring
one of the two is a product decision for the team, not something this backend track should resolve alone**
— see the comment at the top of `prisma/schema.prisma`.

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
proof of address ownership — the existing `/api/auth` wallet-signature flow above could be reused for this
once the frontend is ready to send a token here.

**Matching/settlement** is simulated the same way as the `/api/otc/*` engine, just contract-shaped: a
`pending` order older than `MARKETPLACE_MATCH_DELAY_MS` "finds a buyer" (mock buyer address, a `matchedPrice`
at or above the seller's `minPrice`) and becomes `matched`; a `matched` order older than
`MARKETPLACE_SETTLE_DELAY_MS` "settles on-chain" (a settlement record with a mock tx hash) and becomes
`settled`. Runs on the same cron tick as the OTC matching engine (`src/jobs/scheduler.ts`). `amount`/
`minPrice`/`matchedPrice` are decimal **strings**, validated and compared via BigInt fixed-point arithmetic
(`src/utils/decimal.ts`) rather than `parseFloat`, per the contract. `GET /api/stats`'s `priceUsd` is nudged
by a small bounded random walk on the same tick (no real Flare/FTSO price feed integration); `volume24hUsd`
and `tradesSettled` are computed live from settlement records, so a fresh database starts at `0` — no seed/
fake data.

## Environment variables

See `.env.example`. Notable ones:
- `ADMIN_API_KEY` — shared secret for the trusted-verifier endpoints (`MANUAL_APPROVAL`/`LEGAL_DOCUMENT` verification). Treat like a password; rotate before any real deployment.
- `DATABASE_URL` — Postgres connection string. Local dev, tests (as `TEST_DATABASE_URL`), and production each point at a *different* database.
- `VERIFICATION_INTERVAL_SECONDS` / `MATCHING_INTERVAL_SECONDS` — background sweep cadence (shared by the verification sweep, `/api/otc/*` matching, and the public marketplace sweep).
- `MARKETPLACE_MATCH_DELAY_MS` / `MARKETPLACE_SETTLE_DELAY_MS` — simulated delay before the public marketplace's pending→matched and matched→settled transitions. Lower for faster demos.
- `RPC_URL_BY_CHAIN_ID` / `OPERATOR_PRIVATE_KEY` / `TRUSTED_VERIFIER_PRIVATE_KEY` — optional chain integration, see "Chain integration" above.

## Deploying to Render

`render.yaml` at the repo root is a [Render Blueprint](https://render.com/docs/blueprint-spec) that provisions
this API as a Web Service plus a managed Postgres database, wired together automatically. Only the backend is
deployed this way — the frontend is client-side and can be hosted anywhere (or run locally) pointing
`VITE_API_BASE_URL` at this service.

1. Push this repo to GitHub (Render deploys from a git remote).
2. Render dashboard → **New** → **Blueprint** → select the repo. Render reads `render.yaml` and shows a
   preview of the `legacyx-backend` web service + `legacyx-db` Postgres database it's about to create.
   `JWT_SECRET` and `ADMIN_API_KEY` are auto-generated by Render (`generateValue: true`) — you don't set
   those yourself.
3. Apply. Render provisions the database first, then builds and starts the web service. The build runs
   `npm install && npm run build` (`postinstall` runs `prisma generate`); the start command runs
   `npx prisma migrate deploy` (applying `prisma/migrations/` to the fresh database) before `npm start`.
4. Once your frontend is deployed somewhere, set `FRONTEND_ORIGIN` on the `legacyx-backend` service (Render
   dashboard → service → Environment) to that origin — it's left blank in `render.yaml` (`sync: false`)
   since it's not known until the frontend has a URL. Without this, the browser's CORS preflight to
   `/api/*` will fail from the deployed frontend.
5. **Optional — chain integration:** `RPC_URL_BY_CHAIN_ID`, `OPERATOR_PRIVATE_KEY`, and
   `TRUSTED_VERIFIER_PRIVATE_KEY` are left unset (`sync: false`) by the Blueprint. Leave them unset to keep
   every vault on the pure off-chain simulation, or fill them in via the dashboard (never commit real keys)
   if you want this deployed instance to actually sign transactions against the live Coston2/Base Sepolia
   contracts — see "Chain integration" above.
6. Grab the service's `.onrender.com` URL and set it as `VITE_API_BASE_URL` wherever the frontend runs.

**Confirmed working on a live deploy** (`https://legacyx.onrender.com`, 2026-08-05): `prisma migrate deploy`
applied cleanly against a real Postgres instance, and `/health`, `/api/orders`, `/api/stats`, and
`/api/settlements` all responded correctly against it. One real bug surfaced and got fixed in the process:
plain `npm install` was silently skipping `@types/*` devDependencies with `NODE_ENV=production` set, breaking
the `tsc` build — hence `--include=dev` in `buildCommand` above. If you hit `tsc`/type-related build failures
that don't reproduce locally, that's the first thing to check.

Free-tier notes: the web service spins down after 15 minutes of inactivity (the first request after that
takes about a minute to wake it back up — the caller sees a loading page, not a fast response), and Render's
free Postgres databases expire 30 days after creation (with a 14-day grace period before actual deletion) —
recreate the Blueprint's database resource (or upgrade the plan) before then if you want this to stay up
long-term.

## Project layout

```
backend/
├── (repo root) render.yaml   # Render Blueprint: web service + managed Postgres
├── prisma/
│   ├── schema.prisma      # data model — see the comment above OtcOrder/MarketplaceOrder for why there are two OTC-shaped systems
│   ├── migrations/
│   └── seed.ts            # demo data matching the brief's Alice/mother/brother/daughter example
├── src/
│   ├── app.ts             # express app wiring
│   ├── index.ts           # entrypoint: http server + scheduler + graceful shutdown
│   ├── chain/              # LegacyVault contract client (RPC, ABI) for chain-linked vaults
│   ├── config/env.ts      # validated environment config
│   ├── db/prisma.ts       # PrismaClient singleton
│   ├── jobs/scheduler.ts  # cron: verification sweep + OTC matching + marketplace sweep
│   ├── middleware/        # auth (JWT/admin-key), validation, error handling
│   ├── routes/ · controllers/ · services/   # one pair per resource (vault, beneficiary, condition, claim, otc, auth, orders/stats/settlements)
│   └── utils/             # ApiError, mock tx/address, signature verification, JWT, decimal-safe math, public id mapping
└── tests/                 # vitest + supertest, own dedicated Postgres db (tests/globalSetup.ts)
```
