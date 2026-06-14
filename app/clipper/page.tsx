import Link from "next/link";
import { AppShell, Card, Stat, Tag } from "@/components/ui";
import { submitClipAction, syncViewsAction, withdrawAction } from "@/app/actions";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { compactNumber, commissionRate, rub } from "@/lib/money";

export default async function ClipperPage() {
  const user = await requireUser();
  const submissions = await prisma.submission.findMany({
    where: { workerId: user.id },
    include: { campaign: true },
    orderBy: { updatedAt: "desc" }
  });
  const achievements = await prisma.userAchievement.findMany({ where: { userId: user.id }, include: { achievement: true } });
  const lifetimeViews = submissions.reduce((sum, submission) => sum + submission.currentViews, user.lifetimeViews);

  return (
    <AppShell>
      <section className="section hero">
        <div className="hero-panel">
          <span className="eyebrow">Публичный профиль · /u/{user.handle}</span>
          <h1>{user.name}, {user.rank}-клиппер с Trust Score {user.trustScore}.</h1>
          <p className="lead">Ранги, streak, выплаты и публикации подтягиваются из базы. Можно брать кампании, отправлять ссылки и запускать mock sync просмотров.</p>
          <div className="actions"><Link className="btn btn-primary" href="/campaigns">Взять кампанию</Link><form action={syncViewsAction}><button className="btn" type="submit">Sync views</button></form></div>
        </div>
        <Card>
          <h2>Wallet</h2>
          <div className="row"><span>Доступно</span><strong className="money">{rub(user.balanceCents)}</strong></div>
          <div className="row"><span>В settlement</span><strong>{rub(user.holdBalanceCents)}</strong></div>
          <div className="row"><span>Комиссия ранга</span><strong>{Math.round(commissionRate(user.rank) * 100)}%</strong></div>
          <form className="form" action={withdrawAction}>
            <label className="field">Вывести, ₽<input name="amount" type="number" defaultValue="5000" /></label>
            <button className="btn btn-primary" type="submit">Создать вывод</button>
          </form>
        </Card>
      </section>
      <section className="section grid grid-5">
        <Stat value={compactNumber(lifetimeViews)} label="lifetime views" />
        <Stat value={user.streakDays} label="streak days" />
        <Stat value={submissions.length} label="публикаций" />
        <Stat value={user.rank} label="ранг" />
        <Stat value={user.trustScore} label="Trust Score" tone="good" />
      </section>
      <section className="section grid grid-2">
        <Card>
          <h2>Мои кампании</h2>
          {submissions.map((submission) => (
            <div className="row" key={submission.id}>
              <div><strong>{submission.campaign.title}</strong><p className="small">{submission.trackingCode} · {submission.platform} · {compactNumber(submission.currentViews)} views</p></div>
              <Tag tone={submission.status === "REJECTED" ? "warn" : "good"}>{submission.status}</Tag>
            </div>
          ))}
        </Card>
        <Card>
          <h2>Отправить ссылку</h2>
          <form className="form" action={submitClipAction}>
            <label className="field">Submission<select name="submissionId">{submissions.map((submission) => <option value={submission.id} key={submission.id}>{submission.trackingCode}</option>)}</select></label>
            <label className="field">Платформа<select name="platform" defaultValue="TIKTOK"><option value="TIKTOK">TikTok</option><option value="YOUTUBE">YouTube Shorts</option><option value="INSTAGRAM">Instagram Reels</option><option value="VK">VK Clips</option><option value="TWITCH">Twitch Clips</option></select></label>
            <label className="field">URL поста<input name="postUrl" defaultValue="https://tiktok.com/@anya_clips/video/new" /></label>
            <button className="btn btn-primary" type="submit">Отправить на проверку</button>
          </form>
        </Card>
      </section>
      <section className="section grid grid-3">
        {achievements.map(({ achievement }) => <Card key={achievement.id}><Tag tone="good">{achievement.icon}</Tag><h3>{achievement.title}</h3><p className="muted">{achievement.description}</p></Card>)}
      </section>
    </AppShell>
  );
}
