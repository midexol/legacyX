import { getBytes, solidityPackedKeccak256, verifyMessage } from "ethers";

// Verifies an EIP-191 personal_sign signature (what wallet.signMessage / the
// eth_sign JSON-RPC method and every wallet SDK produce) recovers to the
// expected address. Pure crypto — no chain/RPC access needed.
export function verifySignedMessage(message: string, signature: string, expectedAddress: string): boolean {
  try {
    const recovered = verifyMessage(message, signature);
    return recovered.toLowerCase() === expectedAddress.toLowerCase();
  } catch {
    return false;
  }
}

// Matches contracts/src/LegacyVault.sol#approveCondition's expected digest
// exactly (abi.encodePacked + toEthSignedMessageHash), so a signature
// collected here can be relayed on-chain and independently re-verified by
// the contract itself. This is a different message than
// verifySignedMessage's plain-string approval — chain-linked conditions must
// be signed as raw bytes over this digest (e.g. wallet.signMessage(digest)
// with ethers, where digest is a Uint8Array/BytesLike, not a string).
export function verifyOnChainApprovalSignature(
  onChainConditionId: number,
  vaultContractAddress: string,
  signature: string,
  expectedAddress: string
): boolean {
  try {
    const digest = solidityPackedKeccak256(
      ["string", "uint256", "string", "address"],
      ["Approve inheritance condition ", onChainConditionId, " for vault ", vaultContractAddress]
    );
    const recovered = verifyMessage(getBytes(digest), signature);
    return recovered.toLowerCase() === expectedAddress.toLowerCase();
  } catch {
    return false;
  }
}
