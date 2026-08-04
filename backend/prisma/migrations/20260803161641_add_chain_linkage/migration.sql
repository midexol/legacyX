-- AlterTable
ALTER TABLE "inheritance_conditions" ADD COLUMN "onChainId" INTEGER;

-- AlterTable
ALTER TABLE "vaults" ADD COLUMN "chainId" INTEGER;
ALTER TABLE "vaults" ADD COLUMN "contractAddress" TEXT;
