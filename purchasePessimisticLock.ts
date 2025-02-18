import { Prisma, PrismaClient } from "@prisma/client";
import { CreateAccountDetailEntity } from "./CreateAccountDetailEntity";
import { AccountDetail as DAccountDetail } from "./AccountDetail";

export async function purchase(
  accountId: number,
  changeAmount: number,
  prisma: PrismaClient
) {
  await prisma.$transaction(
    async (tx) => {
      const [prevAccountDetail] = await tx.$queryRaw<
        {
          id: number;
          created_at: Date;
          updated_at: Date;
          prev_account_detail_id: number;
          account_id: number;
          change_amount: number;
          new_balance: number;
          prev_balance: number;
        }[]
      >(
        Prisma.sql`
          select ad.*
          from account_detail as ad
          where id = (select last_account_detail_id from account where id = ${accountId})
          for update;
          `
      );
      // 타임아웃이 발생할 듯
      if (prevAccountDetail === null || prevAccountDetail === undefined) {
        throw new Error("not found account detail");
      }

      const prevDetail = new DAccountDetail(
        prevAccountDetail.account_id,
        prevAccountDetail.new_balance,
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
