import { Prisma, PrismaClient } from "@prisma/client";
import { CreateAccountDetailEntity } from "./CreateAccountDetailEntity";
import { AccountDetail as DAccountDetail } from "./AccountDetail";

interface IAccountDetail {
    id: number;
    created_at: Date;
    updated_at: Date;
    prev_account_detail_id: number;
    account_id: number;
    change_amount: number;
    new_balance: number;
    prev_balance: number;
}

interface IAccount {
    id: number;
    type: number;
    created_at: Date;
    updated_at: Date;
    last_account_detail_id: number;
}

export async function purchase(
  accountId: number,
  changeAmount: number,
  prisma: PrismaClient
) {
  await prisma.$transaction(
    async (tx) => {
      const [account] = await tx.$queryRaw<
        IAccount[]
      >(
        Prisma.sql`
          select a.*
          from account a
          where a.id = ${accountId}
          for update;
          `
      );
      if (account === null || account === undefined) {
          throw new Error("Account not found");
      }

      const prevAccountDetail = await tx.accountDetail.findFirst({
          where: {id: account.last_account_detail_id}
      })

      // 타임아웃이 발생할 듯
      if (prevAccountDetail === null || prevAccountDetail === undefined) {
        throw new Error("not found account detail");
      }

      const prevDetail = new DAccountDetail(
        prevAccountDetail.accountId,
        prevAccountDetail.newBalance,
        prevAccountDetail.id
      );
      const newDetail = prevDetail.use(changeAmount);

      const createEntity = CreateAccountDetailEntity.of(prevDetail, newDetail);
      const lastAccountDetail = await tx.accountDetail.create({
        data: createEntity,
      });

      await tx.account.update({
        where: { id: accountId },
        data: { lastAccountDetailId: lastAccountDetail.id },
      });
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted }
  );
}
