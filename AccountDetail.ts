export class AccountDetail {
  id: number | null;
  accountId: number;
  balance: number;

  constructor(accountId: number, balance: number, id?: number | null) {
    this.id = id ?? null;
    this.accountId = accountId;
    this.balance = balance;
  }

  use(amount: number) {
    if (this.balance < amount) {
      throw new Error("not enough balance");
    }

    return new AccountDetail(this.accountId, this.balance - amount);
  }
}
