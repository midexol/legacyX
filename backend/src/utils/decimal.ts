// Decimal-safe helpers for amounts/prices transported as strings (per
// frontend/API_CONTRACT.md: "parse them server-side with a decimal-safe
// method, not parseFloat"). Values are scaled into BigInt fixed-point for
// arithmetic/comparison so we never lose precision to float rounding.
// Used by the public marketplace module (src/services/marketplace.service.ts)
// — the existing OtcOrder/OtcTrade model elsewhere still uses Float, unrelated.

const DECIMAL_STRING_RE = /^\d+(\.\d+)?$/;
const SCALE = 18;
const SCALE_FACTOR = 10n ** BigInt(SCALE);

export function isDecimalString(value: unknown): value is string {
  return typeof value === "string" && DECIMAL_STRING_RE.test(value);
}

export function toFixedPoint(value: string): bigint {
  const [whole, frac = ""] = value.split(".");
  const paddedFrac = (frac + "0".repeat(SCALE)).slice(0, SCALE);
  return BigInt(whole) * SCALE_FACTOR + BigInt(paddedFrac || "0");
}

export function isPositiveDecimalString(value: unknown): value is string {
  return isDecimalString(value) && toFixedPoint(value) > 0n;
}

export function compareDecimalStrings(a: string, b: string): number {
  const fa = toFixedPoint(a);
  const fb = toFixedPoint(b);
  if (fa === fb) return 0;
  return fa > fb ? 1 : -1;
}

const BUCKETS: Array<{ max: string | null; label: string }> = [
  { max: "100", label: "0-100" },
  { max: "500", label: "100-500" },
  { max: "1000", label: "500-1000" },
  { max: null, label: "1000+" },
];

export function bucketAmount(amount: string): string {
  for (const bucket of BUCKETS) {
    if (bucket.max === null || compareDecimalStrings(amount, bucket.max) <= 0) {
      return bucket.label;
    }
  }
  return "1000+";
}
