import Link from "next/link";
import { AppShell, Card, Stat, Tag } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { compactNumber, rub } from "@/lib/money";

export default async function HomePage() {
  const [campaigns, users, submissions, paid] = await Promise.all([
    prisma.campaign.count({ where: { status: { in: ["ACTIVE", "LOW_BUDGET"] } } }),
    prisma.user.count(),
    prisma.submission.aggregate({ _sum: { currentViews: true }, _count: true }),
    prisma.transaction.aggregate({ where: { type: "EARNING" }, _sum: { netCents: true } })
  ]);

  return (
    <AppShell>
      <section className="section hero">
        <div className="hero-panel">
          <span className="eyebrow">UGC CPV marketplace · рабочий MVP</span>
          <h1>Блогер платит за реальные просмотры. Клиппер зарабатывает на чужих стримах.</h1>
          <p className="lead">Кампании, публикации, просмотры, антифрод, выплаты и аналитика собраны в одном приложении. Осталось только подключить реальные платежные ключи и API соцсетей.</p>
          <div className="actions">
            <Link className="btn btn-primary" href="/campaigns/new">Создать кампанию</Link>
            <Link className="btn btn-light" href="/campaigns">Найти кампанию</Link>
            <Link className="btn" href="/ai-studio">AI Studio</Link>
          </div>
        </div>
        <div className="hero-art" />
      </section>
      <section className="section grid grid-4">
        <Stat value={campaigns} label="активных кампаний" />
        <Stat value={users} label="пользователей в базе" />
        <Stat value={compactNumber(submissions._sum.currentViews || 0)} label="просмотров отслеживается" />
        <Stat value={rub(paid._sum.netCents || 0)} label="выплат клипперам" tone="good" />
      </section>
      <section className="section grid grid-3">
        <Card>
          <Tag>Заказчик</Tag>
          <h2>Запуск CPV</h2>
          <p className="muted">Вносит бюджет, задает CPV, порог, площадки, запреты и видит ROI по каждому клипу.</p>
        </Card>
        <Card>
          <Tag tone="good">Клиппер</Tag>
          <h2>Доход за клипы</h2>
          <p className="muted">Берет кампанию, публикует ролик с tracking-code, проходит проверку и получает выплату.</p>
        </Card>
        <Card>
          <Tag tone="warn">Платформа</Tag>
          <h2>15% take rate</h2>
          <p className="muted">Считает просмотры, ловит фрод, ведет wallet ledger и готовит платежи через ЮKassa/Stripe.</p>
        </Card>
      </section>
    </AppShell>
  );
}
