import Link from "next/link";
import { AppShell, Card, Stat, Tag } from "@/components/ui";
import { depositAction, syncViewsAction } from "@/app/actions";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { compactNumber, rub } from "@/lib/money";

export default async function ClientPage() {
  const user = await requireUser();
  const campaigns = await prisma.campaign.findMany({
    where: user.role === "ADMIN" ? {} : { ownerId: user.id },
    include: { submissions: true },
    orderBy: { createdAt: "desc" }
  });
  const totalViews = campaigns.reduce((sum, campaign) => sum + campaign.submissions.reduce((inner, sub) => inner + sub.currentViews, 0), 0);
  const totalBudget = campaigns.reduce((sum, campaign) => sum + campaign.totalBudgetCents, 0);
  const remaining = campaigns.reduce((sum, campaign) => sum + campaign.remainingBudgetCents, 0);

  return (
    <AppShell>
      <section className="section hero">
        <div className="hero-panel">
          <span className="eyebrow">Кабинет заказчика</span>
          <h1>{user.name} управляет CPV-кампаниями.</h1>
          <p className="lead">Баланс, резерв, просмотры, топ-клипы и бюджеты обновляются из базы. Demo-пополнение работает сразу, реальные ЮKassa/Stripe подключаются через `.env`.</p>
          <div className="actions"><Link className="btn btn-primary" href="/campaigns/new">Новая кампания</Link><Link className="btn" href="/wallet">Wallet</Link></div>
        </div>
        <Card>
          <h2>Баланс</h2>
          <div className="row"><span>Доступно</span><strong className="money">{rub(user.balanceCents)}</strong></div>
          <div className="row"><span>В резерве</span><strong>{rub(user.holdBalanceCents)}</strong></div>
          <div className="row"><span>Всего бюджетов</span><strong>{rub(totalBudget)}</strong></div>
          <form className="form" action={depositAction}>
            <input type="hidden" name="provider" value="yookassa" />
            <label className="field">Пополнить, ₽<input name="amount" type="number" defaultValue="50000" /></label>
            <button className="btn btn-primary" type="submit">Demo top-up ЮKassa</button>
          </form>
        </Card>
      </section>
      <section className="section grid grid-5">
        <Stat value={campaigns.length} label="кампаний" />
        <Stat value={compactNumber(totalViews)} label="просмотров" />
        <Stat value={rub(remaining)} label="остаток бюджетов" />
        <Stat value="x3.4" label="AI ROI predictor" tone="good" />
        <Stat value="2.8%" label="fraud rejection" />
      </section>
      <section className="section grid grid-2">
        <Card>
          <div className="actions"><h2>Активные кампании</h2><form action={syncViewsAction}><button className="btn btn-small" type="submit">Sync views</button></form></div>
          {campaigns.map((campaign) => (
            <div className="row" key={campaign.id}>
              <div className="avatar">{campaign.title.slice(0, 2).toUpperCase()}</div>
              <div><strong><Link href={`/campaigns/${campaign.id}`}>{campaign.title}</Link></strong><p className="small">{rub(campaign.cpmRateCents)} / 1K · {campaign.submissions.length} публикаций</p></div>
              <Tag tone={campaign.status === "LOW_BUDGET" ? "warn" : "good"}>{campaign.status}</Tag>
            </div>
          ))}
        </Card>
        <Card>
          <h2>Топ-клипы</h2>
          {campaigns.flatMap((campaign) => campaign.submissions.map((submission) => ({ ...submission, campaignTitle: campaign.title }))).sort((a, b) => b.currentViews - a.currentViews).slice(0, 5).map((submission) => (
            <div className="row" key={submission.id}>
              <div><strong>{submission.trackingCode}</strong><p className="small">{submission.campaignTitle}</p></div>
              <strong>{compactNumber(submission.currentViews)}</strong>
              <Tag tone={submission.fraudScore > 70 ? "warn" : "good"}>{submission.fraudScore}/100</Tag>
            </div>
          ))}
        </Card>
      </section>
    </AppShell>
  );
}
