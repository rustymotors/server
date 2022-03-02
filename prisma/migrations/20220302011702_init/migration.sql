-- CreateTable
CREATE TABLE "Session" (
    "customer_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sessionkey" TEXT NOT NULL,
    "skey" TEXT NOT NULL,
    "context_id" TEXT NOT NULL,
    "connection_id" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_customer_id_key" ON "Session"("customer_id");
