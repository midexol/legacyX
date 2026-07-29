import { randomBytes } from "crypto";
import { prisma } from "../db/prisma";
import { ApiError } from "../utils/ApiError";
import { isEvmAddress } from "../utils/mockChain";
import { verifySignedMessage } from "../utils/signature";
import { signSessionToken } from "../utils/jwt";

function buildNonce(): string {
  return randomBytes(16).toString("hex");
}

export function buildSignInMessage(address: string, nonce: string): string {
  return [
    "Sign in to LegacyX",
    "",
    `Address: ${address}`,
    `Nonce: ${nonce}`,
  ].join("\n");
}

export async function requestNonce(address: string) {
  if (!isEvmAddress(address)) {
    throw ApiError.badRequest("address must be a valid EVM address (0x-prefixed, 40 hex chars)");
  }

  const nonce = buildNonce();
  const user = await prisma.user.upsert({
    where: { address },
    update: { nonce },
    create: { address, nonce },
  });

  return { message: buildSignInMessage(address, user.nonce) };
}

export async function verifyAndIssueSession(address: string, signature: string) {
  if (!isEvmAddress(address)) {
    throw ApiError.badRequest("address must be a valid EVM address (0x-prefixed, 40 hex chars)");
  }

  const user = await prisma.user.findUnique({ where: { address } });
  if (!user) {
    throw ApiError.badRequest("No nonce requested for this address yet. Call /auth/nonce first.");
  }

  const message = buildSignInMessage(address, user.nonce);
  const isValid = verifySignedMessage(message, signature, address);
  if (!isValid) {
    throw ApiError.unauthorized("Signature does not match the requested nonce for this address");
  }

  // Rotate the nonce so the signature can't be replayed for a second session.
  const refreshed = await prisma.user.update({
    where: { id: user.id },
    data: { nonce: buildNonce() },
  });

  const token = signSessionToken({ sub: refreshed.id, address: refreshed.address });
  return { token, address: refreshed.address };
}
