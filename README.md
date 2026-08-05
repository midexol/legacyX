# LegacyX

**A digital will for crypto — secure, on-chain inheritance for your digital assets, built on Flare.**

LegacyX lets you lock your crypto into a Legacy Vault, name your beneficiaries, and define the conditions under which your assets are released — so nothing is ever lost to a forgotten password or an unrecoverable private key. When the vault unlocks, beneficiaries can keep their inheritance or sell it privately through LegacyX's built-in OTC marketplace, without exposing their wallet, amount, or identity on a public exchange.

---

## The Problem

If you own crypto and something happens to you — death, accident, or long-term disappearance — no one can access it. Unlike a bank account, there is usually no "next of kin" process for crypto: only you know your private keys. As a result, billions of dollars in cryptocurrency have been lost forever because owners died without ever sharing access.

## The Solution

LegacyX turns that one-way door into a plan:

1. **Deposit** — Lock your assets (e.g. FXRP) into a secure Legacy Vault smart contract.
2. **Choose Beneficiaries** — Assign wallet addresses and percentage splits (e.g. 50% to a parent, 30% to a sibling, 20% to a child).
3. **Set Inheritance Conditions** — Define how the vault should verify you're gone: inactivity period, proof of death, multi-party approval, or verified legal documentation.
4. **Verification** — When a condition is met (simulated for the hackathon; extensible to real-world data sources via Flare in the future), the vault unlocks.
5. **Claim** — The smart contract automatically distributes assets to beneficiaries. No lawyer, no exchange, no bank — everything happens on-chain.
6. **Sell Privately (optional)** — Beneficiaries can sell inherited assets through a private OTC marketplace instead of a public exchange, keeping the buyer, seller, amount, and price confidential. Only the final settlement is recorded on-chain.

## Why It's Different

LegacyX combines four familiar concepts into one on-chain platform:

| Familiar Service | LegacyX Equivalent |
|---|---|
| Bank safe deposit box | Legacy Vault (secure asset storage) |
| Legal will | Beneficiary rules & inheritance conditions |
| Escrow service | Condition verification & automated release |
| Private investment desk | Private OTC marketplace for beneficiaries |

## Example

**Without LegacyX:** John owns 50 BTC and unexpectedly dies. No one knows his wallet password. The coins are lost forever.

**With LegacyX:** John creates a Legacy Vault and names his wife and son as beneficiaries. After 12 months of inactivity and verified inheritance conditions, the vault unlocks — his wife receives 25 BTC and his son receives 25 BTC. Nothing is lost. If his wife later wants to sell, she can do so privately, without exposing her wallet or trade size to the public.

---

## MVP Features

- ✅ Connect Wallet
- ✅ Deposit FXRP
- ✅ Create an Inheritance Vault
- ✅ Add Beneficiaries
- ✅ Set Inheritance Conditions (inactivity timer or manual approval for the demo)
- ✅ Claim Inherited Assets
- ✅ Private OTC Sell Option

## Tech Stack

- **Smart Contracts:** Solidity (Foundry), multichain — Flare Coston2 Testnet primary, plus additional EVM testnets bridged via LayerZero V2 so an owner's vaults across chains stay in sync and beneficiaries can claim on their own chain
- **Backend:** Express + TypeScript REST APIs, Prisma + Postgres database, verification logic (Flare service integrations, mocked where needed for the hackathon), wired to the contracts above for the actions a third party can legitimately sign — deployable to Render via `render.yaml`
- **Frontend:** Vite + React web app with wallet integration, dashboard, vault creation flow, unlock demo, and the private OTC marketplace UI
- **Design:** Figma prototype, UI/UX

## Repository Structure

```
legacyX/
├── render.yaml    # Render Blueprint: deploys backend/ + a managed Postgres together
├── contracts/     # Legacy Vault & OTC smart contracts, deployment scripts, tests
├── backend/       # REST APIs, database, verification & Flare integrations
├── frontend/      # Vite + React web app (wallet connect, dashboard, vault, OTC UI)
│   └── API_CONTRACT.md   # source of truth for the backend's public Marketplace API shapes
├── design/        # Figma exports, branding, user flows
└── docs/          # Documentation, pitch deck, demo materials
```

*(`backend/` and `contracts/` are implemented — see [backend/README.md](backend/README.md) and [contracts/README.md](contracts/README.md). `design/` and `docs/` will be populated as those tracks land.)*

## How It Works — Architecture

1. **User deposits assets** into the Legacy Vault smart contract and configures beneficiaries + inheritance conditions.
2. **Verification layer** monitors/receives proof that a condition has been met (inactivity, death certificate, multi-party approval).
3. **Vault contract releases funds** proportionally to each beneficiary's wallet once conditions are satisfied.
4. **Private OTC contract** lets a beneficiary list inherited assets for sale; a matching engine pairs buyer and seller off-chain, and only the final trade settles on-chain.

## Getting Started

```bash
git clone https://github.com/midexol/legacyX.git
cd legacyX

# Frontend (Vite + React)
npm install --prefix frontend
cp frontend/.env.example frontend/.env   # set VITE_API_BASE_URL to use the real backend
npm run dev:frontend

# Backend (Express + Prisma API) — needs a reachable Postgres database,
# local or a free Render instance (see backend/README.md)
npm run install:backend
cp backend/.env.example backend/.env   # then set DATABASE_URL to your Postgres connection string
npm run --prefix backend prisma:migrate -- --name init
npm run --prefix backend seed
npm run dev:backend

# Or run both together:
npm run dev:all
```

The backend listens on `http://localhost:4000` by default (see `backend/.env.example`) and expects the frontend at `http://localhost:5173` (Vite's default). Leaving `VITE_API_BASE_URL` unset runs the frontend's Marketplace page entirely on local mock data — no backend required. Full API reference, Render deployment steps, and design notes: [backend/README.md](backend/README.md).

## Team

Built for a hackathon by a 5-person team covering smart contracts, backend, frontend, UI/UX design, and project management/QA.

## Roadmap

- [ ] Legacy Vault smart contract (deposits, beneficiaries, withdrawals)
- [x] Inheritance condition verification (simulated → real-world data via Flare) — backend REST API + background sweep, see [backend/README.md](backend/README.md)
- [x] Beneficiary claim flow — backend API (signature-verified lookup + claim)
- [x] Private OTC marketplace contract + matching — backend off-chain matching engine (on-chain settlement contract still pending)
- [x] Public Marketplace API (`GET/POST /api/orders`, `/api/stats`, `/api/settlements`) matching `frontend/API_CONTRACT.md` — the shape the current Vite frontend's Marketplace page actually calls, separate from the `/api/otc/*` engine above (see backend/README.md's "Public Marketplace API" section for why there are two)
- [x] Render Blueprint for backend hosting (`render.yaml`, Postgres-backed) — ready to deploy, not yet confirmed against a live instance (see "Deploying to Render" in [backend/README.md](backend/README.md))
- [ ] Testnet deployment (Flare Coston2)
- [ ] Demo & hackathon submission

## Disclaimer

This project is a hackathon prototype. Smart contracts are unaudited and inheritance conditions are simulated for demonstration purposes — do not use with real funds in production without a full security audit.
