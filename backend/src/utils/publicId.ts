// Maps an order's internal auto-increment sequence to the "LX-XXXX" id shape
// used throughout API_CONTRACT.md. Purely cosmetic — no lookup ever needs to
// go the other direction (no endpoint takes an order id as input).
const OFFSET = 8820;

export function toPublicOrderId(seq: number): string {
  return `LX-${OFFSET + seq}`;
}
