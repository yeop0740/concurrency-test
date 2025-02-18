import { AccountDetail, Prisma, PrismaClient } from "@prisma/client";
import { CreateAccountDetailEntity } from "./CreateAccountDetailEntity";
import { CreateAccountEntity } from "./CreateAccountEntity";
import { purchase as purchasePessimisticLock } from "./purchasePessimisticLock";

describe("purchasePessimisticLock2 는", () => {
  const prisma = new PrismaClient();

  beforeAll(() => {
    prisma.$connect();
  });

  beforeEach(async () => {
    // 데이터베이스 정리
    // 여기서는 AccountDetail -> Account 순으로 삭제한다. sequence 도 다음 insert 를 위해 초기화한다.
    await prisma.accountDetail.deleteMany();
    await prisma.account.deleteMany();
    await prisma.$queryRaw`select setval('account_id_seq', 1, false)`;
    await prisma.$queryRaw`select setval('account_detail_id_seq', 1, false)`;
  });

  afterAll(() => {
    prisma.$disconnect();
  });

  it("한 번의 구매에 대해서 처음 금액에서 사용한 만큼 감소시킨 양이 account detail 에 저장된다.", async () => {
    // given
    const initBalance = 100;
    const changeAmount = 10;
    // type 이 1인 계좌 생성(currency 의 한 종류라고 생각)
    const newAccountEntity = new CreateAccountEntity(1);
    const createdAccount = await prisma.account.create({
      data: newAccountEntity,
    });

    //  기본 계좌 내역 생성(잔액이 100 만큼 있음)
    const newAccountDetailEntity = new CreateAccountDetailEntity(
      0,
      0,
      initBalance,
      createdAccount.id
    );
    await prisma.accountDetail.create({
      data: newAccountDetailEntity,
    });

    for (let i = 0; i < 5; i++) {
      await purchasePessimisticLock(createdAccount.id, changeAmount, prisma);
    }

    const rr = await prisma.accountDetail.findFirst({
      orderBy: { createdAt: Prisma.SortOrder.desc },
    });
    if (rr === null) {
      throw new Error("not found account detail");
    }
    console.log("rr:", rr);

    // when
    await prisma.$transaction(
      async (tx) => {
        const [lastAccountDetail] = await tx.$queryRaw<
          { id: number; new_balance: number }[]
        >(
          Prisma.sql`
            SELECT ad.*
            FROM account_detail AS ad
            WHERE id = ${rr.id}
            LIMIT 1
            FOR UPDATE;`
        );
        console.log("tx1.lastAccountDetail:", lastAccountDetail);

        await tx.$executeRaw(
          Prisma.sql`
            SELECT pg_sleep(8);`
        );

        if (lastAccountDetail === null || lastAccountDetail === undefined) {
          throw new Error("not found account detail");
        }
      },
      { timeout: 10000 }
    );
  }, 10000);
});
