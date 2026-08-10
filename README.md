# LegacyX — On-Chain Inheritance & Private OTC Engine on Flare Network

**A non-custodial, programmable digital estate & inheritance protocol built natively on Flare.**

LegacyX ensures your digital assets (`FXRP`, `FLR`, and cross-chain tokens) are never lost to forgotten keys or unexpected life events. By combining **Flare Data Connector (FDC)** attestations, **Flare Time Series Oracle (FTSO v2)** pricing, **FAssets/LayerZero OFT** cross-chain transfers, and a **Private OTC Settlement Desk**, LegacyX provides automated, trustless inheritance distribution and confidential asset liquidation.

---

## 🌟 Executive Summary

Over **$30 Billion** in cryptocurrency is permanently trapped in inaccessible wallets due to missing private keys, sudden incapacitation, or deceased owners with no digital estate plan. Traditional legal wills cannot execute on-chain transfers, while central exchanges require custodial surrender of funds.

**LegacyX solves this with a non-custodial, smart contract protocol on Flare Network:**
1. **Deposit & Lock** — Lock assets (e.g. `FXRP`) into a personal, non-custodial `LegacyVault.sol` contract on Flare.
2. **Configure Beneficiaries** — Assign wallet addresses or email notifications with exact percentage allocations.
3. **Multi-Factor Conditions** — Set customizable unlock rules: Inactivity Heartbeat, Guardian Multi-Party Approval, or FDC-verified Evidence.
4. **Automated Verification & Release** — When verified on-chain, assets are distributed directly to beneficiaries without intermediaries.
5. **Private OTC Liquidation** — Beneficiaries can privately liquidate inherited `FXRP` into cash-equivalent stablecoins without market slippage or public order book exposure.

---

## 🔥 How LegacyX Uses the Flare Stack

LegacyX is designed from the ground up to leverage Flare's native interoperability, data verification, and oracle infrastructure.

```
                  ┌──────────────────────────────────────────────────────────┐
                  │                 LegacyX Web Frontend                     │
                  └──────────────┬────────────────────────────┬──────────────┘
                                 │ EIP-1193 / Web3            │ FTSO v2 Feed Query
                                 ▼                            ▼
┌──────────────────────────────────────────────────┐  ┌──────────────────────┐
│           Flare C-Chain (Coston2 Testnet)        │  │   Flare FTSO v2      │
│                                                  │  │ (Sub-second Oracle)  │
│  ┌───────────────────┐    ┌───────────────────┐  │  └──────────┬───────────┘
│  │  LegacyVault.sol  │───>│ LegacyVaultRelay  │  │             │
│  └─────────┬─────────┘    └─────────┬─────────┘  │             │ Price Feeds
│            │                        │            │             ▼
│            │ FDC Evidence           │ LayerZero  │  ┌──────────────────────┐
│            ▼ Attestations           ▼ V2 OApp    │  │  USD Estate Valuation│
│  ┌───────────────────┐    ┌───────────────────┐  │  └──────────────────────┘
│  │ Flare Data Conn.  │    │  Remote EVM Chains│  │
│  │     (FDC / SC)    │    │   (Base, etc.)    │  │
│  └───────────────────┘    └───────────────────┘  │
└──────────────────────────────────────────────────┘
```

### 1. **Flare Network (Primary Execution & Storage Layer)**
- **Chain ID:** `114` (Coston2 Testnet) / `14` (Flare Mainnet)
- All `LegacyVault.sol`, `LegacyVaultRelay.sol`, and `OtcSettlement.sol` contracts run natively on Flare C-Chain, benefitting from EVM compatibility, fast block finality, and low gas fees.

### 2. **FXRP & FAssets (LayerZero OFT Standard)**
- `FXRP` is the primary collateral asset used in LegacyX vaults.
- Leverages Flare's **FAssets** system and **LayerZero OFT (Omnichain Fungible Token) Adapter** (`0x0b6A3645c240605887a5532109323A3E12273dc7` on Coston2).
- Enables **Cross-Chain Claim Bridging**: When a beneficiary's home chain is outside Flare (e.g. Arbitrum, Base, Ethereum), calling `claim()` triggers `IOFT.send()` to automatically bridge the payout to their native chain without manual cross-chain bridging steps.

### 3. **Flare Data Connector (FDC) / State Connector**
- Gated evidence verification engine for `LEGAL_DOCUMENT` and `PROOF_OF_DEATH` conditions.
- Uses Flare's decentralized attestation protocol to verify off-chain evidence payloads (hash of legal document, death certificate attestation) and submit cryptographic proofs directly into `LegacyVault.sol` to trigger automated unlocks.

### 4. **Flare Time Series Oracle (FTSO v2)**
- Provides sub-second, decentralized price feeds for `FXRP/USD`, `FLR/USD`, and `C2FLR/USD`.
- Powers real-time estate portfolio valuation across the user dashboard, beneficiary breakdown screens, and the Private OTC Desk.

### 5. **LayerZero V2 Cross-Chain Relay (`LegacyVaultRelay.sol`)**
- A LayerZero V2 `OApp` deployed on Flare Coston2 that anchors multi-chain estate management.
- When an owner sends an on-chain heartbeat (`pingHeartbeat`) or triggers a vault unlock on Flare, `LegacyVaultRelay` broadcasts a cross-chain message to sync sibling vaults on secondary chains, keeping an owner's global estate in sync from a single transaction.

### 6. **Private OTC Desk (`OtcSettlement.sol`)**
- Non-custodial settlement smart contract deployed on Flare Coston2.
- Pairs with an off-chain price-time-priority matching engine to execute atomic token swaps (`FXRP` ↔ `USDC/FLR`) confidentially, protecting beneficiaries from public order book tracking.

---

## 🔄 End-to-End Data Flow (App to Flare Stack)

```mermaid
sequenceDiagram
    autonumber
    actor Owner as Vault Owner
    participant App as Frontend (Vite/React)
    participant API as Backend (Express/Prisma)
    participant FTSO as Flare FTSO v2
    participant FDC as Flare Data Connector
    participant Vault as LegacyVault.sol (Flare)
    participant Relay as LegacyVaultRelay.sol
    actor Bene as Beneficiary

    Note over Owner, Vault: 1. Vault Creation & FXRP Deposit
    Owner->>App: Connect Wallet (Coston2)
    App->>FTSO: Query FXRP/USD Price Feed
    FTSO-->>App: Return Real-Time Exchange Rate ($0.52 USD)
    Owner->>Vault: deposit() + deposit FXRP (OFT)
    Vault->>Relay: registerVault(owner)

    Note over Owner, Relay: 2. Heartbeat Maintenance & Relay Sync
    Owner->>Vault: pingHeartbeat()
    Vault->>Vault: Reset lastPingTimestamp
    Vault->>Relay: broadcastHeartbeat()
    Relay-->>RemoteChains: LayerZero V2 Msg (Sync Heartbeat to Base Sepolia)

    Note over API, Vault: 3. Verification & FDC Attestation
    API->>API: Background Verification Sweep (Cron)
    API->>FDC: Request Attestation Verification (Document Hash / Inactivity)
    FDC-->>Vault: Submit Verified Proof / Attestation
    Vault->>Vault: verifyCondition() -> State = UNLOCKED

    Note over Bene, Vault: 4. Claim & Cross-Chain Payout
    Bene->>App: Connect Beneficiary Wallet
    Bene->>Vault: claim(beneficiaryAddress)
    alt Beneficiary on Flare
        Vault->>Bene: Transfer FXRP directly on Coston2
    else Beneficiary on Remote Chain (e.g. Base)
        Vault->>Vault: Call IOFT(FXRP).send()
        Vault-->>Bene: Auto-bridge FXRP to Remote Chain
    end

    Note over Bene, Vault: 5. Private OTC Settlement
    Bene->>App: List FXRP on OTC Desk
    API->>API: Off-Chain Order Matching Engine
    API->>OtcSettlement: executeTrade(buyer, seller, amount, price)
    OtcSettlement->>Bene: Atomic Transfer USDC / Cash Value
```

---

## 📊 Technical Data Flow Breakdown

| Data Flow Stage | Initiator | Flare Stack Component | Description |
|---|---|---|---|
| **1. Valuation & Pricing** | Frontend / Backend | **Flare FTSO v2** | Queries sub-second decentralized `FXRP/USD` oracle price feeds to display real-time estate values and beneficiary allocations. |
| **2. Vault Deployment & Deposit** | Web3 Wallet | **Flare C-Chain RPC (Coston2)** | Interacts with `LegacyVault.sol` to lock `FXRP` tokens non-custodially into the smart contract. |
| **3. Heartbeat & Multi-Chain Sync** | Vault Owner | **`LegacyVaultRelay.sol` + LayerZero V2** | Sending `pingHeartbeat()` on Flare broadcasts a cross-chain message to update sibling vaults on secondary EVM chains. |
| **4. External Data Verification** | Backend / Verifier | **Flare Data Connector (FDC)** | Verifies off-chain evidence payloads (legal doc hashes, death attestations) and submits proofs to `LegacyVault.sol`. |
| **5. Automated Unlock** | Smart Contract | **Flare C-Chain Event Bus** | Flips vault status to `UNLOCKED`, snapshots `unlockedBalance`, and emits `VaultUnlocked` on-chain event. |
| **6. Cross-Chain Claim** | Beneficiary Wallet | **FXRP FAsset / LayerZero OFT** | Calls `claim()`. If beneficiary is on another chain, `IOFT.send()` bridges `FXRP` directly to their home chain. |
| **7. Private OTC Swap** | OTC Desk Engine | **`OtcSettlement.sol` (Coston2)** | Executes atomic non-custodial settlement between buyer and seller without public order book exposure. |

---

## 📜 Smart Contracts & Live Testnet Deployments

All contracts are compiled with Solidity `0.8.24` and deployed on **Flare Coston2 Testnet** (Chain ID 114) and Base Sepolia.

| Contract | Network | Address / Explorer Link | Details |
|---|---|---|---|
| **`LegacyVaultRelay`** | Flare Coston2 | [`0x6aecedc437b6679d7c0f29863db1b059fccaf977`](https://coston2.testnet.flarescan.com/address/0x6aecedc437b6679d7c0f29863db1b059fccaf977) | LayerZero V2 OApp Relay for multi-chain estate sync. |
| **`LegacyVault` (Real FXRP)** | Flare Coston2 | [`0xD59dbEa6435cf284E80a2745D43b49c2bD89D795`](https://coston2.testnet.flarescan.com/address/0xD59dbEa6435cf284E80a2745D43b49c2bD89D795) | Main vault contract holding testnet `FXRP`. |
| **`LegacyVault` (Integration Demo)** | Flare Coston2 | [`0x8Bb5CEE03FE7B51767459F944971949c5BC43E89`](https://coston2.testnet.flarescan.com/address/0x8Bb5CEE03FE7B51767459F944971949c5BC43E89) | Pre-funded demo vault for backend automated verification testing. |
| **`FXRP` (OFT Adapter)** | Flare Coston2 | [`0x0b6A3645c240605887a5532109323A3E12273dc7`](https://coston2.testnet.flarescan.com/address/0x0b6A3645c240605887a5532109323A3E12273dc7) | Official LayerZero-wrapped FXRP FAsset on Coston2. |
| **`LegacyVaultRelay`** | Base Sepolia | [`0x6aecedc437b6679d7c0f29863db1b059fccaf977`](https://sepolia.basescan.org/address/0x6aecedc437b6679d7c0f29863db1b059fccaf977) | Secondary chain relay peer. |
| **`LegacyVault` (Demo ERC20)** | Base Sepolia | [`0xda915D3222Aa0D3fd392Bf746f8ed6FC02ADD6e6`](https://sepolia.basescan.org/address/0xda915D3222Aa0D3fd392Bf746f8ed6FC02ADD6e6) | Cross-chain destination vault test. |

### Verified On-Chain Transactions (Flare Coston2):
1. **Deposit 5 FXRP into Vault:** [`0x1f6b3c44853ec2e08a473e1484f594485be26103abcee1d031cea997b7f35991`](https://coston2.testnet.flarescan.com/tx/0x1f6b3c44853ec2e08a473e1484f594485be26103abcee1d031cea997b7f35991)
2. **Cross-Chain Heartbeat Relay:** [`0x58541c969d5118c8d5fdab49da0031848ca133add233daadb375b8500f8f3194`](https://coston2.testnet.flarescan.com/tx/0x58541c969d5118c8d5fdab49da0031848ca133add233daadb375b8500f8f3194) · [LayerZero Scan](https://testnet.layerzeroscan.com/tx/0x58541c969d5118c8d5fdab49da0031848ca133add233daadb375b8500f8f3194)
3. **Beneficiary & Condition Addition:** [`0xe01ea9b4438fd537649dea6f696302fab80d7e21d294e07080fed181447706b4`](https://coston2.testnet.flarescan.com/tx/0xe01ea9b4438fd537649dea6f696302fab80d7e21d294e07080fed181447706b4)
4. **On-Chain Vault Unlock:** [`0x8322df761762faf5b5315581492a5678c553066dc62241534a28deee446974b1`](https://coston2.testnet.flarescan.com/tx/0x8322df761762faf5b5315581492a5678c553066dc62241534a28deee446974b1)
5. **Beneficiary Claim Execution:** [`0x2b52d32c529076cc172617ebb971cb7c4bef668845f2edaa214a8fd719666384`](https://coston2.testnet.flarescan.com/tx/0x2b52d32c529076cc172617ebb971cb7c4bef668845f2edaa214a8fd719666384)

---

## 🛠️ Repository Structure

```
legacyX/
├── vercel.json           # Single-Page Application (SPA) rewrite rules for Vercel deployment
├── contracts/            # Solidity smart contracts (Foundry), scripts, tests & LZ V2 OApp
│   ├── src/
│   │   ├── LegacyVault.sol       # Core vault contract (deposits, conditions, claims)
│   │   ├── LegacyVaultRelay.sol  # LayerZero V2 cross-chain state synchronization
│   │   └── OtcSettlement.sol     # Non-custodial OTC settlement desk
│   └── test/                     # Foundry test suite (Single chain & LZ cross-chain)
├── backend/              # Node.js + Express + Prisma REST API & Verification Engine
│   ├── prisma/           # Database schema & migrations
│   └── src/              # Auth (EIP-191), verification cron, OTC matching engine
├── frontend/             # Vite + React Web Application
│   ├── src/              # Wallet provider, interactive vault creator, unlock demo, OTC UI
│   └── vercel.json       # Frontend deployment rules
└── render.yaml           # Blueprint for backend + Postgres database deployment
```

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- **Node.js**: `v18+` or `v20+`
- **Foundry**: Installed via `foundryup` (for contract development)
- **Postgres**: Local PostgreSQL instance or free cloud database (e.g. Render/Neon)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/midexol/legacyX.git
cd legacyX

# Install Frontend
npm install --prefix frontend

# Install Backend
npm install --prefix backend

# Install Contracts
cd contracts && npm install && cd ..
```

### 2. Run Application Locally

#### Option A: Frontend Only (Mock Mode)
```bash
npm run dev:frontend
```
*Access frontend at `http://localhost:5173`. Uses local state & mock data — no backend required.*

#### Option B: Full Stack (Frontend + Backend)
```bash
# 1. Configure Backend Environment
cp backend/.env.example backend/.env
# Edit backend/.env and set DATABASE_URL="postgresql://user:pass@localhost:5432/legacyx"

# 2. Initialize Database & Seed
npm run --prefix backend prisma:migrate -- --name init
npm run --prefix backend seed

# 3. Start Both Services
npm run dev:all
```

---

## 🛡️ Security & Disclaimer

This software is a hackathon prototype developed for demonstration on the **Flare Coston2 Testnet**. Smart contracts have not undergone a formal security audit. Do not deploy to mainnet with real funds without conducting a comprehensive third-party audit.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.
