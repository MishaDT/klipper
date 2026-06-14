import { AppShell, Card, Stat, Tag } from "@/components/ui";
import { depositAction, withdrawAction } from "@/app/actions";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rub } from "@/lib/money";

export default async function WalletPage() {
  const user = await requireUser();
  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 30
  });

  return (
    <AppShell>
      <section className="section">
        <span className="eyebrow">Wallet ledger</span>
        <h1>Баланс, пополнения, выводы и выплаты.</h1>
      </section>
      <section className="section grid grid-4">
        <Stat value={rub(user.balanceCents)} label="доступно" tone="good" />
        <Stat value={rub(user.holdBalanceCents)} label="hold / settlement" />
        <Stat value={transactions.length} label="операций" />
        <Stat value={user.kycStatus} label="KYC" />
      </section>
      <section className="section grid grid-2">
        <Card>
          <h2>Пополнить</h2>
          <form className="form" action={depositAction}>
            <label className="field">Сумма, ₽<input name="amount" type="number" defaultValue="50000" /></label>
            <label className="field">Провайдер<select name="provider"><option value="yookassa">ЮKassa</option><option value="stripe">Stripe</option></select></label>
            <button className="btn btn-primary" type="submit">Создать платеж</button>
          </form>
        </Card>
        <Card>
          <h2>Вывести</h2>
          <form className="form" action={withdrawAction}>
            <label className="field">Сумма, ₽<input name="amount" type="number" defaultValue="5000" /></label>
            <button className="btn btn-primary" type="submit">Создать заявку</button>
          </form>
          <p className="small">Fee вывода: ₽50 + 1%. Для реальных выплат нужно подключить платежного провайдера.</p>
        </Card>
      </section>
      <section className="section card table-wrap">
        <table>
          <thead><tr><th>Дата</th><th>Тип</th><th>Сумма</th><th>Fee</th><th>Net</th><th>Статус</th></tr></thead>
          <tbody>{transactions.map((tx) => (
            <tr key={tx.id}><td>{tx.createdAt.toLocaleString("ru-RU")}</td><td>{tx.type}</td><td>{rub(tx.amountCents)}</td><td>{rub(tx.feeCents)}</td><td>{rub(tx.netCents)}</td><td><Tag tone={tx.status === "COMPLETED" ? "good" : "warn"}>{tx.status}</Tag></td></tr>
          ))}</tbody>
        </table>
      </section>
    </AppShell>
  );
}
