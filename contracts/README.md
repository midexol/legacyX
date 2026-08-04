# LegacyX Contracts

Solidity smart contracts for LegacyX's digital-will vaults, built with [Foundry](https://book.getfoundry.sh/). This is genuinely multichain: the same `LegacyVault` deploys identically on every supported chain, and a LayerZero-powered relay keeps an owner's whole multichain estate in sync from a single action.

## Stack

- **Solidity 0.8.24**, Foundry (forge/cast)
- **OpenZeppelin Contracts** — `Ownable`, `SafeERC20`, `ReentrancyGuard`, `ECDSA`
- **LayerZero V2** (`@layerzerolabs/lz-evm-oapp-v2`) — cross-chain messaging (`LegacyVaultRelay`) and the OFT standard (`IOFT`) that lets claims bridge directly to a beneficiary's own chain
- Target chains: **Flare Coston2** (primary — FXRP is deployed there as a LayerZero OFT Adapter) plus a second EVM testnet (Base Sepolia by default) to prove the cross-chain path

## Contracts

| Contract | Purpose |
|---|---|
| `LegacyVault.sol` | One owner's vault for one deposited asset on one chain: deposits/withdrawals, beneficiaries (address + home chain + bps allocation), inheritance conditions (`INACTIVITY`, `MANUAL_APPROVAL`, `MULTI_PARTY_APPROVAL`, `LEGAL_DOCUMENT`), unlock, and claims. Mirrors `backend/prisma/schema.prisma` field-for-field. |
| `LegacyVaultRelay.sol` | A LayerZero OApp, one per chain, wired to its siblings as peers. An owner pings their heartbeat or gets a condition verified on **one** chain; the relay rebroadcasts that fact to every other chain where they registered a vault, so the whole estate updates without repeating the action per chain. |
| `OtcSettlement.sol` | Single-chain escrow + atomic settlement for the private OTC desk. Matching stays off-chain (see `backend/src/services/matching.service.ts`); this is only the "final settlement" step. |

### Why cross-chain claims work

The deposited asset must be a LayerZero OFT (or wrapped by an OFT adapter). When a beneficiary's registered home chain differs from the vault's chain, `claim()` calls the asset's `IOFT.send()` to bridge the payout directly to them — one transaction, no manual bridging step. FXRP is already deployed this way (OFT Adapter `0xCd3d2127935Ae82Af54Fc31cCD9D3440dbF46639` on Coston2, per the [Flare dev hub](https://dev.flare.network/fxrp/oft)), which is what makes this pattern viable for the MVP asset.

### Why the relay exists

Condition indices and vault addresses are local to each chain, so the relay never tries to sync a specific `conditionId` across chains — it only ever conveys two owner-scoped facts: "heartbeat at time T" and "this estate is now unlockable." Every `LegacyVault` self-registers with its chain's relay on deployment (`registerVault`), so the relay always knows which local vaults belong to which owner.

## Setup

```bash
cd contracts
npm install         # pulls OpenZeppelin, LayerZero, forge-std as npm packages (see foundry.toml remappings)
forge build
forge test
```

First compile is slow (LayerZero's test-mock suite is large under `via_ir`); it's cached after that.

## Local testing

- `test/LegacyVault.t.sol` — deposits, beneficiaries, all four condition types, unlock, claims (single chain).
- `test/OtcSettlement.t.sol` — escrow, atomic settlement, replay protection.
- `test/CrossChainRelay.t.sol` — uses LayerZero's `TestHelperOz5` to simulate two wired endpoints and proves a heartbeat/unlock broadcast on chain A actually updates a sibling vault on chain B.

## Deploying

```bash
cp .env.example .env   # fill in RPCs, LayerZero endpoint addresses/eids, asset addresses
source .env
```

Per chain, in order:

```bash
# 1. Deploy the relay
LZ_ENDPOINT=$LZ_ENDPOINT_FLARE_COSTON2 \
  forge script script/DeployRelay.s.sol --rpc-url flare_coston2 --broadcast

# 2. Deploy the vault, pointing it at that chain's relay
ASSET=$ASSET_FLARE_COSTON2 LOCAL_EID=$LZ_EID_FLARE_COSTON2 RELAY=<relayFromStep1> \
  VAULT_OWNER=$VAULT_OWNER TRUSTED_VERIFIER=$TRUSTED_VERIFIER \
  forge script script/DeployVault.s.sol --rpc-url flare_coston2 --broadcast
```

Repeat both steps for each additional chain, then wire every pair of relays together (once per direction):

```bash
LOCAL_RELAY=<relayOnA> REMOTE_EID=<eidB> REMOTE_RELAY=<relayOnB> \
  forge script script/WirePeers.s.sol --rpc-url flare_coston2 --broadcast

LOCAL_RELAY=<relayOnB> REMOTE_EID=<eidA> REMOTE_RELAY=<relayOnA> \
  forge script script/WirePeers.s.sol --rpc-url base_sepolia --broadcast
```

OTC settlement is deployed independently per chain:

```bash
ASSET=$ASSET_FLARE_COSTON2 OTC_QUOTE_TOKEN=$OTC_QUOTE_TOKEN OTC_MATCHER=$OTC_MATCHER \
  forge script script/DeployOtcSettlement.s.sol --rpc-url flare_coston2 --broadcast
```

**Verify LayerZero endpoint addresses and eids before deploying** — they aren't hardcoded here. Check https://docs.layerzero.network/v2/deployments/deployed-contracts for the current values for whichever chains you target.

## Not yet wired up

- The backend (`backend/`) still simulates on-chain effects via `mockChain.ts`; pointing it at these deployed contracts (via ethers/viem calls in the service layer) is a follow-up integration step.
- No mainnet deployment config — testnets only, matching the hackathon/MVP scope in the top-level README.
