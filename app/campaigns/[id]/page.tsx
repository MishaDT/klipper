import { notFound } from "next/navigation";
import { AppShell, Card, Stat, Tag } from "@/components/ui";
import { joinCampaignAction } from "@/app/actions";
import { prisma } from "@/lib/prisma";
import { parseJson } from "@/lib/json";
import { compactNumber, rub } from "@/lib/money";

export default async function CampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: { owner: true, submissions: { include: { worker: true }, orderBy: { currentViews: "desc" } } }
  });
  if (!campaign) notFound();
  const platforms = parseJson<string[]>(campaign.allowedPlatformsJson, []);
  const rules = parseJson<{ requiredTags?: string[]; bans?: string[]; watermarkBonus?: boolean }>(campaign.rulesJson, {});

  return (
    <AppShell>
      <section className="section">
        <span className="eyebrow">{campaign.trackingPrefix}</span>
        <h1>{campaign.title}</h1>
        <p className="lead">{campaign.description}</p>
        <div className="actions">{platforms.map((platform) => <Tag key={platform}>{platform}</Tag>)}{rules.watermarkBonus ? <Tag tone="good">Watermark +5%</Tag> : null}</div>
      </section>
      <section className="section grid grid-5">
        <Stat value={rub(campaign.cpmRateCents)} label="за 1000 просмотров" />
        <Stat value={rub(campaign.remainingBudgetCents)} label="остаток бюджета" />
        <Stat value={compactNumber(campaign.viewThreshold)} label="порог выплаты" />
        <Stat value={campaign.submissions.length} label="публикаций" />
        <Stat value={campaign.status} label="статус" />
      </section>
      <section className="section grid grid-2">
        <Card>
          <h2>Правила кампании</h2>
          <div className="row"><span>Источник</span><strong>{campaign.sourcePlatform}</strong></div>
          <div className="row"><span>Обязательные теги</span><strong>{rules.requiredTags?.join(", ") || "не заданы"}</strong></div>
          <div className="row"><span>Запреты</span><strong>{rules.bans?.join(", ") || "нет"}</strong></div>
          <div className="row"><span>Дедлайн</span><strong>{campaign.deadline.toLocaleDateString("ru-RU")}</strong></div>
          <form action={joinCampaignAction}>
            <input type="hidden" name="campaignId" value={campaign.id} />
            <button className="btn btn-primary" type="submit">Взять в работу</button>
          </form>
        </Card>
        <Card>
          <h2>AI Earnings Predictor</h2>
          <p className="lead">{rub(Math.round(campaign.cpmRateCents * campaign.viewThreshold / 1000 * 0.72))} - {rub(Math.round(campaign.cpmRateCents * campaign.viewThreshold / 1000 * 1.8))}</p>
          <p className="muted">Прогноз учитывает ставку, порог, нишу, текущие просмотры, площадки и Trust Score клиппера.</p>
        </Card>
      </section>
      <section className="section card table-wrap">
        <table>
          <thead><tr><th>Клиппер</th><th>Платформа</th><th>Views</th><th>Fraud</th><th>Статус</th></tr></thead>
          <tbody>{campaign.submissions.map((submission) => (
            <tr key={submission.id}><td>@{submission.worker.handle}</td><td>{submission.platform}</td><td>{compactNumber(submission.currentViews)}</td><td>{submission.fraudScore}/100</td><td>{submission.status}</td></tr>
          ))}</tbody>
        </table>
      </section>
    </AppShell>
  );
}
