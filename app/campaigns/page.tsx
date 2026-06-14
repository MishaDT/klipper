import Link from "next/link";
import { AppShell, Card, Stat, Tag } from "@/components/ui";
import { joinCampaignAction } from "@/app/actions";
import { prisma } from "@/lib/prisma";
import { parseJson } from "@/lib/json";
import { compactNumber, rub } from "@/lib/money";

export default async function CampaignsPage() {
  const campaigns = await prisma.campaign.findMany({
    include: { owner: true, submissions: true },
    orderBy: [{ visibility: "asc" }, { createdAt: "desc" }]
  });

  return (
    <AppShell>
      <section className="section">
        <span className="eyebrow">Smart marketplace</span>
        <h1>Кампании, где клиппер может заработать сегодня.</h1>
        <div className="actions">
          <Link className="btn btn-primary" href="/campaigns/new">Создать кампанию</Link>
          <Link className="btn" href="/clipper">Мои публикации</Link>
        </div>
      </section>
      <section className="section grid">
        {campaigns.map((campaign) => {
          const platforms = parseJson<string[]>(campaign.allowedPlatformsJson, []);
          const metrics = parseJson<{ views?: number; fillRate?: number }>(campaign.metricsJson, {});
          return (
            <Card className="campaign-card" key={campaign.id}>
              <div className="campaign-head">
                <div>
                  <Tag tone={campaign.visibility === "FEATURED" ? "live" : campaign.status === "LOW_BUDGET" ? "warn" : "good"}>{campaign.visibility === "FEATURED" ? "Featured" : campaign.status}</Tag>
                  <h2><Link href={`/campaigns/${campaign.id}`}>{campaign.title}</Link></h2>
                  <p className="muted">{campaign.description}</p>
                </div>
                <div className="price">{rub(campaign.cpmRateCents)} / 1K</div>
              </div>
              <div className="actions">{platforms.map((platform) => <Tag key={platform}>{platform}</Tag>)}</div>
              <div className="grid grid-5">
                <Stat value={rub(campaign.remainingBudgetCents)} label="остаток" />
                <Stat value={compactNumber(campaign.viewThreshold)} label="порог" />
                <Stat value={campaign.submissions.length} label="публикаций" />
                <Stat value={compactNumber(metrics.views || 0)} label="просмотров" />
                <Stat value={`${Math.round((metrics.fillRate || 0) * 100)}%`} label="fill rate" />
              </div>
              <div className="progress"><span style={{ width: `${Math.min(100, Math.round((1 - campaign.remainingBudgetCents / campaign.totalBudgetCents) * 100))}%` }} /></div>
              <form action={joinCampaignAction}>
                <input type="hidden" name="campaignId" value={campaign.id} />
                <button className="btn btn-primary" type="submit">Участвовать</button>
              </form>
            </Card>
          );
        })}
      </section>
    </AppShell>
  );
}
