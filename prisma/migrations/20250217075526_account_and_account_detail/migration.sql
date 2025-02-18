-- CreateTable
CREATE TABLE "account" (
    "id" SERIAL NOT NULL,
    "type" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_account_detail_id" INTEGER,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_detail" (
    "id" SERIAL NOT NULL,
    "prev_balance" INTEGER NOT NULL,
    "change_amount" INTEGER NOT NULL,
    "new_balance" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "account_id" INTEGER NOT NULL,

    CONSTRAINT "account_detail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_last_account_detail_id_key" ON "account"("last_account_detail_id");

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_last_account_detail_id_fkey" FOREIGN KEY ("last_account_detail_id") REFERENCES "account_detail"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_detail" ADD CONSTRAINT "account_detail_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
