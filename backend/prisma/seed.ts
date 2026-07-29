import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Mirrors the walkthrough example from the project brief: Alice deposits
// 100 FXRP and splits it 50/30/20 across her mother, brother, and daughter,
// released after 365 days of inactivity.
async function main() {
  const aliceAddress = "0xccba68fe253c2506717a9bcba1f6ebbcfaa50230";

  const alice = await prisma.user.upsert({
    where: { address: aliceAddress },
    update: {},
    create: { address: aliceAddress, nonce: "seed-nonce" },
  });

  const vault = await prisma.vault.create({
    data: {
      ownerId: alice.id,
      name: "Alice's Family Heritage Vault",
      currency: "FXRP",
      balance: 100,
      beneficiaries: {
        create: [
          { name: "Alice's Mother", address: "0x33b25b680a5ae63ea7cc4865fe4b0b9890117259", allocationBps: 5000 },
          { name: "Alice's Brother", address: "0xf03f03ec94c6e22c667c40f3749da4a0f5f76b37", allocationBps: 3000 },
          { name: "Alice's Daughter", address: "0x11e2e23b75e524c1f6a3a045893d6f6c1a132a38", allocationBps: 2000 },
        ],
      },
      conditions: {
        create: [{ type: "INACTIVITY", config: "{}" }],
      },
      transactions: {
        create: [{ type: "DEPOSIT", amount: 100, txHash: "0xseed0000000000000000000000000000000000000000000000000000000000" }],
      },
    },
  });

  console.log(`Seeded vault ${vault.id} for owner ${alice.address}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
