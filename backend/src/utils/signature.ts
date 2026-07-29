import { verifyMessage } from "ethers";

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
