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

## Live testnet deployment

Deployed and exercised end-to-end on real testnets — not simulated, not local Anvil. Verify any of this directly on-chain.

| Contract | Chain | Address |
|---|---|---|
| `LegacyVaultRelay` | Coston2 | [`0x6aecedc437b6679d7c0f29863db1b059fccaf977`](https://coston2.testnet.flarescan.com/address/0x6aecedc437b6679d7c0f29863db1b059fccaf977) |
| `LegacyVaultRelay` | Base Sepolia | [`0x6aecedc437b6679d7c0f29863db1b059fccaf977`](https://sepolia.basescan.org/address/0x6aecedc437b6679d7c0f29863db1b059fccaf977) (same address — first tx from the deployer on both chains) |
| `LegacyVault` (real FXRP) | Coston2 | [`0xD59dbEa6435cf284E80a2745D43b49c2bD89D795`](https://coston2.testnet.flarescan.com/address/0xD59dbEa6435cf284E80a2745D43b49c2bD89D795) |
| `LegacyVault` (demo asset) | Base Sepolia | [`0xda915D3222Aa0D3fd392Bf746f8ed6FC02ADD6e6`](https://sepolia.basescan.org/address/0xda915D3222Aa0D3fd392Bf746f8ed6FC02ADD6e6) |
| Demo ERC20 asset (`MockERC20`) | Base Sepolia | [`0xD59dbEa6435cf284E80a2745D43b49c2bD89D795`](https://sepolia.basescan.org/address/0xD59dbEa6435cf284E80a2745D43b49c2bD89D795) |
| FXRP (OFT-wrapped) | Coston2 | [`0x0b6A3645c240605887a5532109323A3E12273dc7`](https://coston2.testnet.flarescan.com/address/0x0b6A3645c240605887a5532109323A3E12273dc7) |

Scenario run against those contracts, in order:

1. **Deposit** — 5 real testnet FXRP into the Coston2 vault. [`0x1f6b3c44853ec2e08a473e1484f594485be26103abcee1d031cea997b7f35991`](https://coston2.testnet.flarescan.com/tx/0x1f6b3c44853ec2e08a473e1484f594485be26103abcee1d031cea997b7f35991)
2. **Cross-chain heartbeat sync** — broadcast from Coston2, applied on Base Sepolia purely via the LayerZero message (`HeartbeatSynced` emitted on the destination vault, no local action on that chain).
   Source: [`0x58541c969d5118c8d5fdab49da0031848ca133add233daadb375b8500f8f3194`](https://coston2.testnet.flarescan.com/tx/0x58541c969d5118c8d5fdab49da0031848ca133add233daadb375b8500f8f3194) · Destination: [`0xea3914e62be5ce1812c5679f541e76ba00bb370b20fe600ad035013a089fd736`](https://sepolia.basescan.org/tx/0xea3914e62be5ce1812c5679f541e76ba00bb370b20fe600ad035013a089fd736) · [LayerZero Scan](https://testnet.layerzeroscan.com/tx/0x58541c969d5118c8d5fdab49da0031848ca133add233daadb375b8500f8f3194)
3. **Beneficiary + condition added** — `addBeneficiary` / `addManualApprovalCondition` on the Coston2 vault. [`0xe01ea9b4438fd537649dea6f696302fab80d7e21d294e07080fed181447706b4`](https://coston2.testnet.flarescan.com/tx/0xe01ea9b4438fd537649dea6f696302fab80d7e21d294e07080fed181447706b4) · [`0x2e7195c021a6ea5ea14c35db97913ae3a455791674e82ebdb4a522e65dfdaace`](https://coston2.testnet.flarescan.com/tx/0x2e7195c021a6ea5ea14c35db97913ae3a455791674e82ebdb4a522e65dfdaace)
4. **Trusted-verifier unlock** — the vault unlocks on-chain, snapshotting `unlockedBalance = 5 FXRP`. [`0x8322df761762faf5b5315581492a5678c553066dc62241534a28deee446974b1`](https://coston2.testnet.flarescan.com/tx/0x8322df761762faf5b5315581492a5678c553066dc62241534a28deee446974b1)
5. **Cross-chain unlock sync** — broadcast from Coston2; the Base Sepolia vault's `status()` flips to `UNLOCKED` from the LayerZero message alone.
   Source: [`0x07f5b6ad9eab48f2556f9daad5d9a127171e611e87aef2008ea80e4ae4817eb2`](https://coston2.testnet.flarescan.com/tx/0x07f5b6ad9eab48f2556f9daad5d9a127171e611e87aef2008ea80e4ae4817eb2) · Destination: [`0x94a4c81949031ea9fdba5452eabd4cd62ced77a27d949b5c2dbaed7a3c7e5d7b`](https://sepolia.basescan.org/tx/0x94a4c81949031ea9fdba5452eabd4cd62ced77a27d949b5c2dbaed7a3c7e5d7b)
6. **Claim** — the beneficiary claims their share and receives the real FXRP. [`0x2b52d32c529076cc172617ebb971cb7c4bef668845f2edaa214a8fd719666384`](https://coston2.testnet.flarescan.com/tx/0x2b52d32c529076cc172617ebb971cb7c4bef668845f2edaa214a8fd719666384)

Base Sepolia was used for the relay/sync demo rather than a live cross-chain claim, since FXRP's LayerZero OFT is only deployed on Coston2 and Hyperliquid Testnet (not Base Sepolia) as of this writing — cross-chain claim bridging is proven instead by `test/CrossChainRelay.t.sol` and `test/LegacyVault.t.sol`.

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

## Backend integration status

The backend (`backend/`) links a vault to a deployed contract via `POST /api/vaults/:id/link-chain` and, once linked, submits the inactivity sweep, trusted-verifier attestation, and multi-party approval relay as real transactions (see `backend/src/chain/` and `backend/README.md`'s "Chain integration" section) — that's exactly the mechanism exercised in the live deployment above. Deposit/withdraw/heartbeat/claim remain owner/beneficiary wallet-signed actions and are not backend-executed; the frontend still calls the backend's off-chain simulation for those until it's wired to sign transactions directly against `LegacyVault`.

## Not yet wired up

- No mainnet deployment config — testnets only, matching the hackathon/MVP scope in the top-level README.
