import { Wallet } from "ethers";
import request from "supertest";
import { createApp } from "../src/app";

export const app = createApp();

interface SignerWallet {
  address: string;
  signMessage(message: string): Promise<string>;
}

export function randomWallet(): SignerWallet {
  return Wallet.createRandom();
}

export async function signIn(wallet: SignerWallet): Promise<string> {
  const nonceRes = await request(app)
    .post("/api/auth/nonce")
    .send({ address: wallet.address })
    .expect(200);

  const signature = await wallet.signMessage(nonceRes.body.message);

  const verifyRes = await request(app)
    .post("/api/auth/verify")
    .send({ address: wallet.address, signature })
    .expect(200);

  return verifyRes.body.token as string;
}
