-- CreateTable
CREATE TABLE "otc_orders" (
    "seq" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "asset" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "minPrice" TEXT NOT NULL,
    "sellerAddress" TEXT NOT NULL,
    "buyerAddress" TEXT,
    "matchedPrice" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "matchedAt" DATETIME
);

-- CreateTable
CREATE TABLE "otc_settlements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderSeq" INTEGER NOT NULL,
    "asset" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "settledAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "otc_settlements_orderSeq_fkey" FOREIGN KEY ("orderSeq") REFERENCES "otc_orders" ("seq") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "market_stats" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "priceUsd" REAL NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "otc_settlements_orderSeq_key" ON "otc_settlements"("orderSeq");
